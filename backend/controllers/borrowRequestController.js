const pool = require('../db');

// Create borrow request (Student action)
exports.createBorrowRequest = async (req, res) => {
    try {
        const { userID, bookID } = req.body;

        if (!userID || !bookID) {
            return res.status(400).json({ message: "User ID and Book ID required" });
        }

        // Check if book exists and is available
        const bookRequest = pool.request();
        bookRequest.input('bookID', bookID);
        const bookResult = await bookRequest.query('SELECT * FROM Books WHERE BookID = @bookID');

        if (bookResult.recordset.length === 0) {
            return res.status(404).json({ message: "Book not found" });
        }

        if (bookResult.recordset[0].AvailableCopies <= 0) {
            return res.status(400).json({ message: "Book not available" });
        }

        // Check if pending request already exists
        const checkRequest = pool.request();
        checkRequest.input('userID', userID);
        checkRequest.input('bookID', bookID);
        const existingResult = await checkRequest.query(
            "SELECT * FROM BorrowTransactions WHERE UserID = @userID AND BookID = @bookID AND Status = 'Pending'"
        );

        if (existingResult.recordset.length > 0) {
            return res.status(400).json({ message: "Request already exists for this book" });
        }

        // Create pending request
        const insertRequest = pool.request();
        insertRequest.input('userID', userID);
        insertRequest.input('bookID', bookID);
        const insertResult = await insertRequest.query(
            "INSERT INTO BorrowTransactions (UserID, BookID, Status) VALUES (@userID, @bookID, 'Pending'); SELECT SCOPE_IDENTITY() as TransactionID;"
        );

        return res.status(201).json({
            message: "Borrow request created successfully",
            transactionID: insertResult.recordset[0].TransactionID
        });
    } catch (err) {
        console.error('Create request error:', err);
        return res.status(500).json({
            message: "Error creating borrow request",
            error: err.message
        });
    }
};

// Get all pending requests (Admin action)
exports.getPendingRequests = async (req, res) => {
    try {
        const query = `
            SELECT bt.TransactionID, bt.UserID, bt.BookID, bt.Status,
                   u.Name as UserName, u.Email,
                   b.Title, b.ISBN, b.Publisher,
                   STRING_AGG(a.AuthorName, ', ') as Authors
            FROM BorrowTransactions bt
            JOIN Users u ON bt.UserID = u.UserID
            JOIN Books b ON bt.BookID = b.BookID
            LEFT JOIN BookAuthors ba ON b.BookID = ba.BookID
            LEFT JOIN Authors a ON ba.AuthorID = a.AuthorID
            WHERE bt.Status = 'Pending'
            GROUP BY bt.TransactionID, bt.UserID, bt.BookID, bt.Status,
                     u.Name, u.Email, b.Title, b.ISBN, b.Publisher
            ORDER BY bt.TransactionID DESC
        `;

        const result = await pool.request().query(query);
        return res.status(200).json({ requests: result.recordset });
    } catch (err) {
        console.error('Get requests error:', err);
        return res.status(500).json({
            message: "Error fetching borrow requests",
            error: err.message
        });
    }
};

// Issue book (Admin action - approves request and sets dates)
exports.issueBorrowRequest = async (req, res) => {
    try {
        const { transactionID, issueDate, dueDate } = req.body;

        if (!transactionID || !issueDate || !dueDate) {
            return res.status(400).json({ message: "Required fields missing" });
        }

        // Get transaction details
        const txnRequest = pool.request();
        txnRequest.input('transactionID', transactionID);
        const txnResult = await txnRequest.query('SELECT * FROM BorrowTransactions WHERE TransactionID = @transactionID');

        if (txnResult.recordset.length === 0) {
            return res.status(404).json({ message: "Request not found" });
        }

        const transaction = txnResult.recordset[0];
        const userID = transaction.UserID;
        const bookID = transaction.BookID;

        // Check borrow limit
        const limitRequest = pool.request();
        limitRequest.input('userID', userID);
        const limitResult = await limitRequest.query(
            "SELECT COUNT(*) AS ActiveBooks FROM BorrowTransactions WHERE UserID = @userID AND ReturnDate IS NULL AND Status = 'Approved'"
        );

        if (limitResult.recordset[0].ActiveBooks >= 3) {
            return res.status(400).json({
                message: "Borrow limit reached (max 3 books allowed)"
            });
        }

        // Check overdue books
        const overdueRequest = pool.request();
        overdueRequest.input('userID', userID);
        const overdueResult = await overdueRequest.query(
            "SELECT COUNT(*) AS OverdueBooks FROM BorrowTransactions WHERE UserID = @userID AND ReturnDate IS NULL AND DueDate < GETDATE() AND Status = 'Approved'"
        );

        if (overdueResult.recordset[0].OverdueBooks > 0) {
            return res.status(400).json({
                message: "Cannot issue book: user has overdue books"
            });
        }

        // Check unpaid fines
        const fineRequest = pool.request();
        fineRequest.input('userID', userID);
        const fineResult = await fineRequest.query(
            "SELECT COUNT(*) AS UnpaidFines FROM Fines f JOIN BorrowTransactions bt ON f.TransactionID = bt.TransactionID WHERE bt.UserID = @userID AND f.PaidStatus = 'Unpaid'"
        );

        if (fineResult.recordset[0].UnpaidFines > 0) {
            return res.status(400).json({
                message: "Cannot issue book: unpaid fines exist"
            });
        }

        // Check book availability
        const bookRequest = pool.request();
        bookRequest.input('bookID', bookID);
        const bookResult = await bookRequest.query('SELECT AvailableCopies FROM Books WHERE BookID = @bookID');

        if (bookResult.recordset[0].AvailableCopies <= 0) {
            return res.status(400).json({ message: "Book not available" });
        }

        // Update transaction with dates and approve
        const updateRequest = pool.request();
        updateRequest.input('transactionID', transactionID);
        updateRequest.input('issueDate', issueDate);
        updateRequest.input('dueDate', dueDate);
        await updateRequest.query(
            "UPDATE BorrowTransactions SET IssueDate = @issueDate, DueDate = @dueDate, Status = 'Approved' WHERE TransactionID = @transactionID"
        );

        // Decrease available copies
        const copyRequest = pool.request();
        copyRequest.input('bookID', bookID);
        await copyRequest.query('UPDATE Books SET AvailableCopies = AvailableCopies - 1 WHERE BookID = @bookID');

        return res.status(201).json({
            message: "Book issued successfully",
            transactionID: transactionID
        });
    } catch (err) {
        console.error('Issue request error:', err);
        return res.status(500).json({
            message: "Error issuing book",
            error: err.message
        });
    }
};

