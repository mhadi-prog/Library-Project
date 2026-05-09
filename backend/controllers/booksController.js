const pool = require('../db');

// Get all books
exports.getAllBooks = async (req, res) => {
    try {
        const query = `
            SELECT b.*, STRING_AGG(a.AuthorName, ', ') as Authors
            FROM Books b
            LEFT JOIN BookAuthors ba ON b.BookID = ba.BookID
            LEFT JOIN Authors a ON ba.AuthorID = a.AuthorID
            GROUP BY b.BookID, b.Title, b.ISBN, b.Genre, b.Publisher, b.Edition, 
                     b.PublicationYear, b.TotalCopies, b.AvailableCopies, b.ShelfLocation
        `;
        
        const result = await pool.request().query(query);
        return res.status(200).json({ books: result.recordset });
    } catch (err) {
        console.error('Get books error:', err);
        return res.status(500).json({ message: "Error fetching books", error: err.message });
    }
};

// Search books
// Search books (ENHANCED with Estimated Return Date)
exports.searchBooks = async (req, res) => {
    try {
        const { searchTerm } = req.query;

        if (!searchTerm) {
            return res.status(400).json({ message: "Search term is required" });
        }

        const query = `
            SELECT 
                b.*,
                STRING_AGG(a.AuthorName, ', ') as Authors,

                -- Check availability
                CASE 
                    WHEN b.AvailableCopies > 0 THEN 'Available'
                    ELSE 'Unavailable'
                END AS AvailabilityStatus,

                -- Estimated return date (if book is currently issued)
                (
                    SELECT TOP 1 bt.DueDate
                    FROM BorrowTransactions bt
                    WHERE bt.BookID = b.BookID
                      AND bt.ReturnDate IS NULL
                    ORDER BY bt.DueDate ASC
                ) AS EstimatedReturnDate

            FROM Books b
            LEFT JOIN BookAuthors ba ON b.BookID = ba.BookID
            LEFT JOIN Authors a ON ba.AuthorID = a.AuthorID

            WHERE b.Title LIKE @searchTerm 
               OR b.ISBN LIKE @searchTerm
               OR a.AuthorName LIKE @searchTerm
               OR b.Genre LIKE @searchTerm

            GROUP BY 
                b.BookID, b.Title, b.ISBN, b.Genre, b.Publisher, b.Edition, 
                b.PublicationYear, b.TotalCopies, b.AvailableCopies, b.ShelfLocation
        `;

        const request = pool.request();
        request.input('searchTerm', `%${searchTerm}%`);

        const result = await request.query(query);

        return res.status(200).json({
            books: result.recordset
        });

    } catch (err) {
        console.error('Search books error:', err);
        return res.status(500).json({
            message: "Error searching books",
            error: err.message
        });
    }
};

