/**
 * @swagger
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       required:
 *         - title
 *         - author
 *         - isbn
 *         - price
 *         - stock
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the book
 *         title:
 *           type: string
 *           minLength: 1
 *           maxLength: 200
 *           description: Book title
 *         subtitle:
 *           type: string
 *           maxLength: 200
 *           description: Book subtitle
 *         author:
 *           type: string
 *           description: Reference to Author ID
 *         coAuthors:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of co-author IDs
 *         isbn:
 *           type: string
 *           description: International Standard Book Number
 *         isbn13:
 *           type: string
 *           description: 13-digit ISBN
 *         description:
 *           type: string
 *           maxLength: 2000
 *           description: Book description
 *         publisher:
 *           type: string
 *           maxLength: 100
 *           description: Publisher name
 *         publishedDate:
 *           type: string
 *           format: date
 *           description: Publication date
 *         edition:
 *           type: string
 *           maxLength: 50
 *           description: Book edition
 *         language:
 *           type: string
 *           enum: [en, es, fr, de, it, pt, other]
 *           default: en
 *           description: Book language
 *         pages:
 *           type: number
 *           minimum: 1
 *           description: Number of pages
 *         format:
 *           type: string
 *           enum: [hardcover, paperback, ebook, audiobook]
 *           default: paperback
 *           description: Book format
 *         categories:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of category IDs
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of tags
 *         price:
 *           type: number
 *           minimum: 0
 *           description: Book price
 *         originalPrice:
 *           type: number
 *           minimum: 0
 *           description: Original price (for discounts)
 *         currency:
 *           type: string
 *           default: USD
 *           description: Price currency
 *         stock:
 *           type: number
 *           minimum: 0
 *           description: Available stock
 *         reservedStock:
 *           type: number
 *           default: 0
 *           description: Reserved stock (in carts/pending orders)
 *         weight:
 *           type: number
 *           minimum: 0
 *           description: Book weight in grams
 *         dimensions:
 *           type: object
 *           properties:
 *             length:
 *               type: number
 *             width:
 *               type: number
 *             height:
 *               type: number
 *           description: Book dimensions in cm
 *         coverImage:
 *           type: string
 *           description: URL to cover image
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of additional image URLs
 *         rating:
 *           type: object
 *           properties:
 *             average:
 *               type: number
 *               minimum: 0
 *               maximum: 5
 *             count:
 *               type: number
 *               minimum: 0
 *         isActive:
 *           type: boolean
 *           default: true
 *           description: Whether the book is active/available
 *         isFeatured:
 *           type: boolean
 *           default: false
 *           description: Whether the book is featured
 *         isNewRelease:
 *           type: boolean
 *           default: false
 *           description: Whether the book is a new release
 *         metadata:
 *           type: object
 *           properties:
 *             views:
 *               type: number
 *               default: 0
 *             favorites:
 *               type: number
 *               default: 0
 *             sales:
 *               type: number
 *               default: 0
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *       example:
 *         _id: "507f1f77bcf86cd799439011"
 *         title: "The Great Gatsby"
 *         author: "507f1f77bcf86cd799439012"
 *         isbn: "978-0-7432-7356-5"
 *         isbn13: "9780743273565"
 *         description: "A classic American novel"
 *         publisher: "Scribner"
 *         publishedDate: "1925-04-10"
 *         language: "en"
 *         pages: 180
 *         format: "paperback"
 *         price: 12.99
 *         currency: "USD"
 *         stock: 50
 *         rating:
 *           average: 4.2
 *           count: 1520
 *         isActive: true
 *         isFeatured: true
 */

