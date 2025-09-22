/**
 * Password Analyzer API Server
 * 
 * RESTful API for advanced password analysis featuring:
 * - Shannon entropy calculation
 * - Pattern detection and scoring
 * - Brute force time estimation
 * - Security compliance checking
 * - Educational cryptographic insights
 * - Real-time analysis with caching
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const crypto = require('crypto');
require('dotenv').config();

// Import analyzers
const EntropyAnalyzer = require('./analyzers/EntropyAnalyzer');

// Create Express app
const app = express();
const PORT = process.env.PORT || 5002;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Initialize analyzer
const entropyAnalyzer = new EntropyAnalyzer();

// In-memory cache for analysis results (in production, use Redis)
const analysisCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Middleware setup
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Rate limiting - stricter for password analysis
const analysisLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: NODE_ENV === 'production' ? 50 : 1000, // 50 requests per windowMs in production
  message: {
    error: 'Too many password analysis requests. Please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: NODE_ENV === 'production' ? 200 : 2000,
});

app.use('/api/analyze', analysisLimiter);
app.use('/api', generalLimiter);

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan(NODE_ENV === 'development' ? 'dev' : 'combined'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Password Analyzer API',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    cache: {
      size: analysisCache.size,
      memoryUsage: process.memoryUsage()
    }
  });
});

/**
 * Main password analysis endpoint
 * POST /api/analyze
 */
app.post('/api/analyze', async (req, res) => {
  try {
    const { password, options = {} } = req.body;

    // Validate input
    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Password is required',
        code: 'MISSING_PASSWORD'
      });
    }

    if (typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Password must be a string',
        code: 'INVALID_PASSWORD_TYPE'
      });
    }

    if (password.length > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Password too long (max 1000 characters)',
        code: 'PASSWORD_TOO_LONG'
      });
    }

    // Create cache key (hash the password for security)
    const cacheKey = crypto.createHash('sha256').update(password + JSON.stringify(options)).digest('hex');
    
    // Check cache first
    if (analysisCache.has(cacheKey)) {
      const cached = analysisCache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_TTL) {
        return res.json({
          success: true,
          data: {
            ...cached.result,
            metadata: {
              ...cached.result.metadata,
              cached: true,
              cacheAge: Date.now() - cached.timestamp
            }
          }
        });
      } else {
        analysisCache.delete(cacheKey); // Remove expired cache
      }
    }

    // Perform analysis
    const startTime = Date.now();
    const analysis = entropyAnalyzer.analyze(password, options);
    const analysisTime = Date.now() - startTime;

    // Cache the result
    analysisCache.set(cacheKey, {
      result: analysis,
      timestamp: Date.now()
    });

    // Clean up old cache entries periodically
    cleanCache();

    res.json({
      success: true,
      data: {
        ...analysis,
        metadata: {
          ...analysis.metadata,
          cached: false,
          actualAnalysisTime: `${analysisTime}ms`,
          requestId: crypto.randomUUID()
        }
      }
    });

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      success: false,
      error: NODE_ENV === 'development' ? error.message : 'Analysis failed',
      code: 'ANALYSIS_ERROR'
    });
  }
});

/**
 * Batch analysis endpoint
 * POST /api/analyze/batch
 */
app.post('/api/analyze/batch', async (req, res) => {
  try {
    const { passwords, options = {} } = req.body;

    if (!Array.isArray(passwords)) {
      return res.status(400).json({
        success: false,
        error: 'Passwords must be an array',
        code: 'INVALID_BATCH_FORMAT'
      });
    }

    if (passwords.length > 10) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 10 passwords per batch',
        code: 'BATCH_TOO_LARGE'
      });
    }

    const results = [];
    const startTime = Date.now();

    for (const password of passwords) {
      try {
        const analysis = entropyAnalyzer.analyze(password, options);
        results.push({
          success: true,
          password: password.substring(0, 20) + (password.length > 20 ? '...' : ''), // Truncated for response
          data: analysis
        });
      } catch (error) {
        results.push({
          success: false,
          password: password.substring(0, 20) + (password.length > 20 ? '...' : ''),
          error: error.message
        });
      }
    }

    const totalTime = Date.now() - startTime;

    res.json({
      success: true,
      data: {
        results,
        summary: {
          total: passwords.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length,
          averageTime: `${(totalTime / passwords.length).toFixed(2)}ms`,
          totalTime: `${totalTime}ms`
        }
      }
    });

  } catch (error) {
    console.error('Batch analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Batch analysis failed',
      code: 'BATCH_ANALYSIS_ERROR'
    });
  }
});

