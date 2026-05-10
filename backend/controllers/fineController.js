const pool = require('../db');

// ======================================================
// 1. CALCULATE FINES (with UPSERT + safety checks)
// ======================================================
exports.calculateFines = async (req, res) => {
    try {
        const finePerDay = 10;

        const query = `
            SELECT 
                bt.TransactionID,
                bt.UserID,
                bt.DueDate,
                bt.ReturnDate,
                b.Title,
                DATEDIFF(DAY, bt.DueDate, GETDATE()) AS OverdueDays,
                CASE 
                    WHEN bt.ReturnDate IS NULL 
                         AND DATEDIFF(DAY, bt.DueDate, GETDATE()) > 0
                    THEN DATEDIFF(DAY, bt.DueDate, GETDATE()) * @finePerDay
                    ELSE 0
                END AS CalculatedFine
            FROM BorrowTransactions bt
            JOIN Books b ON bt.BookID = b.BookID
            WHERE bt.ReturnDate IS NULL
              AND DATEDIFF(DAY, bt.DueDate, GETDATE()) > 0
        `;

        const request = pool.request();
        request.input('finePerDay', finePerDay);

        const result = await request.query(query);

        for (let row of result.recordset) {
            const fineAmount = Math.max(0, row.CalculatedFine);

            const upsertQuery = `
                IF EXISTS (SELECT 1 FROM Fines WHERE TransactionID = @transactionID)
                BEGIN
                    UPDATE Fines
                    SET FineAmount = @fineAmount
                    WHERE TransactionID = @transactionID
                END
                ELSE
                BEGIN
                    INSERT INTO Fines (TransactionID, FineAmount, PaidStatus)
                    VALUES (@transactionID, @fineAmount, 'Unpaid')
                END
            `;

            const fineRequest = pool.request();
            fineRequest.input('transactionID', row.TransactionID);
            fineRequest.input('fineAmount', fineAmount);

            await fineRequest.query(upsertQuery);
        }

        return res.status(200).json({
            message: "Fines calculated and updated successfully",
            overdueBooks: result.recordset
        });

    } catch (err) {
        console.error('Calculate fines error:', err);
        return res.status(500).json({
            message: "Error calculating fines",
            error: err.message
        });
    }
};


// ======================================================
// 2. GET STUDENT FINES (with total unpaid calculation)
// ======================================================
exports.getStudentFines = async (req, res) => {
    try {
        const { userID } = req.params;

        const query = `
            SELECT 
                f.FineID,
                f.FineAmount,
                f.DaysOverdue,
                f.BookTitle,
                f.DueDate,
                f.ReturnDate,
                f.PaidStatus,
                bt.TransactionID,
                bt.IssueDate,
                b.Title,
                b.ISBN
            FROM Fines f
            JOIN BorrowTransactions bt ON f.TransactionID = bt.TransactionID
            JOIN Books b ON bt.BookID = b.BookID
            WHERE bt.UserID = @userID
        `;

        const request = pool.request();
        request.input('userID', userID);

        const result = await request.query(query);

        const totalUnpaid = result.recordset
            .filter(f => f.PaidStatus === 'Unpaid')
            .reduce((sum, f) => sum + parseFloat(f.FineAmount), 0);

        return res.status(200).json({
            fines: result.recordset,
            totalUnpaid
        });

    } catch (err) {
        console.error('Get student fines error:', err);
        return res.status(500).json({
            message: "Error fetching fines",
            error: err.message
        });
    }
};


// ======================================================
// 3. PAY FINE (with validation + overpayment protection)
// ======================================================
exports.payFine = async (req, res) => {
    try {
        const { fineID, amount, paymentDate } = req.body;

        if (!fineID || !amount) {
            return res.status(400).json({
                message: "Fine ID and amount required"
            });
        }

        const request = pool.request();
        request.input('fineID', fineID);

        // Check fine exists
        const checkQuery = `
            SELECT * FROM Fines WHERE FineID = @fineID
        `;

        const checkResult = await request.query(checkQuery);

        if (checkResult.recordset.length === 0) {
            return res.status(404).json({
                message: "Fine not found"
            });
        }

        const fine = checkResult.recordset[0];

        // Prevent overpayment
        if (amount > fine.FineAmount) {
            return res.status(400).json({
                message: "Payment exceeds fine amount"
            });
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

        // Mark fine as paid if fully cleared
        const remaining = fine.FineAmount - amount;

        const updateQuery = `
            UPDATE Fines
            SET FineAmount = @remainingAmount,
                PaidStatus = CASE 
                    WHEN @remainingAmount <= 0 THEN 'Paid'
                    ELSE 'Unpaid'
                END
            WHERE FineID = @fineID
        `;

        const updateRequest = pool.request();
        updateRequest.input('fineID', fineID);
        updateRequest.input('remainingAmount', remaining);

        await updateRequest.query(updateQuery);

        return res.status(200).json({
            message: "Payment recorded successfully"
        });

    } catch (err) {
        console.error('Pay fine error:', err);
        return res.status(500).json({
            message: "Error processing payment",
            error: err.message
        });
    }
};
// ======================================================
// 4. GET ALL FINES (for admin)
// ======================================================
exports.getAllFines = async (req, res) => {
    try {
        const query = `
            SELECT 
                f.FineID,
                f.TransactionID,
                f.FineAmount,
                f.DaysOverdue,
                f.BookTitle,
                f.DueDate,
                f.ReturnDate,
                f.PaidStatus,
                f.CreatedDate,
                bt.UserID
            FROM Fines f
            JOIN BorrowTransactions bt ON f.TransactionID = bt.TransactionID
            ORDER BY f.FineID DESC
        `;

        const result = await pool.request().query(query);

        return res.status(200).json({
            fines: result.recordset
        });

    } catch (err) {
        console.error('Get all fines error:', err);
        return res.status(500).json({
            message: "Error fetching fines",
            error: err.message
        });
    }
};

// ======================================================
// 5. MARK FINE AS PAID (Admin action)
// ======================================================
exports.markFineAsPaid = async (req, res) => {
    try {
        const { fineID } = req.body;

        if (!fineID) {
            return res.status(400).json({
                message: "Fine ID required"
            });
        }

        const request = pool.request();
        request.input('fineID', fineID);

        // Check fine exists
        const checkQuery = `
            SELECT * FROM Fines WHERE FineID = @fineID
        `;

        const checkResult = await request.query(checkQuery);

        if (checkResult.recordset.length === 0) {
            return res.status(404).json({
                message: "Fine not found"
            });
        }

        // Update fine status to Paid
        const updateQuery = `
            UPDATE Fines
            SET PaidStatus = 'Paid'
            WHERE FineID = @fineID
        `;

        const updateRequest = pool.request();
        updateRequest.input('fineID', fineID);

        await updateRequest.query(updateQuery);

        return res.status(200).json({
            message: "Fine marked as paid successfully"
        });

    } catch (err) {
        console.error('Mark fine as paid error:', err);
        return res.status(500).json({
            message: "Error marking fine as paid",
            error: err.message
        });
    }
};