// Reject borrow request (Admin action)
exports.rejectBorrowRequest = async (req, res) => {
    try {
        const { transactionID } = req.body;

        if (!transactionID) {
            return res.status(400).json({ message: "Transaction ID required" });
        }

        const request = pool.request();
        request.input('transactionID', transactionID);
        await request.query("UPDATE BorrowTransactions SET Status = 'Rejected' WHERE TransactionID = @transactionID");

        return res.status(200).json({ message: "Request rejected successfully" });
    } catch (err) {
        console.error('Reject request error:', err);
        return res.status(500).json({
            message: "Error rejecting request",
            error: err.message
        });
    }
};

// Return book (Student action - marks book as returned & auto-calculates fine if overdue)
exports.returnBook = async (req, res) => {
    try {
        const { transactionID, returnDate } = req.body;

        if (!transactionID || !returnDate) {
            return res.status(400).json({
                message: "Data missing - transactionID and returnDate required"
            });
        }

        // 1. Get transaction with book details
        const transactionResult = await pool.request()
            .input('transactionID', transactionID)
            .query(`
                SELECT bt.*, b.Title as BookTitle
                FROM BorrowTransactions bt
                JOIN Books b ON bt.BookID = b.BookID
                WHERE bt.TransactionID = @transactionID
            `);

        if (transactionResult.recordset.length === 0) {
            return res.status(404).json({
                message: "Transaction not found"
            });
        }

        const transaction = transactionResult.recordset[0];

        // Check if already returned
        if (transaction.ReturnDate) {
            return res.status(400).json({
                message: "Book has already been returned"
            });
        }

        // 2. Update return date
        await pool.request()
            .input('transactionID', transactionID)
            .input('returnDate', returnDate)
            .query(`
                UPDATE BorrowTransactions
                SET ReturnDate = @returnDate
                WHERE TransactionID = @transactionID
            `);

        // 3. Increase available copies
        await pool.request()
            .input('bookID', transaction.BookID)
            .query(`
                UPDATE Books
                SET AvailableCopies = AvailableCopies + 1
                WHERE BookID = @bookID
            `);

        // 4. AUTO-CREATE FINE IF OVERDUE
        const returnDateObj = new Date(returnDate);
        const dueDateObj = new Date(transaction.DueDate);
        
        if (returnDateObj > dueDateObj) {
            const daysOverdue = Math.ceil((returnDateObj - dueDateObj) / (1000 * 60 * 60 * 24));
            const fineAmount = daysOverdue * 10; // 10 PKR per day

            await pool.request()
                .input('transactionID', transactionID)
                .input('fineAmount', fineAmount)
                .input('daysOverdue', daysOverdue)
                .input('bookTitle', transaction.BookTitle)
                .input('dueDate', transaction.DueDate)
                .input('returnDate', returnDate)
                .query(`
                    INSERT INTO Fines (TransactionID, FineAmount, DaysOverdue, BookTitle, DueDate, ReturnDate, PaidStatus)
                    VALUES (@transactionID, @fineAmount, @daysOverdue, @bookTitle, @dueDate, @returnDate, 'Unpaid')
                `);
        }

        return res.status(200).json({
            message: "Book returned successfully"
        });

    } catch (err) {
        console.error("Return book error:", err);

        return res.status(500).json({
            message: "Error returning book",
            error: err.message
        });
    }
};