/**
 * Password generation endpoint with entropy targeting
 * POST /api/generate
 */
app.post('/api/generate', (req, res) => {
  try {
    const {
      targetEntropy = 60,
      length,
      includeUppercase = true,
      includeLowercase = true,
      includeDigits = true,
      includeSymbols = false,
      excludeSimilar = true,
      excludeAmbiguous = true
    } = req.body;

    const password = generateSecurePassword({
      targetEntropy,
      length,
      includeUppercase,
      includeLowercase,
      includeDigits,
      includeSymbols,
      excludeSimilar,
      excludeAmbiguous
    });

    // Analyze the generated password
    const analysis = entropyAnalyzer.analyze(password);

    res.json({
      success: true,
      data: {
        password,
        analysis: {
          entropy: analysis.entropy,
          strength: analysis.strength,
          crackTimes: analysis.crackTimes
        },
        generation: {
          targetEntropy,
          actualEntropy: analysis.entropy.shannon.totalBits,
          entropyMatch: Math.abs(analysis.entropy.shannon.totalBits - targetEntropy) < 5
        }
      }
    });

  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Password generation failed',
      code: 'GENERATION_ERROR'
    });
  }
});

/**
 * Educational endpoints for cryptographic concepts
 */

// Entropy explanation
app.get('/api/education/entropy', (req, res) => {
  res.json({
    success: true,
    data: {
      title: 'Understanding Password Entropy',
      concept: 'Shannon Entropy in Information Theory',
      explanation: {
        definition: 'Entropy measures the unpredictability or randomness in a password',
        formula: 'H = -Σ(p * log2(p)) where p is the probability of each character',
        interpretation: 'Higher entropy = more unpredictable = stronger password',
        units: 'Measured in bits - each bit doubles the difficulty to crack'
      },
      examples: [
        {
          password: 'aaa',
          entropy: 0,
          explanation: 'No randomness - completely predictable'
        },
        {
          password: 'abc',
          entropy: 1.58,
          explanation: 'Some randomness but still very predictable'
        },
        {
          password: 'a1B!',
          entropy: 2.0,
          explanation: 'Good randomness with character diversity'
        }
      ],
      recommendations: [
        'Aim for at least 60 bits of entropy for strong passwords',
        'Use a mix of character types to increase entropy',
        'Longer passwords with random characters have higher entropy',
        'Avoid patterns that reduce effective entropy'
      ]
    }
  });
});

// Character sets information
app.get('/api/education/charsets', (req, res) => {
  res.json({
    success: true,
    data: {
      title: 'Character Sets and Password Strength',
      characterSets: [
        {
          name: 'Lowercase Letters',
          characters: 'a-z',
          size: 26,
          entropy_per_char: Math.log2(26).toFixed(2)
        },
        {
          name: 'Uppercase Letters',
          characters: 'A-Z',
          size: 26,
          entropy_per_char: Math.log2(26).toFixed(2)
        },
        {
          name: 'Digits',
          characters: '0-9',
          size: 10,
          entropy_per_char: Math.log2(10).toFixed(2)
        },
        {
          name: 'Basic Symbols',
          characters: '!@#$%^&*()_+-=[]{}|;:,.<>?',
          size: 32,
          entropy_per_char: Math.log2(32).toFixed(2)
        }
      ],
      combinations: [
        {
          sets: 'Lowercase only',
          size: 26,
          entropy_8_chars: (Math.log2(26) * 8).toFixed(2)
        },
        {
          sets: 'Lower + Upper',
          size: 52,
          entropy_8_chars: (Math.log2(52) * 8).toFixed(2)
        },
        {
          sets: 'Lower + Upper + Digits',
          size: 62,
          entropy_8_chars: (Math.log2(62) * 8).toFixed(2)
        },
        {
          sets: 'All character types',
          size: 94,
          entropy_8_chars: (Math.log2(94) * 8).toFixed(2)
        }
      ]
    }
  });
});

