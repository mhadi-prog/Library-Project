const bcrypt = require('bcrypt');
const pool = require('../db');

// Get user details
exports.getUserDetails = async (req, res) => {
    try {
        const { userID } = req.params;

        const query = `SELECT UserID, Name, Email, Role, Department, BatchYear FROM Users WHERE UserID = @userID`;
        const request = pool.request();
        request.input('userID', userID);
        const result = await request.query(query);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ user: result.recordset[0] });
    } catch (err) {
        console.error('Get user error:', err);
        return res.status(500).json({ message: "Error fetching user", error: err.message });
    }
};

// Search students
exports.searchStudents = async (req, res) => {
    try {
        const { searchTerm } = req.query;

        if (!searchTerm) {
            return res.status(400).json({ message: "Search term required" });
        }

        const query = `
            SELECT UserID, Name, Email, Role, Department, BatchYear
            FROM Users
            WHERE Role = 'Student' AND (Name LIKE @searchTerm OR Email LIKE @searchTerm OR Department LIKE @searchTerm)
        `;

        const request = pool.request();
        request.input('searchTerm', `%${searchTerm}%`);
        const result = await request.query(query);

        return res.status(200).json({ students: result.recordset });
    } catch (err) {
        console.error('Search students error:', err);
        return res.status(500).json({ message: "Error searching students", error: err.message });
    }
};

// Get student borrowing history
exports.getStudentHistory = async (req, res) => {
    try {
        const { userID } = req.params;

        const query = `
            SELECT bt.TransactionID, bt.IssueDate, bt.DueDate, bt.ReturnDate,
                   b.Title, b.ISBN, b.Publisher,
                   STRING_AGG(a.AuthorName, ', ') as Authors
            FROM BorrowTransactions bt
            JOIN Books b ON bt.BookID = b.BookID
            LEFT JOIN BookAuthors ba ON b.BookID = ba.BookID
            LEFT JOIN Authors a ON ba.AuthorID = a.AuthorID
            WHERE bt.UserID = @userID
            GROUP BY bt.TransactionID, bt.IssueDate, bt.DueDate, bt.ReturnDate,
                     b.Title, b.ISBN, b.Publisher
            ORDER BY bt.IssueDate DESC
        `;

        const request = pool.request();
        request.input('userID', userID);
        const result = await request.query(query);

        return res.status(200).json({ history: result.recordset });
    } catch (err) {
        console.error('Get student history error:', err);
        return res.status(500).json({ message: "Error fetching history", error: err.message });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
        const { userID, oldPassword, newPassword } = req.body;

        if (!userID || !oldPassword || !newPassword) {
            return res.status(400).json({ message: "All fields required" });
        }

        // Get user
        const getUserQuery = `SELECT Password FROM Users WHERE UserID = @userID`;
        const getUserRequest = pool.request();
        getUserRequest.input('userID', userID);
        const getUserResult = await getUserRequest.query(getUserQuery);

        if (getUserResult.recordset.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        // Verify old password
        const isMatch = await bcrypt.compare(oldPassword, getUserResult.recordset[0].Password);
        if (!isMatch) {
            return res.status(401).json({ message: "Old password is incorrect" });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        const updateQuery = `UPDATE Users SET Password = @newPassword WHERE UserID = @userID`;
        const updateRequest = pool.request();
        updateRequest.input('userID', userID);
        updateRequest.input('newPassword', hashedPassword);
        await updateRequest.query(updateQuery);

        return res.status(200).json({ message: "Password changed successfully" });
    } catch (err) {
        console.error('Change password error:', err);
        return res.status(500).json({ message: "Error changing password", error: err.message });
    }
};