const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true,
    minlength: [1, 'Title must be at least 1 character long'],
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },

  subtitle: {
    type: String,
    trim: true,
    maxlength: [200, 'Subtitle cannot exceed 200 characters'],
  },

  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author',
    required: [true, 'Author is required'],
  },

  coAuthors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author',
  }],

  isbn: {
    type: String,
    unique: true,
    sparse: true,
    match: [/^(?:\d{10}|\d{13}|(?:\d{1,5}-\d{1,7}-\d{1,7}-\d{1,7}-\d{1}))$/, 'Please enter a valid ISBN'],
  },

  isbn13: {
    type: String,
    unique: true,
    sparse: true,
    match: [/^\d{13}$/, 'ISBN13 must be exactly 13 digits'],
  },

  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
  },

  publisher: {
    type: String,
    trim: true,
    maxlength: [100, 'Publisher name cannot exceed 100 characters'],
  },

  publishedDate: {
    type: Date,
    validate: {
      validator: function(date) {
        return date <= new Date();
      },
      message: 'Published date cannot be in the future'
    }
  },

  edition: {
    type: String,
    trim: true,
    maxlength: [50, 'Edition cannot exceed 50 characters'],
  },

  language: {
    type: String,
    enum: ['en', 'es', 'fr', 'de', 'it', 'pt', 'other'],
    default: 'en',
  },

  pages: {
    type: Number,
    min: [1, 'Pages must be at least 1'],
    validate: {
      validator: Number.isInteger,
      message: 'Pages must be a whole number'
    }
  },

  format: {
    type: String,
    enum: ['hardcover', 'paperback', 'ebook', 'audiobook'],
    default: 'paperback',
  },

  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  }],

  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [30, 'Tag cannot exceed 30 characters'],
  }],

  // Pricing
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },

  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative'],
  },

  currency: {
    type: String,
    default: 'USD',
    uppercase: true,
    minlength: [3, 'Currency code must be 3 characters'],
    maxlength: [3, 'Currency code must be 3 characters'],
  },

  // Inventory
  stock: {
    type: Number,
    required: [true, 'Stock is required'],
    min: [0, 'Stock cannot be negative'],
    validate: {
      validator: Number.isInteger,
      message: 'Stock must be a whole number'
    }
  },

  reservedStock: {
    type: Number,
    default: 0,
    min: [0, 'Reserved stock cannot be negative'],
  },

  // Physical properties
  weight: {
    type: Number,
    min: [0, 'Weight cannot be negative'],
  },

  dimensions: {
    length: {
      type: Number,
      min: [0, 'Length cannot be negative'],
    },
    width: {
      type: Number,
      min: [0, 'Width cannot be negative'],
    },
    height: {
      type: Number,
      min: [0, 'Height cannot be negative'],
    },
  },

  // Media
  coverImage: {
    type: String,
    match: [/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i, 'Please enter a valid image URL'],
  },

  images: [{
    type: String,
    match: [/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i, 'Please enter valid image URLs'],
  }],

  // Rating and reviews
  rating: {
    average: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    count: {
      type: Number,
      min: 0,
      default: 0,
    },
  },

  // Status flags
  isActive: {
    type: Boolean,
    default: true,
  },

  isFeatured: {
    type: Boolean,
    default: false,
  },

  isNewRelease: {
    type: Boolean,
    default: false,
  },

  // Metadata
  metadata: {
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    favorites: {
      type: Number,
      default: 0,
      min: 0,
    },
    sales: {
      type: Number,
      default: 0,
      min: 0,
    },
  },

}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  },
  toObject: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes
bookSchema.index({ title: 'text', description: 'text' });
bookSchema.index({ author: 1 });
bookSchema.index({ categories: 1 });
bookSchema.index({ price: 1 });
bookSchema.index({ 'rating.average': -1 });
bookSchema.index({ createdAt: -1 });
bookSchema.index({ isActive: 1, isFeatured: -1 });
bookSchema.index({ tags: 1 });
bookSchema.index({ isbn: 1 });
bookSchema.index({ isbn13: 1 });
bookSchema.index({ publishedDate: -1 });

// Compound indexes
bookSchema.index({ isActive: 1, price: 1 });
bookSchema.index({ categories: 1, 'rating.average': -1 });

// Virtual for available stock
bookSchema.virtual('availableStock').get(function() {
  return Math.max(0, this.stock - this.reservedStock);
});

// Virtual for discount percentage
bookSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Virtual for full title
bookSchema.virtual('fullTitle').get(function() {
  return this.subtitle ? `${this.title}: ${this.subtitle}` : this.title;
});

// Virtual for in stock status
bookSchema.virtual('inStock').get(function() {
  return this.availableStock > 0;
});

// Pre-save middleware
bookSchema.pre('save', function(next) {
  // Set originalPrice if not provided but price is set
  if (!this.originalPrice && this.price) {
    this.originalPrice = this.price;
  }
  
  // Auto-set isNewRelease for books published in the last 6 months
  if (this.publishedDate) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    this.isNewRelease = this.publishedDate >= sixMonthsAgo;
  }
  
  next();
});

// Pre-find middleware to populate author and categories by default
bookSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'author coAuthors',
    select: 'firstName lastName fullName biography',
  }).populate({
    path: 'categories',
    select: 'name slug description',
  });
  next();
});

