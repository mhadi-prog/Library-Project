const pool = require('../db');

// STUDENT: Genre-based Book Recommendations
exports.getRecommendations = async (req, res) => {
    try {
        const { userID } = req.params;

        if (!userID) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const genreQuery = `
            SELECT TOP 3 b.Genre, COUNT(*) AS BorrowCount
            FROM BorrowTransactions bt
            JOIN Books b ON bt.BookID = b.BookID
            WHERE bt.UserID = @userID
            GROUP BY b.Genre
            ORDER BY BorrowCount DESC
        `;

        const genreRequest = pool.request();
        genreRequest.input('userID', userID);
        const genreResult = await genreRequest.query(genreQuery);

        if (genreResult.recordset.length === 0) {
            const popularQuery = `
                SELECT TOP 6
                    b.BookID, b.Title, b.Genre, b.Publisher, b.AvailableCopies,
                    b.PublicationYear, b.ShelfLocation,
                    STRING_AGG(a.AuthorName, ', ') AS Authors,
                    COUNT(bt.TransactionID) AS BorrowCount
                FROM Books b
                LEFT JOIN BookAuthors ba ON b.BookID = ba.BookID
                LEFT JOIN Authors a ON ba.AuthorID = a.AuthorID
                LEFT JOIN BorrowTransactions bt ON b.BookID = bt.BookID
                GROUP BY b.BookID, b.Title, b.Genre, b.Publisher,
                         b.AvailableCopies, b.PublicationYear, b.ShelfLocation
                ORDER BY BorrowCount DESC
            `;
            const popularResult = await pool.request().query(popularQuery);
            return res.status(200).json({
                recommendations: popularResult.recordset,
                basedOn: null,
                message: "Popular books in the library"
            });
        }

        const topGenres = genreResult.recordset.map(r => r.Genre);

        const recQuery = `
            SELECT TOP 6
                b.BookID, b.Title, b.Genre, b.Publisher, b.AvailableCopies,
                b.PublicationYear, b.ShelfLocation,
                STRING_AGG(a.AuthorName, ', ') AS Authors,
                COUNT(bt2.TransactionID) AS PopularityScore
            FROM Books b
            LEFT JOIN BookAuthors ba ON b.BookID = ba.BookID
            LEFT JOIN Authors a ON ba.AuthorID = a.AuthorID
            LEFT JOIN BorrowTransactions bt2 ON b.BookID = bt2.BookID
            WHERE b.Genre IN (${topGenres.map((_, i) => `@genre${i}`).join(',')})
              AND b.BookID NOT IN (
                  SELECT BookID FROM BorrowTransactions WHERE UserID = @userID
              )
            GROUP BY b.BookID, b.Title, b.Genre, b.Publisher,
                     b.AvailableCopies, b.PublicationYear, b.ShelfLocation
            ORDER BY PopularityScore DESC, b.AvailableCopies DESC
        `;

        const recRequest = pool.request();
        recRequest.input('userID', userID);
        topGenres.forEach((genre, i) => recRequest.input(`genre${i}`, genre));
        const recResult = await recRequest.query(recQuery);

        return res.status(200).json({
            recommendations: recResult.recordset,
            basedOn: topGenres,
            message: `Based on your interest in ${topGenres.join(', ')}`
        });

    } catch (err) {
        console.error('Recommendations error:', err);
        return res.status(500).json({ message: "Error fetching recommendations", error: err.message });
    }
};

// ADMIN: Most borrowed books (top 5)
exports.getMostBorrowedBooks = async (req, res) => {
    try {
        const query = `
            SELECT TOP 5
                b.Title,
                STRING_AGG(a.AuthorName, ', ') AS Authors,
                COUNT(bt.TransactionID) AS BorrowCount
            FROM BorrowTransactions bt
            JOIN Books b ON bt.BookID = b.BookID
            LEFT JOIN BookAuthors ba ON b.BookID = ba.BookID
            LEFT JOIN Authors a ON ba.AuthorID = a.AuthorID
            GROUP BY b.BookID, b.Title
            ORDER BY BorrowCount DESC
        `;
        const result = await pool.request().query(query);
        return res.status(200).json({ data: result.recordset });
    } catch (err) {
        return res.status(500).json({ message: "Error fetching most borrowed books", error: err.message });
    }
};

// ADMIN: Monthly borrowing trend (last 6 months)
exports.getMonthlyTrend = async (req, res) => {
    try {
        const query = `
            SELECT
                FORMAT(IssueDate, 'MMM yyyy') AS Month,
                YEAR(IssueDate) AS Yr,
                MONTH(IssueDate) AS Mo,
                COUNT(*) AS BorrowCount
            FROM BorrowTransactions
            WHERE IssueDate >= DATEADD(MONTH, -6, GETDATE())
            GROUP BY FORMAT(IssueDate, 'MMM yyyy'), YEAR(IssueDate), MONTH(IssueDate)
            ORDER BY Yr ASC, Mo ASC
        `;
        const result = await pool.request().query(query);
        return res.status(200).json({ data: result.recordset });
    } catch (err) {
        return res.status(500).json({ message: "Error fetching monthly trend", error: err.message });
    }
};

