const pool = require('../db');

// Issue book to student
exports.issueBook = async (req, res) => {
    try {
        const { userID, bookID, issueDate, dueDate } = req.body;

        if (!userID || !bookID || !issueDate || !dueDate) {
            return res.status(400).json({ message: "Required fields missing" });
        }

        const request = pool.request();
        request.input('userID', userID);
        request.input('bookID', bookID);

        // 1. CHECK BORROW LIMIT
        const limitResult = await request.query(`
            SELECT COUNT(*) AS ActiveBooks FROM BorrowTransactions 
            WHERE UserID = @userID AND ReturnDate IS NULL
        `);

        if (limitResult.recordset[0].ActiveBooks >= 3) {
            return res.status(400).json({ message: "Borrow limit reached (max 3 books)" });
        }

        // 2. CHECK OVERDUE
        const overdueResult = await request.query(`
            SELECT COUNT(*) AS OverdueBooks FROM BorrowTransactions 
            WHERE UserID = @userID AND ReturnDate IS NULL AND DueDate < GETDATE()
        `);

        if (overdueResult.recordset[0].OverdueBooks > 0) {
            return res.status(400).json({ message: "User has overdue books" });
        }

        // 3. CHECK AVAILABILITY & ISSUE
        const bookResult = await request.query("SELECT AvailableCopies FROM Books WHERE BookID = @bookID");
        if (bookResult.recordset[0].AvailableCopies <= 0) {
            return res.status(400).json({ message: "Book not available" });
        }

        const transRequest = pool.request();
        transRequest.input('userID', userID);
        transRequest.input('bookID', bookID);
        transRequest.input('issueDate', issueDate);
        transRequest.input('dueDate', dueDate);

        await transRequest.query(`
            INSERT INTO BorrowTransactions (UserID, BookID, IssueDate, DueDate, ReturnDate)
            VALUES (@userID, @bookID, @issueDate, @dueDate, NULL);
            UPDATE Books SET AvailableCopies = AvailableCopies - 1 WHERE BookID = @bookID;
        `);

        return res.status(201).json({ message: "Book issued successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error issuing book", error: err.message });
    }
};

// Return book - UPDATED


// Return book - FIXED WITH TRANSACTION
exports.returnBook = async (req, res) => {
    let transaction;
    try {
        // Log this to your terminal to see what the frontend is actually sending
        console.log("Request Body Received:", req.body);

        // Accept either casing to be safe
        const transactionID = req.body.transactionID || req.body.TransactionID;
        const { returnDate } = req.body;

        if (!transactionID || !returnDate) {
            return res.status(400).json({ 
                message: "Data missing", 
                received: { transactionID, returnDate } 
            });
        }

        transaction = new (require('mssql')).Transaction(pool);
        await transaction.begin();

        const request = transaction.request();
        request.input('transactionID', transactionID);
        request.input('returnDate', returnDate);

        const record = await request.query("SELECT BookID, ReturnDate FROM BorrowTransactions WHERE TransactionID = @transactionID");
        
        if (record.recordset.length === 0) {
            await transaction.rollback();
            return res.status(404).json({ message: "Transaction record not found" });
        }

        if (record.recordset[0].ReturnDate) {
            await transaction.rollback();
            return res.status(400).json({ message: "Book has already been returned" });
        }
        
        const bookID = record.recordset[0].BookID;
        request.input('bookID', bookID);

        await request.query(`
            UPDATE BorrowTransactions SET ReturnDate = @returnDate WHERE TransactionID = @transactionID;
            UPDATE Books SET AvailableCopies = AvailableCopies + 1 WHERE BookID = @bookID;
        `);

        await transaction.commit();
        return res.status(200).json({ message: "Book returned successfully" });
    } catch (err) {
        if (transaction) await transaction.rollback();
        console.error("Return Error:", err);
        res.status(500).json({ message: "Error returning book", error: err.message });
    }
};
// Get student's books - UPDATED
exports.getStudentBooks = async (req, res) => {
    try {
        const { userID } = req.params;
        const query = `
            SELECT bt.TransactionID, bt.IssueDate, bt.DueDate, bt.ReturnDate,
                   b.Title, b.ISBN, STRING_AGG(a.AuthorName, ', ') as Authors
            FROM BorrowTransactions bt
            JOIN Books b ON bt.BookID = b.BookID
            LEFT JOIN BookAuthors ba ON b.BookID = ba.BookID
            LEFT JOIN Authors a ON ba.AuthorID = a.AuthorID
            WHERE bt.UserID = @userID
            GROUP BY bt.TransactionID, bt.IssueDate, bt.DueDate, bt.ReturnDate, b.Title, b.ISBN
        `;
        const request = pool.request();
        request.input('userID', userID);
        const result = await request.query(query);
        res.status(200).json({ books: result.recordset });
    } catch (err) {
        res.status(500).json({ message: "Error", error: err.message });
    }
};