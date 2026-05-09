const express = require('express');
const router = express.Router();
const booksController = require('../controllers/booksController');

// GET all books
router.get('/', booksController.getAllBooks);

// SEARCH books
router.get('/search', booksController.searchBooks);

// ADD book
router.post('/', booksController.addBook);

// UPDATE book
router.put('/:bookID', booksController.updateBook);

// DELETE book
router.delete('/:bookID', booksController.deleteBook);

// GET single book
router.get('/:bookID', booksController.getBookByID);

module.exports = router;