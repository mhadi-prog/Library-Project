const pool = require('../db');

// Issue book to student
exports.issueBook = async (req, res) => {
    try {
        const { userID, bookID, issueDate, dueDate } = req.body;

        if (!userID || !bookID || !issueDate || !dueDate) {
            return res.status(400).json({ message: "Required fields missing" });
        }

        // Check if book is available
        const bookQuery = `SELECT AvailableCopies FROM Books WHERE BookID = @bookID`;
        const bookRequest = pool.request();
        bookRequest.input('bookID', bookID);
        const bookResult = await bookRequest.query(bookQuery);

        if (bookResult.recordset.length === 0) {
            return res.status(404).json({ message: "Book not found" });
        }

        if (bookResult.recordset[0].AvailableCopies <= 0) {
            return res.status(400).json({ message: "Book not available" });
        }

        // Create transaction
        const transactionQuery = `
            INSERT INTO BorrowTransactions (UserID, BookID, IssueDate, DueDate, ReturnDate)
            VALUES (@userID, @bookID, @issueDate, @dueDate, NULL);
            SELECT SCOPE_IDENTITY() as TransactionID;
        `;

        const transRequest = pool.request();
        transRequest.input('userID', userID);
        transRequest.input('bookID', bookID);
        transRequest.input('issueDate', issueDate);
        transRequest.input('dueDate', dueDate);
        const transResult = await transRequest.query(transactionQuery);

        // Update available copies
        const updateQuery = `
            UPDATE Books
            SET AvailableCopies = AvailableCopies - 1
            WHERE BookID = @bookID
        `;

        const updateRequest = pool.request();
        updateRequest.input('bookID', bookID);
        await updateRequest.query(updateQuery);

        return res.status(201).json({ 
            message: "Book issued successfully", 
            transactionID: transResult.recordset[0].TransactionID 
        });
    } catch (err) {
        console.error('Issue book error:', err);
        return res.status(500).json({ message: "Error issuing book", error: err.message });
    }
};

// Return book
exports.returnBook = async (req, res) => {
    try {
        const { transactionID, returnDate } = req.body;

        if (!transactionID || !returnDate) {
            return res.status(400).json({ message: "Transaction ID and return date required" });
        }

        // Get transaction details
        const getQuery = `SELECT * FROM BorrowTransactions WHERE TransactionID = @transactionID`;
        const getRequest = pool.request();
        getRequest.input('transactionID', transactionID);
        const getResult = await getRequest.query(getQuery);

        if (getResult.recordset.length === 0) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        const transaction = getResult.recordset[0];
        const bookID = transaction.BookID;

        // Update transaction with return date
        const updateQuery = `
            UPDATE BorrowTransactions
            SET ReturnDate = @returnDate
            WHERE TransactionID = @transactionID
        `;

        const updateRequest = pool.request();
        updateRequest.input('transactionID', transactionID);
        updateRequest.input('returnDate', returnDate);
        await updateRequest.query(updateQuery);

        // Increase available copies
        const copyQuery = `
            UPDATE Books
            SET AvailableCopies = AvailableCopies + 1
            WHERE BookID = @bookID
        `;

        const copyRequest = pool.request();
        copyRequest.input('bookID', bookID);
        await copyRequest.query(copyQuery);

        return res.status(200).json({ message: "Book returned successfully" });
    } catch (err) {
        console.error('Return book error:', err);
        return res.status(500).json({ message: "Error returning book", error: err.message });
    }
};

// Get student's borrowed books
exports.getStudentBooks = async (req, res) => {
    try {
        const { userID } = req.params;

        const query = `
            SELECT bt.TransactionID, bt.UserID, bt.IssueDate, bt.DueDate, bt.ReturnDate,
                   b.BookID, b.Title, b.ISBN, b.Publisher, 
                   STRING_AGG(a.AuthorName, ', ') as Authors
            FROM BorrowTransactions bt
            JOIN Books b ON bt.BookID = b.BookID
            LEFT JOIN BookAuthors ba ON b.BookID = ba.BookID
            LEFT JOIN Authors a ON ba.AuthorID = a.AuthorID
            WHERE bt.UserID = @userID
            GROUP BY bt.TransactionID, bt.UserID, bt.IssueDate, bt.DueDate, bt.ReturnDate,
                     b.BookID, b.Title, b.ISBN, b.Publisher
        `;

        const request = pool.request();
        request.input('userID', userID);
        const result = await request.query(query);

        return res.status(200).json({ books: result.recordset });
    } catch (err) {
        console.error('Get student books error:', err);
        return res.status(500).json({ message: "Error fetching student books", error: err.message });
    }
};