// ADMIN: Genre distribution
exports.getGenreDistribution = async (req, res) => {
    try {
        const query = `
            SELECT b.Genre, COUNT(bt.TransactionID) AS Count
            FROM BorrowTransactions bt
            JOIN Books b ON bt.BookID = b.BookID
            GROUP BY b.Genre
            ORDER BY Count DESC
        `;
        const result = await pool.request().query(query);
        return res.status(200).json({ data: result.recordset });
    } catch (err) {
        return res.status(500).json({ message: "Error fetching genre distribution", error: err.message });
    }
};

// ADMIN: Overview stats
exports.getOverviewStats = async (req, res) => {
    try {
        const query = `
            SELECT
                (SELECT COUNT(*) FROM Books) AS TotalBooks,
                (SELECT SUM(AvailableCopies) FROM Books) AS AvailableCopies,
                (SELECT COUNT(*) FROM BorrowTransactions WHERE ReturnDate IS NULL) AS ActiveBorrows,
                (SELECT COUNT(*) FROM BorrowTransactions WHERE ReturnDate IS NULL AND DueDate < GETDATE()) AS OverdueBooks,
                (SELECT COUNT(DISTINCT UserID) FROM BorrowTransactions 
                 WHERE IssueDate >= DATEADD(MONTH, -1, GETDATE())) AS ActiveStudents,
                (SELECT COUNT(*) FROM Fines WHERE PaidStatus = 'Unpaid') AS UnpaidFines
        `;
        const result = await pool.request().query(query);
        return res.status(200).json({ data: result.recordset[0] });
    } catch (err) {
        return res.status(500).json({ message: "Error fetching overview stats", error: err.message });
    }
};
// STUDENT: Reading Streak & Milestones
exports.getReadingStreak = async (req, res) => {
    try {
        const { userID } = req.params;

        // Get all borrow activity dates (issue + return), ordered ascending
        const query = `
            SELECT DISTINCT CAST(IssueDate AS DATE) AS ActivityDate
            FROM BorrowTransactions
            WHERE UserID = @userID AND IssueDate IS NOT NULL
            UNION
            SELECT DISTINCT CAST(ReturnDate AS DATE)
            FROM BorrowTransactions
            WHERE UserID = @userID AND ReturnDate IS NOT NULL
            ORDER BY ActivityDate ASC
        `;

        const request = pool.request();
        request.input('userID', userID);
        const result = await request.query(query);

        const dates = result.recordset.map(r => new Date(r.ActivityDate));

        if (dates.length === 0) {
            return res.status(200).json({
                currentStreak: 0,
                longestStreak: 0,
                totalBorrows: 0,
                badges: [],
                lastActivity: null
            });
        }

        // Calculate week-based streak
        const toWeekKey = (date) => {
            const d = new Date(date);
            d.setHours(0, 0, 0, 0);
            const day = d.getDay();
            const monday = new Date(d);
            monday.setDate(d.getDate() - ((day + 6) % 7));
            return monday.toISOString().split('T')[0];
        };

        const weekSet = [...new Set(dates.map(toWeekKey))].sort();

        let currentStreak = 1;
        let longestStreak = 1;
        let tempStreak = 1;

        for (let i = 1; i < weekSet.length; i++) {
            const prev = new Date(weekSet[i - 1]);
            const curr = new Date(weekSet[i]);
            const diffDays = (curr - prev) / (1000 * 60 * 60 * 24);
            if (diffDays <= 7) {
                tempStreak++;
                longestStreak = Math.max(longestStreak, tempStreak);
            } else {
                tempStreak = 1;
            }
        }

        // Check if streak is still active (activity within last 7 days)
        const lastActivity = dates[dates.length - 1];
        const daysSinceLast = (new Date() - lastActivity) / (1000 * 60 * 60 * 24);
        currentStreak = daysSinceLast <= 7 ? tempStreak : 0;

        // Total borrows
        const countQuery = `SELECT COUNT(*) AS Total FROM BorrowTransactions WHERE UserID = @userID2`;
        const countRequest = pool.request();
        countRequest.input('userID2', userID);
        const countResult = await countRequest.query(countQuery);
        const totalBorrows = countResult.recordset[0].Total;

        // Badges based on longest streak and total borrows
        const badges = [];
        if (longestStreak >= 2)  badges.push({ id: 'curious',    label: 'Curious Reader',  icon: '👀', desc: '2-week streak' });
        if (longestStreak >= 4)  badges.push({ id: 'bookworm',   label: 'Bookworm',         icon: '🐛', desc: '4-week streak' });
        if (longestStreak >= 8)  badges.push({ id: 'devoted',    label: 'Devoted Reader',   icon: '📖', desc: '8-week streak' });
        if (longestStreak >= 12) badges.push({ id: 'scholar',    label: 'Scholar',          icon: '🎓', desc: '12-week streak' });
        if (longestStreak >= 20) badges.push({ id: 'legend',     label: 'Library Legend',   icon: '🏆', desc: '20-week streak' });
        if (totalBorrows >= 5)   badges.push({ id: 'reader5',    label: 'Avid Reader',      icon: '⭐', desc: '5 books borrowed' });
        if (totalBorrows >= 10)  badges.push({ id: 'reader10',   label: 'Book Enthusiast',  icon: '🌟', desc: '10 books borrowed' });
        if (totalBorrows >= 25)  badges.push({ id: 'reader25',   label: 'Bibliophile',      icon: '💫', desc: '25 books borrowed' });

        return res.status(200).json({
            currentStreak,
            longestStreak,
            totalBorrows,
            badges,
            lastActivity: lastActivity.toISOString().split('T')[0]
        });

    } catch (err) {
        console.error('Reading streak error:', err);
        return res.status(500).json({ message: "Error fetching reading streak", error: err.message });
    }
};

