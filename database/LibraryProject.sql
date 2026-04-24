CREATE DATABASE LibraryProject;
GO

USE LibraryProject;


CREATE TABLE Users(
    UserID INT PRIMARY KEY IDENTITY(1,1),
    Name VARCHAR(100),
    Email VARCHAR(100) UNIQUE,
    Password VARCHAR(255),
    Role VARCHAR(20), -- Admin or Student
    Department VARCHAR(100),
    BatchYear INT
);

CREATE TABLE Books(
    BookID INT PRIMARY KEY IDENTITY(1,1),
    Title VARCHAR(200),
    ISBN VARCHAR(20) UNIQUE,
    Genre VARCHAR(100),
    Publisher VARCHAR(100),
    Edition VARCHAR(50),
    PublicationYear INT,
    TotalCopies INT,
    AvailableCopies INT,
    ShelfLocation VARCHAR(50)
);

CREATE TABLE Authors(
    AuthorID INT PRIMARY KEY IDENTITY(1,1),
    AuthorName VARCHAR(150)
);

CREATE TABLE BookAuthors(
    BookID INT,
    AuthorID INT,
    PRIMARY KEY(BookID, AuthorID),
    FOREIGN KEY (BookID) REFERENCES Books(BookID),
    FOREIGN KEY (AuthorID) REFERENCES Authors(AuthorID)
);

CREATE TABLE BorrowTransactions(
    TransactionID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT,
    BookID INT,
    IssueDate DATE,
    DueDate DATE,
    ReturnDate DATE,
    
    FOREIGN KEY(UserID) REFERENCES Users(UserID),
    FOREIGN KEY(BookID) REFERENCES Books(BookID)
);

CREATE TABLE Reservations(
    ReservationID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT,
    BookID INT,
    ReservationDate DATE,
    Status VARCHAR(20),

    FOREIGN KEY(UserID) REFERENCES Users(UserID),
    FOREIGN KEY(BookID) REFERENCES Books(BookID)
);
CREATE TABLE Fines(
    FineID INT PRIMARY KEY IDENTITY(1,1),
    TransactionID INT,
    Amount DECIMAL(10,2),
    PaidStatus VARCHAR(20),

    FOREIGN KEY(TransactionID) REFERENCES BorrowTransactions(TransactionID)
);

CREATE TABLE Payments(
    PaymentID INT PRIMARY KEY IDENTITY(1,1),
    FineID INT,
    PaymentDate DATE,
    Amount DECIMAL(10,2),

    FOREIGN KEY(FineID) REFERENCES Fines(FineID)
);
-- USERS
INSERT INTO Users (Name, Email, Password, Role, Department, BatchYear)
VALUES
('Ali Khan', 'ali@lms.com', 'pass123', 'Student', 'Computer Science', 2023),
('Sara Ahmed', 'sara@lms.com', 'pass123', 'Student', 'Software Engineering', 2022),
('Usman Tariq', 'usman@lms.com', 'pass123', 'Student', 'Electrical Engineering', 2021),
('Admin User', 'admin@lms.com', 'admin123', 'Admin', NULL, NULL);


-- AUTHORS
INSERT INTO Authors (AuthorName)
VALUES
('J.K. Rowling'),
('George Orwell'),
('Robert C. Martin'),
('Thomas H. Cormen');


-- BOOKS
INSERT INTO Books
(Title, ISBN, Genre, Publisher, Edition, PublicationYear, TotalCopies, AvailableCopies, ShelfLocation)
VALUES
('Harry Potter and the Sorcerer''s Stone','9780439708180','Fantasy','Bloomsbury','1st',1997,5,5,'A1'),
('1984','9780451524935','Dystopian','Secker & Warburg','1st',1949,4,4,'A2'),
('Clean Code','9780132350884','Programming','Prentice Hall','1st',2008,3,3,'B1'),
('Introduction to Algorithms','9780262033848','Algorithms','MIT Press','3rd',2009,2,2,'B2');


-- BOOK AUTHORS
INSERT INTO BookAuthors (BookID, AuthorID)
VALUES
(1,1),
(2,2),
(3,3),
(4,4);


-- BORROW TRANSACTIONS
INSERT INTO BorrowTransactions
(UserID, BookID, IssueDate, DueDate, ReturnDate)
VALUES
(1,1,'2026-03-01','2026-03-10',NULL),
(2,3,'2026-03-02','2026-03-11',NULL),
(3,2,'2026-02-20','2026-03-01','2026-03-03');


-- RESERVATIONS
INSERT INTO Reservations
(UserID, BookID, ReservationDate, Status)
VALUES
(1,4,'2026-03-05','Active'),
(2,1,'2026-03-06','Active');


-- FINES
INSERT INTO Fines
(TransactionID, Amount, PaidStatus)
VALUES
(3,50,'Unpaid');


-- PAYMENTS
INSERT INTO Payments
(FineID, PaymentDate, Amount)
VALUES
(1,'2026-03-05',50);

ALTER TABLE Users
ADD CONSTRAINT chk_StudentFields
CHECK (
    (Role = 'Student' AND Department IS NOT NULL AND BatchYear IS NOT NULL)
    OR (Role = 'Admin')
);