// Attack methods explanation
app.get('/api/education/attacks', (req, res) => {
  res.json({
    success: true,
    data: {
      title: 'Password Attack Methods and Defense',
      attackTypes: [
        {
          name: 'Brute Force',
          description: 'Try every possible combination systematically',
          speed: 'Depends on computing power and hash algorithm',
          defense: 'Use long passwords with high entropy'
        },
        {
          name: 'Dictionary Attack',
          description: 'Try common passwords and words from dictionaries',
          speed: 'Very fast - millions of attempts per second',
          defense: 'Avoid common passwords and dictionary words'
        },
        {
          name: 'Rainbow Tables',
          description: 'Precomputed hash tables for fast lookup',
          speed: 'Nearly instant for unsalted hashes',
          defense: 'Use salted hashes and unique passwords'
        },
        {
          name: 'Social Engineering',
          description: 'Guess passwords based on personal information',
          speed: 'Variable - depends on available information',
          defense: 'Avoid personal information in passwords'
        }
      ],
      hashingAlgorithms: [
        {
          name: 'MD5',
          speed: '1B+ hashes/sec',
          security: 'Obsolete - do not use',
          notes: 'Vulnerable to collision attacks'
        },
        {
          name: 'SHA-256',
          speed: '100M+ hashes/sec',
          security: 'Not recommended for passwords',
          notes: 'Too fast for password hashing'
        },
        {
          name: 'bcrypt',
          speed: '10K-100K hashes/sec',
          security: 'Good for passwords',
          notes: 'Adaptive cost factor'
        },
        {
          name: 'Argon2',
          speed: '1K-10K hashes/sec',
          security: 'Best current practice',
          notes: 'Memory-hard function'
        }
      ]
    }
  });
});

/**
 * Statistics endpoint
 */
app.get('/api/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      cache: {
        entries: analysisCache.size,
        hitRate: 'N/A', // Would need to track hits/misses
        memoryUsage: process.memoryUsage()
      },
      uptime: process.uptime(),
      version: '2.0.0',
      environment: NODE_ENV
    }
  });
});

/**
 * 404 handler
 */
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    code: 'NOT_FOUND',
    availableEndpoints: [
      'POST /api/analyze - Analyze single password',
      'POST /api/analyze/batch - Analyze multiple passwords',
      'POST /api/generate - Generate secure password',
      'GET /api/education/entropy - Learn about entropy',
      'GET /api/education/charsets - Character set information',
      'GET /api/education/attacks - Attack methods and defense',
      'GET /health - Health check'
    ]
  });
});

/**
 * Global error handler
 */
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({
    success: false,
    error: NODE_ENV === 'development' ? err.message : 'Internal server error',
    code: 'INTERNAL_ERROR'
  });
});

/**
 * Helper functions
 */

// Clean old cache entries
function cleanCache() {
  if (analysisCache.size > 1000) { // Limit cache size
    const now = Date.now();
    for (const [key, value] of analysisCache.entries()) {
      if (now - value.timestamp > CACHE_TTL) {
        analysisCache.delete(key);
      }
    }
  }
}

// Generate secure password
function generateSecurePassword(options) {
  let charset = '';
  
  if (options.includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
  if (options.includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (options.includeDigits) charset += '0123456789';
  if (options.includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  if (options.excludeSimilar) {
    charset = charset.replace(/[il1Lo0O]/g, '');
  }
  
  if (options.excludeAmbiguous) {
    charset = charset.replace(/[{}[\]()\/\\'"~,;<>.]/g, '');
  }

  const targetLength = options.length || Math.ceil(options.targetEntropy / Math.log2(charset.length));
  let password = '';
  
  for (let i = 0; i < targetLength; i++) {
    password += charset[crypto.randomInt(0, charset.length)];
  }
  
  return password;
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🔐 Password Analyzer API running on port ${PORT}`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
  console.log(`📚 Education: http://localhost:${PORT}/api/education/entropy`);
});

module.exports = app;

