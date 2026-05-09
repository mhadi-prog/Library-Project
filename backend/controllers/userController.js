const bcrypt = require('bcrypt');
const pool = require('../db');


// ======================================================
// 1. GET USER DETAILS (improved validation)
// ======================================================
exports.getUserDetails = async (req, res) => {
    try {
        const { userID } = req.params;

        if (!userID) {
            return res.status(400).json({ message: "User ID required" });
        }

        const query = `
            SELECT UserID, Name, Email, Role, Department, BatchYear
            FROM Users
            WHERE UserID = @userID
        `;

        const request = pool.request();
        request.input('userID', userID);

        const result = await request.query(query);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ user: result.recordset[0] });

    } catch (err) {
        console.error('Get user error:', err);
        return res.status(500).json({
            message: "Error fetching user",
            error: err.message
        });
    }
};


// ======================================================
// 2. SEARCH STUDENTS (improved safety + filtering)
// ======================================================
exports.searchStudents = async (req, res) => {
    try {
        const { searchTerm } = req.query;

        if (!searchTerm) {
            return res.status(400).json({ message: "Search term required" });
        }

        const query = `
            SELECT UserID, Name, Email, Role, Department, BatchYear
            FROM Users
            WHERE Role = 'Student'
              AND (
                  Name LIKE @searchTerm 
                  OR Email LIKE @searchTerm 
                  OR Department LIKE @searchTerm
              )
        `;

        const request = pool.request();
        request.input('searchTerm', `%${searchTerm}%`);

        const result = await request.query(query);

        return res.status(200).json({ students: result.recordset });

    } catch (err) {
        console.error('Search students error:', err);
        return res.status(500).json({
            message: "Error searching students",
            error: err.message
        });
    }
};


// ======================================================
// 3. GET STUDENT BORROWING HISTORY
// ======================================================
exports.getStudentHistory = async (req, res) => {
    try {
        const { userID } = req.params;

        if (!userID) {
            return res.status(400).json({ message: "User ID required" });
        }

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
        return res.status(500).json({
            message: "Error fetching history",
            error: err.message
        });
    }
};


// ======================================================
// 4. CHANGE PASSWORD (safer version)
// ======================================================
exports.changePassword = async (req, res) => {
    try {
        const { userID, oldPassword, newPassword } = req.body;

        if (!userID || !oldPassword || !newPassword) {
            return res.status(400).json({ message: "All fields required" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters long"
            });
        }

        const getUserQuery = `
            SELECT Password FROM Users WHERE UserID = @userID
        `;

        const getUserRequest = pool.request();
        getUserRequest.input('userID', userID);

        const getUserResult = await getUserRequest.query(getUserQuery);

        if (getUserResult.recordset.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(
            oldPassword,
            getUserResult.recordset[0].Password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Old password is incorrect"
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const updateQuery = `
            UPDATE Users
            SET Password = @newPassword
            WHERE UserID = @userID
        `;

        const updateRequest = pool.request();
        updateRequest.input('userID', userID);
        updateRequest.input('newPassword', hashedPassword);

        await updateRequest.query(updateQuery);

        return res.status(200).json({
            message: "Password changed successfully"
        });

    } catch (err) {
        console.error('Change password error:', err);
        return res.status(500).json({
            message: "Error changing password",
            error: err.message
        });
    }
};


// ======================================================
// 5. NEW FUNCTION (MISSING PIECE) - GET ALL USERS (ADMIN)
// ======================================================
// ✔ Required for admin dashboard student management
// ✔ Used for Search Student + filtering + reports

exports.getAllUsers = async (req, res) => {
    try {
        const query = `
            SELECT UserID, Name, Email, Role, Department, BatchYear
            FROM Users
        `;

        const result = await pool.request().query(query);

        const students = result.recordset.filter(u => u.Role === 'Student');
        const admins = result.recordset.filter(u => u.Role === 'Admin');

        return res.status(200).json({
            students,
            admins
        });

    } catch (err) {
        console.error('Get all users error:', err);
        return res.status(500).json({
            message: "Error fetching users",
            error: err.message
        });
    }
};
// Get borrowing history of a student
// Get borrowing history by student name
// Get borrowing history by student search
exports.getBorrowHistory = async (req, res) => {
    try {

        const { searchTerm } = req.query;

        if (!searchTerm) {
            return res.status(400).json({
                message: "Search term is required"
            });
        }

        const query = `
            SELECT 
                u.UserID,
                u.Name,
                b.Title,
                STRING_AGG(a.AuthorName, ', ') AS Authors,
                bt.IssueDate,
                bt.DueDate,
                bt.ReturnDate
            FROM BorrowTransactions bt
            JOIN Users u ON bt.UserID = u.UserID
            JOIN Books b ON bt.BookID = b.BookID
            LEFT JOIN BookAuthors ba ON b.BookID = ba.BookID
            LEFT JOIN Authors a ON ba.AuthorID = a.AuthorID
            WHERE 
                u.Name LIKE @searchTerm
                OR CAST(u.UserID AS VARCHAR) LIKE @searchTerm
                OR u.Email LIKE @searchTerm
                OR u.Department LIKE @searchTerm
            GROUP BY
                u.UserID,
                u.Name,
                b.Title,
                bt.IssueDate,
                bt.DueDate,
                bt.ReturnDate
            ORDER BY bt.IssueDate DESC
        `;

        const request = pool.request();

        request.input(
            "searchTerm",
            `%${searchTerm}%`
        );

        const result = await request.query(query);

        return res.status(200).json({
            history: result.recordset
        });

    } catch (err) {

        console.error("Borrow history error:", err);

        return res.status(500).json({
            message: "Error fetching history",
            error: err.message
        });
    }
};

exports.updateBook = async (req, res) => {
  try {
    const { bookID } = req.params;

    const {
      Title,
      ISBN,
      Genre,
      TotalCopies,
      AvailableCopies,
      Publisher
    } = req.body;

    await db.query(
      `
      UPDATE Book
      SET
        Title = ?,
        ISBN = ?,
        Genre = ?,
        TotalCopies = ?,
        AvailableCopies = ?,
        Publisher = ?
      WHERE BookID = ?
      `,
      [
        Title,
        ISBN,
        Genre,
        TotalCopies,
        AvailableCopies,
        Publisher,
        bookID
      ]
    );

    res.json({
      success: true,
      message: "Book updated successfully"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to update book"
    });
  }
};