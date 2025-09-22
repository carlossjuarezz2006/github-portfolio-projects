/**
 * Book Controller
 * 
 * Handles all book-related operations:
 * - CRUD operations for books
 * - Search and filtering
 * - Inventory management
 * - Book recommendations
 * - Statistics and analytics
 */

const Book = require('../models/Book');
const Author = require('../models/Author');
const Category = require('../models/Category');
const Review = require('../models/Review');
const { validationResult } = require('express-validator');

/**
 * Get all books with pagination, filtering, and search
 * @route GET /api/books
 * @access Public
 */
const getBooks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      sort = '-createdAt',
      search,
      category,
      author,
      minPrice,
      maxPrice,
      minRating,
      format,
      language,
      inStock,
      featured,
      newReleases,
    } = req.query;

    // Build filter object
    const filters = { isActive: true };

    // Text search
    if (search) {
      filters.$text = { $search: search };
    }

    // Category filter
    if (category) {
      filters.categories = category;
    }

    // Author filter
    if (author) {
      filters.author = author;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = parseFloat(minPrice);
      if (maxPrice) filters.price.$lte = parseFloat(maxPrice);
    }

    // Rating filter
    if (minRating) {
      filters['rating.average'] = { $gte: parseFloat(minRating) };
    }

    // Format filter
    if (format) {
      filters.format = format;
    }

    // Language filter
    if (language) {
      filters.language = language;
    }

    // In stock filter
    if (inStock === 'true') {
      filters.$expr = { $gt: [{ $subtract: ['$stock', '$reservedStock'] }, 0] };
    }

    // Featured filter
    if (featured === 'true') {
      filters.isFeatured = true;
    }

    // New releases filter
    if (newReleases === 'true') {
      filters.isNewRelease = true;
    }

    // Execute query with pagination
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      populate: [
        { path: 'author coAuthors', select: 'firstName lastName fullName biography' },
        { path: 'categories', select: 'name slug description' },
      ],
    };

    const books = await Book.paginate(filters, options);

    // Add search score for text search results
    if (search) {
      books.docs = books.docs.map(book => ({
        ...book.toObject(),
        searchScore: book.$meta ? book.$meta.textScore : undefined,
      }));
    }

    res.json({
      success: true,
      data: books.docs,
      pagination: {
        currentPage: books.page,
        totalPages: books.totalPages,
        totalResults: books.totalDocs,
        hasNextPage: books.hasNextPage,
        hasPrevPage: books.hasPrevPage,
        nextPage: books.nextPage,
        prevPage: books.prevPage,
        limit: books.limit,
      },
      filters: {
        search,
        category,
        author,
        minPrice,
        maxPrice,
        minRating,
        format,
        language,
        inStock,
        featured,
        newReleases,
      },
    });

  } catch (error) {
    console.error('Error getting books:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve books',
    });
  }
};

/**
 * Get a single book by ID
 * @route GET /api/books/:id
 * @access Public
 */
const getBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate('author coAuthors', 'firstName lastName fullName biography avatar')
      .populate('categories', 'name slug description');

    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found',
      });
    }

    // Increment view count if user is viewing (not admin/moderator checking)
    if (!req.user || req.user.role === 'user') {
      await book.incrementViews();
    }

    // Get recent reviews
    const reviews = await Review.find({ book: book._id })
      .populate('user', 'username firstName lastName avatar')
      .sort('-createdAt')
      .limit(5);

    // Get similar books (same categories or author)
    const similarBooks = await Book.find({
      _id: { $ne: book._id },
      isActive: true,
      $or: [
        { categories: { $in: book.categories } },
        { author: book.author },
      ],
    })
      .populate('author', 'firstName lastName fullName')
      .sort('-rating.average')
      .limit(6);

    res.json({
      success: true,
      data: {
        book,
        reviews,
        similarBooks,
      },
    });

  } catch (error) {
    console.error('Error getting book:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid book ID format',
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve book',
    });
  }
};

/**
 * Create a new book
 * @route POST /api/books
 * @access Admin, Moderator
 */