// Add book
// Add book
exports.addBook = async (req, res) => {
    try {
        const {
            title,
            isbn,
            genre,
            publisher,
            edition,
            publicationYear,
            totalCopies,
            shelfLocation,
            authors
        } = req.body;

        // -------------------------------
        // VALIDATION (NEW IMPROVED CHECKS)
        // -------------------------------
        if (!title || !isbn || !genre || !publisher) {
            return res.status(400).json({ message: "Required fields missing" });
        }

        if (!totalCopies || isNaN(totalCopies) || totalCopies <= 0) {
            return res.status(400).json({ message: "Total copies must be a positive number" });
        }

        const query = `
            INSERT INTO Books 
            (Title, ISBN, Genre, Publisher, Edition, PublicationYear, TotalCopies, AvailableCopies, ShelfLocation)
            VALUES 
            (@title, @isbn, @genre, @publisher, @edition, @publicationYear, @totalCopies, @totalCopies, @shelfLocation);
            SELECT SCOPE_IDENTITY() as BookID;
        `;

        const request = pool.request();
        request.input('title', title.trim());
        request.input('isbn', isbn.trim());
        request.input('genre', genre.trim());
        request.input('publisher', publisher.trim());
        request.input('edition', edition?.trim() || '1st');
        request.input('publicationYear', publicationYear || new Date().getFullYear());
        request.input('totalCopies', Number(totalCopies));
        request.input('shelfLocation', shelfLocation?.trim() || 'A1');

        const result = await request.query(query);
        const bookID = result.recordset[0].BookID;

        // Add authors if provided
        if (authors && Array.isArray(authors) && authors.length > 0) {
            for (let authorName of authors) {
                if (!authorName) continue;

                const authorQuery = `
                    IF NOT EXISTS (SELECT 1 FROM Authors WHERE AuthorName = @authorName)
                    INSERT INTO Authors (AuthorName) VALUES (@authorName);
                    
                    DECLARE @AuthorID INT;
                    SELECT @AuthorID = AuthorID FROM Authors WHERE AuthorName = @authorName;
                    
                    IF NOT EXISTS (SELECT 1 FROM BookAuthors WHERE BookID = @bookID AND AuthorID = @AuthorID)
                    INSERT INTO BookAuthors (BookID, AuthorID) VALUES (@bookID, @AuthorID);
                `;

                const authRequest = pool.request();
                authRequest.input('authorName', authorName.trim());
                authRequest.input('bookID', bookID);
                await authRequest.query(authorQuery);
            }
        }

        return res.status(201).json({ message: "Book added successfully", bookID });

    } catch (err) {
        console.error('Add book error:', err);

        if (err.number === 2627) {
            return res.status(400).json({ message: "ISBN already exists" });
        }

        return res.status(500).json({
            message: "Error adding book",
            error: err.message
        });
    }
};
// Update book
// Update book
exports.updateBook = async (req, res) => {
    try {
        const { bookID } = req.params;

        const {
            Title,
            Genre,
            Publisher,
            Edition,
            PublicationYear,
            TotalCopies,
            ShelfLocation
        } = req.body;

        if (!bookID) {
            return res.status(400).json({ message: "Book ID is required" });
        }

        if (!Title || !Genre || !Publisher) {
            return res.status(400).json({ message: "Required fields missing" });
        }

        const query = `
            UPDATE Books
            SET Title = @Title,
                Genre = @Genre,
                Publisher = @Publisher,
                Edition = @Edition,
                PublicationYear = @PublicationYear,
                TotalCopies = @TotalCopies,
                AvailableCopies = 
                    CASE 
                        WHEN @TotalCopies < AvailableCopies THEN @TotalCopies
                        ELSE AvailableCopies
                    END,
                ShelfLocation = @ShelfLocation
            WHERE BookID = @bookID
        `;

        const request = pool.request();
        request.input('bookID', bookID);
        request.input('Title', Title.trim());
        request.input('Genre', Genre.trim());
        request.input('Publisher', Publisher.trim());
        request.input('Edition', Edition?.trim() || '1st');
        request.input('PublicationYear', PublicationYear || new Date().getFullYear());
        request.input('TotalCopies', Number(TotalCopies));
        request.input('ShelfLocation', ShelfLocation?.trim() || 'A1');

        const result = await request.query(query);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: "Book not found" });
        }

        return res.status(200).json({ message: "Book updated successfully" });

    } catch (err) {
        console.error("Update book error:", err);
        return res.status(500).json({
            message: "Error updating book",
            error: err.message
        });
    }
};

// Delete book
exports.deleteBook = async (req, res) => {
    try {
        const { bookID } = req.params;

        const request = pool.request();
        request.input('bookID', bookID);

        // -------------------------------
        // 1. CHECK IF BOOK EXISTS IN ACTIVE BORROWING
        // -------------------------------
        const checkQuery = `
            SELECT bt.TransactionID, bt.UserID, bt.DueDate, u.Name, u.Email
            FROM BorrowTransactions bt
            JOIN Users u ON bt.UserID = u.UserID
            WHERE bt.BookID = @bookID
              AND bt.ReturnDate IS NULL
        `;

        const checkResult = await request.query(checkQuery);

        // If book is currently issued → BLOCK deletion
       if (checkResult.recordset.length > 0) {
    return res.status(400).json({
        message: "Book borrowed — cannot be deleted.",
        activeBorrowers: checkResult.recordset
    });
}

        // -------------------------------
        // 2. DELETE BOOK AUTHOR RELATIONSHIP FIRST
        // (to maintain referential integrity)
        // -------------------------------
        const deleteAuthorsQuery = `
            DELETE FROM BookAuthors WHERE BookID = @bookID
        `;
        await request.query(deleteAuthorsQuery);

        // -------------------------------
        // 3. DELETE BOOK
        // -------------------------------
        const deleteQuery = `
            DELETE FROM Books WHERE BookID = @bookID
        `;
        await request.query(deleteQuery);

        return res.status(200).json({
            message: "Book deleted successfully"
        });

    } catch (err) {
        console.error('Delete book error:', err);
        return res.status(500).json({
            message: "Error deleting book",
            error: err.message
        });
    }
};

// Get book by ID
exports.getBookByID = async (req, res) => {
    try {
        const { bookID } = req.params;

        const query = `
            SELECT b.*, STRING_AGG(a.AuthorName, ', ') as Authors
            FROM Books b
            LEFT JOIN BookAuthors ba ON b.BookID = ba.BookID
            LEFT JOIN Authors a ON ba.AuthorID = a.AuthorID
            WHERE b.BookID = @bookID
            GROUP BY b.BookID, b.Title, b.ISBN, b.Genre, b.Publisher, b.Edition, 
                     b.PublicationYear, b.TotalCopies, b.AvailableCopies, b.ShelfLocation
        `;

        const request = pool.request();
        request.input('bookID', bookID);
        const result = await request.query(query);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: "Book not found" });
        }

        return res.status(200).json({ book: result.recordset[0] });
    } catch (err) {
        console.error('Get book error:', err);
        return res.status(500).json({ message: "Error fetching book", error: err.message });
    }
};