// ADMIN: Predictive Book Demand Forecast
exports.getDemandForecast = async (req, res) => {
    try {
        // Borrow rate in last 30 days per book + available copies
        const query = `
            SELECT
                b.BookID,
                b.Title,
                b.AvailableCopies,
                b.TotalCopies,
                STRING_AGG(a.AuthorName, ', ') AS Authors,
                b.Genre,
                b.ShelfLocation,
                COUNT(bt.TransactionID) AS BorrowsLast30Days,
                -- Active borrows (not yet returned)
                SUM(CASE WHEN bt.ReturnDate IS NULL THEN 1 ELSE 0 END) AS CurrentlyBorrowed,
                -- Avg days to return
                AVG(CASE 
                    WHEN bt.ReturnDate IS NOT NULL 
                    THEN DATEDIFF(DAY, bt.IssueDate, bt.ReturnDate) 
                    ELSE NULL 
                END) AS AvgReturnDays
            FROM Books b
            LEFT JOIN BorrowTransactions bt 
                ON b.BookID = bt.BookID 
                AND bt.IssueDate >= DATEADD(DAY, -30, GETDATE())
            LEFT JOIN BookAuthors ba ON b.BookID = ba.BookID
            LEFT JOIN Authors a ON ba.AuthorID = a.AuthorID
            GROUP BY b.BookID, b.Title, b.AvailableCopies, b.TotalCopies, b.Genre, b.ShelfLocation
            HAVING COUNT(bt.TransactionID) > 0
            ORDER BY BorrowsLast30Days DESC
        `;

        const result = await pool.request().query(query);
        const books = result.recordset;

        // Calculate demand score and risk level for each book
        const forecast = books.map(book => {
            const borrowRate = book.BorrowsLast30Days / 30; // borrows per day
            const projectedDemand30 = Math.round(borrowRate * 30);
            const available = book.AvailableCopies;
            const avgReturn = book.AvgReturnDays || 14;

            // Expected copies freed up in 30 days based on avg return rate
            const expectedReturns = Math.min(book.CurrentlyBorrowed, Math.round(book.CurrentlyBorrowed * (30 / avgReturn)));
            const projectedAvailable = available + expectedReturns;

            // Risk: how many days until stock runs out at current borrow rate
            const daysUntilEmpty = borrowRate > 0 ? Math.floor(projectedAvailable / borrowRate) : 999;

            let riskLevel, riskColor, recommendation;
            if (daysUntilEmpty <= 7) {
                riskLevel = 'Critical';
                riskColor = 'critical';
                recommendation = 'Restock immediately';
            } else if (daysUntilEmpty <= 15) {
                riskLevel = 'High';
                riskColor = 'high';
                recommendation = 'Consider restocking soon';
            } else if (daysUntilEmpty <= 30) {
                riskLevel = 'Medium';
                riskColor = 'medium';
                recommendation = 'Monitor closely';
            } else {
                riskLevel = 'Low';
                riskColor = 'low';
                recommendation = 'Stock is sufficient';
            }

            return {
                ...book,
                borrowRate: parseFloat(borrowRate.toFixed(2)),
                projectedDemand30,
                daysUntilEmpty: daysUntilEmpty > 999 ? null : daysUntilEmpty,
                riskLevel,
                riskColor,
                recommendation
            };
        });

        // Sort by risk (critical first)
        const riskOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
        forecast.sort((a, b) => riskOrder[a.riskLevel] - riskOrder[b.riskLevel]);

        return res.status(200).json({ forecast });

    } catch (err) {
        console.error('Demand forecast error:', err);
        return res.status(500).json({ message: "Error fetching demand forecast", error: err.message });
    }
};