const createBook = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    // Verify author exists
    const author = await Author.findById(req.body.author);
    if (!author) {
      return res.status(400).json({
        success: false,
        error: 'Author not found',
      });
    }

    // Verify categories exist
    if (req.body.categories && req.body.categories.length > 0) {
      const categoriesCount = await Category.countDocuments({
        _id: { $in: req.body.categories },
      });
      
      if (categoriesCount !== req.body.categories.length) {
        return res.status(400).json({
          success: false,
          error: 'One or more categories not found',
        });
      }
    }

    // Create book
    const book = new Book(req.body);
    await book.save();

    // Populate references
    await book.populate([
      { path: 'author coAuthors', select: 'firstName lastName fullName biography' },
      { path: 'categories', select: 'name slug description' },
    ]);

    res.status(201).json({
      success: true,
      data: book,
      message: 'Book created successfully',
    });

  } catch (error) {
    console.error('Error creating book:', error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        error: `Book with this ${field} already exists`,
      });
    }

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationErrors,
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create book',
    });
  }
};

/**
 * Update a book
 * @route PUT /api/books/:id
 * @access Admin, Moderator
 */
const updateBook = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    // Find book
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found',
      });
    }

    // Verify author exists if being updated
    if (req.body.author) {
      const author = await Author.findById(req.body.author);
      if (!author) {
        return res.status(400).json({
          success: false,
          error: 'Author not found',
        });
      }
    }

    // Verify categories exist if being updated
    if (req.body.categories && req.body.categories.length > 0) {
      const categoriesCount = await Category.countDocuments({
        _id: { $in: req.body.categories },
      });
      
      if (categoriesCount !== req.body.categories.length) {
        return res.status(400).json({
          success: false,
          error: 'One or more categories not found',
        });
      }
    }

    // Update book
    Object.assign(book, req.body);
    await book.save();

    // Populate references
    await book.populate([
      { path: 'author coAuthors', select: 'firstName lastName fullName biography' },
      { path: 'categories', select: 'name slug description' },
    ]);

    res.json({
      success: true,
      data: book,
      message: 'Book updated successfully',
    });

  } catch (error) {
    console.error('Error updating book:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid book ID format',
      });
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        error: `Book with this ${field} already exists`,
      });
    }

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationErrors,
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to update book',
    });
  }
};

/**
 * Delete a book
 * @route DELETE /api/books/:id
 * @access Admin
 */
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found',
      });
    }

    // Soft delete - mark as inactive instead of removing
    book.isActive = false;
    await book.save();

    res.json({
      success: true,
      message: 'Book deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting book:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid book ID format',
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to delete book',
    });
  }
};

/**
 * Get featured books
 * @route GET /api/books/featured
 * @access Public
 */
const getFeaturedBooks = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const books = await Book.findFeatured(parseInt(limit));

    res.json({
      success: true,
      data: books,
    });

  } catch (error) {
    console.error('Error getting featured books:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve featured books',
    });
  }
};

/**
 * Get new releases
 * @route GET /api/books/new-releases
 * @access Public
 */
const getNewReleases = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const books = await Book.findNewReleases(parseInt(limit));

    res.json({
      success: true,
      data: books,
    });

  } catch (error) {
    console.error('Error getting new releases:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve new releases',
    });
  }
};

/**
 * Get bestsellers
 * @route GET /api/books/bestsellers
 * @access Public
 */
const getBestsellers = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const books = await Book.findBestsellers(parseInt(limit));

    res.json({
      success: true,
      data: books,
    });

  } catch (error) {
    console.error('Error getting bestsellers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve bestsellers',
    });
  }
};

/**
 * Get book inventory statistics
 * @route GET /api/books/stats/inventory
 * @access Admin, Moderator
 */
const getInventoryStats = async (req, res) => {
  try {
    const stats = await Book.getInventoryStats();

    res.json({
      success: true,
      data: stats,
    });

  } catch (error) {
    console.error('Error getting inventory stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve inventory statistics',
    });
  }
};

/**
 * Update book inventory
 * @route PATCH /api/books/:id/inventory
 * @access Admin, Moderator
 */
const updateInventory = async (req, res) => {
  try {
    const { stock, reservedStock } = req.body;
    
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found',
      });
    }

    if (stock !== undefined) {
      book.stock = stock;
    }
    
    if (reservedStock !== undefined) {
      book.reservedStock = reservedStock;
    }

    await book.save();

    res.json({
      success: true,
      data: {
        stock: book.stock,
        reservedStock: book.reservedStock,
        availableStock: book.availableStock,
      },
      message: 'Inventory updated successfully',
    });

  } catch (error) {
    console.error('Error updating inventory:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid book ID format',
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to update inventory',
    });
  }
};

module.exports = {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  getFeaturedBooks,
  getNewReleases,
  getBestsellers,
  getInventoryStats,
  updateInventory,
};