// Instance method to update rating
bookSchema.methods.updateRating = async function(newRating) {
  const reviews = await mongoose.model('Review').find({ book: this._id });
  
  if (reviews.length === 0) {
    this.rating.average = 0;
    this.rating.count = 0;
  } else {
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    this.rating.average = Math.round((sum / reviews.length) * 10) / 10; // Round to 1 decimal
    this.rating.count = reviews.length;
  }
  
  return this.save();
};

// Instance method to check if book is available
bookSchema.methods.isAvailable = function(quantity = 1) {
  return this.isActive && this.availableStock >= quantity;
};

// Instance method to reserve stock
bookSchema.methods.reserveStock = function(quantity) {
  if (this.availableStock < quantity) {
    throw new Error('Insufficient stock available');
  }
  
  this.reservedStock += quantity;
  return this.save();
};

// Instance method to release reserved stock
bookSchema.methods.releaseStock = function(quantity) {
  this.reservedStock = Math.max(0, this.reservedStock - quantity);
  return this.save();
};

// Instance method to fulfill order (remove from stock)
bookSchema.methods.fulfillOrder = function(quantity) {
  if (this.stock < quantity) {
    throw new Error('Insufficient stock to fulfill order');
  }
  
  this.stock -= quantity;
  this.reservedStock = Math.max(0, this.reservedStock - quantity);
  this.metadata.sales += quantity;
  return this.save();
};

// Instance method to increment view count
bookSchema.methods.incrementViews = function() {
  this.metadata.views += 1;
  return this.save({ validateBeforeSave: false });
};

// Static method to find featured books
bookSchema.statics.findFeatured = function(limit = 10) {
  return this.find({ isActive: true, isFeatured: true })
    .sort({ 'rating.average': -1, createdAt: -1 })
    .limit(limit);
};

// Static method to find new releases
bookSchema.statics.findNewReleases = function(limit = 10) {
  return this.find({ isActive: true, isNewRelease: true })
    .sort({ publishedDate: -1 })
    .limit(limit);
};

// Static method to find bestsellers
bookSchema.statics.findBestsellers = function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ 'metadata.sales': -1, 'rating.average': -1 })
    .limit(limit);
};

// Static method for search with filters
bookSchema.statics.searchBooks = function(query, filters = {}) {
  const searchQuery = { isActive: true };
  
  // Text search
  if (query) {
    searchQuery.$text = { $search: query };
  }
  
  // Price range
  if (filters.minPrice || filters.maxPrice) {
    searchQuery.price = {};
    if (filters.minPrice) searchQuery.price.$gte = filters.minPrice;
    if (filters.maxPrice) searchQuery.price.$lte = filters.maxPrice;
  }
  
  // Categories
  if (filters.categories && filters.categories.length > 0) {
    searchQuery.categories = { $in: filters.categories };
  }
  
  // Rating
  if (filters.minRating) {
    searchQuery['rating.average'] = { $gte: filters.minRating };
  }
  
  // Format
  if (filters.format) {
    searchQuery.format = filters.format;
  }
  
  // Language
  if (filters.language) {
    searchQuery.language = filters.language;
  }
  
  // In stock only
  if (filters.inStockOnly) {
    searchQuery.$expr = { $gt: ['$stock', '$reservedStock'] };
  }
  
  return this.find(searchQuery);
};

// Static method for inventory statistics
bookSchema.statics.getInventoryStats = async function() {
  const [
    totalBooks,
    activeBooks,
    outOfStock,
    lowStock,
    avgPrice,
    totalValue
  ] = await Promise.all([
    this.countDocuments(),
    this.countDocuments({ isActive: true }),
    this.countDocuments({ $expr: { $eq: ['$stock', '$reservedStock'] } }),
    this.countDocuments({ $expr: { $and: [{ $gt: ['$stock', '$reservedStock'] }, { $lt: [{ $subtract: ['$stock', '$reservedStock'] }, 10] }] } }),
    this.aggregate([{ $group: { _id: null, avgPrice: { $avg: '$price' } } }]),
    this.aggregate([{ $group: { _id: null, totalValue: { $sum: { $multiply: ['$price', '$stock'] } } } }])
  ]);
  
  return {
    totalBooks,
    activeBooks,
    outOfStock,
    lowStock,
    averagePrice: avgPrice[0]?.avgPrice || 0,
    totalInventoryValue: totalValue[0]?.totalValue || 0,
  };
};

module.exports = mongoose.model('Book', bookSchema);

