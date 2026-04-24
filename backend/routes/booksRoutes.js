const express = require('express');
const router = express.Router();
const booksController = require('../controllers/booksController');

router.get('/', booksController.getAllBooks);
router.get('/search', booksController.searchBooks);
router.get('/:bookID', booksController.getBookByID);
router.post('/', booksController.addBook);
router.put('/:bookID', booksController.updateBook);
router.delete('/:bookID', booksController.deleteBook);

module.exports = router;