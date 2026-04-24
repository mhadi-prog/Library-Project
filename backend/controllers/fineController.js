const pool = require('../db');

// Calculate fines for overdue books
exports.calculateFines = async (req, res) => {
    try {
        const finePerDay = 10; // Rs. 10 per day

        const query = `
            SELECT bt.TransactionID, bt.UserID, bt.DueDate, GETDATE() as CurrentDate,
                   DATEDIFF(DAY, bt.DueDate, GETDATE()) as OverdueDays,
                   b.Title,
                   CASE 
                       WHEN bt.ReturnDate IS NULL AND DATEDIFF(DAY, bt.DueDate, GETDATE()) > 0 
                       THEN DATEDIFF(DAY, bt.DueDate, GETDATE()) * @finePerDay
                       ELSE 0
                   END as CalculatedFine
            FROM BorrowTransactions bt
            JOIN Books b ON bt.BookID = b.BookID
            WHERE bt.ReturnDate IS NULL AND DATEDIFF(DAY, bt.DueDate, GETDATE()) > 0
        `;

        const request = pool.request();
        request.input('finePerDay', finePerDay);
        const result = await request.query(query);

        return res.status(200).json({ overdueBooks: result.recordset });
    } catch (err) {
        console.error('Calculate fines error:', err);
        return res.status(500).json({ message: "Error calculating fines", error: err.message });
    }
};

// Get fines for specific student
exports.getStudentFines = async (req, res) => {
    try {
        const { userID } = req.params;

        const query = `
            SELECT f.FineID, f.TransactionID, f.Amount, f.PaidStatus,
                   bt.UserID, bt.IssueDate, bt.DueDate, bt.ReturnDate,
                   b.Title, b.ISBN
            FROM Fines f
            JOIN BorrowTransactions bt ON f.TransactionID = bt.TransactionID
            JOIN Books b ON bt.BookID = b.BookID
            WHERE bt.UserID = @userID
        `;

        const request = pool.request();
        request.input('userID', userID);
        const result = await request.query(query);

        return res.status(200).json({ fines: result.recordset });
    } catch (err) {
        console.error('Get student fines error:', err);
        return res.status(500).json({ message: "Error fetching fines", error: err.message });
    }
};

// Record fine payment
exports.payFine = async (req, res) => {
    try {
        const { fineID, amount, paymentDate } = req.body;

        if (!fineID || !amount) {
            return res.status(400).json({ message: "Fine ID and amount required" });
        }

        // Record payment
        const paymentQuery = `
            INSERT INTO Payments (FineID, PaymentDate, Amount)
            VALUES (@fineID, @paymentDate, @amount);
        `;

        const paymentRequest = pool.request();
        paymentRequest.input('fineID', fineID);
        paymentRequest.input('paymentDate', paymentDate || new Date());
        paymentRequest.input('amount', amount);
        await paymentRequest.query(paymentQuery);

        // Update fine status to Paid
        const updateQuery = `
            UPDATE Fines
            SET PaidStatus = 'Paid'
            WHERE FineID = @fineID
        `;

        const updateRequest = pool.request();
        updateRequest.input('fineID', fineID);
        await updateRequest.query(updateQuery);

        return res.status(200).json({ message: "Payment recorded successfully" });
    } catch (err) {
        console.error('Pay fine error:', err);
        return res.status(500).json({ message: "Error processing payment", error: err.message });
    }
};