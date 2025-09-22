/**
 * Entropy Analyzer
 * 
 * Advanced password entropy analysis using Shannon's information theory
 * and cybersecurity best practices. Provides comprehensive password
 * strength assessment with mathematical precision.
 * 
 * Features:
 * - Shannon entropy calculation
 * - Character set analysis
 * - Pattern detection and scoring
 * - Brute force time estimation
 * - Dictionary attack resistance
 * - Custom entropy models
 */

const crypto = require('crypto');

class EntropyAnalyzer {
  constructor() {
    // Character sets for entropy calculation
    this.charSets = {
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      digits: '0123456789',
      symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
      extended: 'àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ', // Extended unicode
      space: ' '
    };

    // Common patterns that reduce entropy
    this.weakPatterns = [
      { pattern: /(.)\1{2,}/g, name: 'repeated_chars', penalty: 0.7 }, // aaa, 111
      { pattern: /(012|123|234|345|456|567|678|789|890)/gi, name: 'sequential_digits', penalty: 0.8 },
      { pattern: /(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/gi, name: 'sequential_letters', penalty: 0.8 },
      { pattern: /(qwer|wert|erty|rtyu|tyui|yuio|uiop|asdf|sdfg|dfgh|fghj|ghjk|hjkl|zxcv|xcvb|cvbn|vbnm)/gi, name: 'keyboard_patterns', penalty: 0.6 },
      { pattern: /^(.+)\1+$/g, name: 'repeated_substring', penalty: 0.5 }, // abcabc
      { pattern: /^(19|20)\d{2}$/g, name: 'year_pattern', penalty: 0.9 },
      { pattern: /(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])/g, name: 'date_pattern', penalty: 0.8 }
    ];

    // Common substitutions that don't add real entropy
    this.commonSubstitutions = {
      'a': '@', 'e': '3', 'i': '1', 'o': '0', 's': '$', 't': '7', 'l': '1'
    };

    // Performance benchmarks for different attack methods
    this.attackSpeeds = {
      online_throttled: 1000, // attempts per second (rate-limited)
      online_unthrottled: 1000000, // 1M attempts/sec
      offline_md5: 1000000000, // 1B attempts/sec (GPU)
      offline_bcrypt: 100000, // 100K attempts/sec
      offline_scrypt: 10000, // 10K attempts/sec
      offline_argon2: 5000 // 5K attempts/sec
    };
  }

  /**
   * Comprehensive password analysis
   */
  analyze(password) {
    if (!password || typeof password !== 'string') {
      throw new Error('Password must be a non-empty string');
    }

    const startTime = Date.now();

    // Basic metrics
    const basicMetrics = this.getBasicMetrics(password);
    
    // Entropy calculations
    const shannonEntropy = this.calculateShannonEntropy(password);
    const characterSetEntropy = this.calculateCharacterSetEntropy(password);
    const conditionalEntropy = this.calculateConditionalEntropy(password);
    
    // Pattern analysis
    const patternAnalysis = this.analyzePatterns(password);
    
    // Dictionary analysis
    const dictionaryAnalysis = this.analyzeDictionary(password);
    
    // Security assessment
    const securityAssessment = this.assessSecurity(password, shannonEntropy);
    
    // Time to crack estimation
    const crackTimes = this.estimateCrackTimes(characterSetEntropy, password.length);
    
    // Recommendations
    const recommendations = this.generateRecommendations(password, patternAnalysis, basicMetrics);
    
    const analysisTime = Date.now() - startTime;

    return {
      password: {
        value: password,
        length: password.length,
        hash: this.generatePasswordHash(password)
      },
      entropy: {
        shannon: shannonEntropy,
        characterSet: characterSetEntropy,
        conditional: conditionalEntropy,
        effective: this.calculateEffectiveEntropy(password, shannonEntropy, patternAnalysis)
      },
      strength: {
        score: this.calculateStrengthScore(shannonEntropy, patternAnalysis, basicMetrics),
        level: this.getStrengthLevel(shannonEntropy, patternAnalysis),
        percentage: Math.min(100, Math.max(0, (shannonEntropy / 128) * 100)) // Normalized to 128 bits
      },
      composition: basicMetrics,
      patterns: patternAnalysis,
      dictionary: dictionaryAnalysis,
      security: securityAssessment,
      crackTimes: crackTimes,
      recommendations: recommendations,
      metadata: {
        analysisTime: `${analysisTime}ms`,
        version: '2.0.0',
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Calculate Shannon entropy (information theory)
   */
  calculateShannonEntropy(password) {
    const charCount = {};
    const length = password.length;

    // Count character frequencies
    for (const char of password) {
      charCount[char] = (charCount[char] || 0) + 1;
    }

    // Calculate Shannon entropy: H = -Σ(p * log2(p))
    let entropy = 0;
    for (const count of Object.values(charCount)) {
      const probability = count / length;
      entropy -= probability * Math.log2(probability);
    }

    return {
      value: entropy,
      bitsPerCharacter: entropy,
      totalBits: entropy * length,
      maxPossibleEntropy: Math.log2(this.getCharacterSpace(password)),
      efficiency: entropy / Math.log2(this.getCharacterSpace(password))
    };
  }

  /**
   * Calculate entropy based on character set used
   */
  calculateCharacterSetEntropy(password) {
    const charSpace = this.getCharacterSpace(password);
    const entropy = Math.log2(charSpace) * password.length;
    
    return {
      value: entropy,
      characterSpace: charSpace,
      bitsPerCharacter: Math.log2(charSpace),
      totalBits: entropy
    };
  }

  /**
   * Calculate conditional entropy (considering character dependencies)
   */
  calculateConditionalEntropy(password) {
    if (password.length < 2) return 0;

    const bigramCounts = {};
    const charCounts = {};
    
    // Count characters and bigrams
    for (let i = 0; i < password.length - 1; i++) {
      const char = password[i];
      const bigram = password.substring(i, i + 2);
      
      charCounts[char] = (charCounts[char] || 0) + 1;
      bigramCounts[bigram] = (bigramCounts[bigram] || 0) + 1;
    }
    
    // Calculate conditional entropy H(Y|X) = H(X,Y) - H(X)
    let conditionalEntropy = 0;
    const totalBigrams = password.length - 1;
    
    for (const [bigram, count] of Object.entries(bigramCounts)) {
      const bigramProb = count / totalBigrams;
      const firstChar = bigram[0];
      const charProb = charCounts[firstChar] / (password.length - 1);
      const conditionalProb = bigramProb / charProb;
      
      conditionalEntropy -= bigramProb * Math.log2(conditionalProb);
    }

    return {
      value: conditionalEntropy,
      averageConditionalEntropy: conditionalEntropy / (password.length - 1),
      reduction: Math.max(0, this.calculateShannonEntropy(password).value - conditionalEntropy)
    };
  }

  /**
   * Analyze patterns that weaken passwords
   */
  analyzePatterns(password) {
    const patterns = [];
    let totalPenalty = 0;

    for (const { pattern, name, penalty } of this.weakPatterns) {
      const matches = password.match(pattern);
      if (matches) {
        patterns.push({
          name,
          matches: matches.length,
          examples: matches.slice(0, 3), // Show first 3 matches
          penalty,
          description: this.getPatternDescription(name)
        });
        totalPenalty += penalty * matches.length;
      }
    }

    // Check for common substitutions
    const substitutions = this.findCommonSubstitutions(password);
    if (substitutions.length > 0) {
      patterns.push({
        name: 'common_substitutions',
        matches: substitutions.length,
        examples: substitutions.slice(0, 3),
        penalty: 0.3,
        description: 'Uses predictable character substitutions'
      });
      totalPenalty += 0.3 * substitutions.length;
    }

    return {
      detected: patterns,
      totalPatterns: patterns.length,
      totalPenalty: Math.min(totalPenalty, 2.0), // Cap penalty
      entropyReduction: totalPenalty * 0.2 // 20% entropy reduction per penalty point
    };
  }

  /**
   * Dictionary attack analysis
   */
  analyzeDictionary(password) {
    // Simplified dictionary check (in production, use actual dictionaries)
    const commonPasswords = [
      'password', '123456', 'password123', 'admin', 'qwerty',
      'letmein', 'welcome', 'monkey', '1234567890', 'password1'
    ];

    const variations = this.generatePasswordVariations(password);
    const found = [];

    for (const variation of variations) {
      if (commonPasswords.includes(variation.toLowerCase())) {
        found.push({
          original: password,
          variation: variation,
          transformations: this.getTransformations(password, variation)
        });
      }
    }

    return {
      found: found.length > 0,
      matches: found,
      risk: found.length > 0 ? 'high' : 'low',
      recommendations: found.length > 0 ? ['Avoid common passwords and their variations'] : []
    };
  }

  /**
   * Security assessment
   */
  assessSecurity(password, shannonEntropy) {
    const entropy = shannonEntropy.totalBits;
    
    let level;
    let color;
    let description;

    if (entropy < 20) {
      level = 'very_weak';
      color = '#ff4444';
      description = 'Extremely vulnerable to all types of attacks';
    } else if (entropy < 40) {
      level = 'weak';
      color = '#ff8800';
      description = 'Vulnerable to dictionary and brute force attacks';
    } else if (entropy < 60) {
      level = 'fair';
      color = '#ffaa00';
      description = 'Provides basic security but could be improved';
    } else if (entropy < 80) {
      level = 'good';
      color = '#88cc00';
      description = 'Strong password with good resistance to attacks';
    } else if (entropy < 100) {
      level = 'strong';
      color = '#44cc00';
      description = 'Very strong password with excellent security';
    } else {
      level = 'very_strong';
      color = '#00aa44';
      description = 'Exceptionally strong password';
    }

    return {
      level,
      color,
      description,
      entropyBits: entropy,
      vulnerabilities: this.identifyVulnerabilities(password),
      compliance: this.checkCompliance(password)
    };
  }

  /**
   * Estimate time to crack password
   */
  estimateCrackTimes(characterSetEntropy, passwordLength) {
    const possibleCombinations = Math.pow(2, characterSetEntropy.value);
    const averageCombinations = possibleCombinations / 2; // On average, need to try half

    const crackTimes = {};

    for (const [method, speed] of Object.entries(this.attackSpeeds)) {
      const seconds = averageCombinations / speed;
      crackTimes[method] = {
        seconds,
        display: this.formatTime(seconds),
        feasible: seconds < (365 * 24 * 3600 * 100), // 100 years
        attacksPerSecond: speed
      };
    }

    return crackTimes;
  }

  /**
   * Generate improvement recommendations
   */
  generateRecommendations(password, patternAnalysis, basicMetrics) {
    const recommendations = [];

    if (password.length < 12) {
      recommendations.push({
        type: 'length',
        priority: 'high',
        message: `Increase length to at least 12 characters (current: ${password.length})`,
        impact: 'Exponentially increases security'
      });
    }

    if (!basicMetrics.hasUppercase) {
      recommendations.push({
        type: 'character_diversity',
        priority: 'medium',
        message: 'Add uppercase letters',
        impact: 'Increases character space from 26 to 52'
      });
    }

    if (!basicMetrics.hasDigits) {
      recommendations.push({
        type: 'character_diversity',
        priority: 'medium',
        message: 'Add numbers',
        impact: 'Increases character space by 10'
      });
    }

    if (!basicMetrics.hasSymbols) {
      recommendations.push({
        type: 'character_diversity',
        priority: 'medium',
        message: 'Add special characters (!@#$%^&*)',
        impact: 'Significantly increases character space'
      });
    }

    if (patternAnalysis.totalPatterns > 0) {
      recommendations.push({
        type: 'patterns',
        priority: 'high',
        message: 'Avoid predictable patterns and sequences',
        impact: 'Patterns make passwords much easier to guess'
      });
    }

    // Advanced recommendations
    recommendations.push({
      type: 'method',
      priority: 'low',
      message: 'Consider using a passphrase with random words',
      impact: 'Easier to remember while maintaining high entropy'
    });

    return recommendations;
  }

  /**
   * Get basic password metrics
   */
  getBasicMetrics(password) {
    return {
      length: password.length,
      hasLowercase: /[a-z]/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasDigits: /\d/.test(password),
      hasSymbols: /[!@#$%^&*()_+\-=\[\]{};':"|,.<>?]/.test(password),
      hasSpaces: /\s/.test(password),
      hasExtended: /[^\x00-\x7F]/.test(password),
      uniqueChars: new Set(password).size,
      averageCharCode: password.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) / password.length
    };
  }

  /**
   * Calculate effective entropy (adjusted for patterns)
   */
  calculateEffectiveEntropy(password, shannonEntropy, patternAnalysis) {
    const baseEntropy = shannonEntropy.totalBits;
    const reduction = patternAnalysis.entropyReduction * baseEntropy;
    const effective = Math.max(0, baseEntropy - reduction);

    return {
      value: effective,
      reduction: reduction,
      reductionPercentage: (reduction / baseEntropy) * 100
    };
  }

  /**
   * Calculate overall strength score (0-100)
   */
  calculateStrengthScore(shannonEntropy, patternAnalysis, basicMetrics) {
    let score = 0;

    // Base score from entropy (0-60 points)
    score += Math.min(60, (shannonEntropy.totalBits / 100) * 60);

    // Length bonus (0-20 points)
    score += Math.min(20, Math.max(0, (basicMetrics.length - 8) * 2));

    // Character diversity bonus (0-15 points)
    const diversityCount = [
      basicMetrics.hasLowercase,
      basicMetrics.hasUppercase,
      basicMetrics.hasDigits,
      basicMetrics.hasSymbols
    ].filter(Boolean).length;
    score += (diversityCount / 4) * 15;

    // Pattern penalty (0-20 points deduction)
    score -= Math.min(20, patternAnalysis.totalPenalty * 10);

    // Unique characters bonus (0-5 points)
    const uniqueRatio = basicMetrics.uniqueChars / basicMetrics.length;
    score += uniqueRatio * 5;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Get strength level from entropy and patterns
   */
  getStrengthLevel(shannonEntropy, patternAnalysis) {
    const entropy = shannonEntropy.totalBits;
    const hasPatterns = patternAnalysis.totalPatterns > 0;

    if (entropy < 20 || hasPatterns) return 'very_weak';
    if (entropy < 40) return 'weak';
    if (entropy < 60) return 'fair';
    if (entropy < 80) return 'good';
    if (entropy < 100) return 'strong';
    return 'very_strong';
  }

  /**
   * Get character space size
   */
  getCharacterSpace(password) {
    let space = 0;
    const metrics = this.getBasicMetrics(password);

    if (metrics.hasLowercase) space += 26;
    if (metrics.hasUppercase) space += 26;
    if (metrics.hasDigits) space += 10;
    if (metrics.hasSymbols) space += 32;
    if (metrics.hasSpaces) space += 1;
    if (metrics.hasExtended) space += 128; // Estimate

    return Math.max(space, 1);
  }

  /**
   * Generate password hash for comparison
   */
  generatePasswordHash(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  /**
   * Format time duration
   */
  formatTime(seconds) {
    if (seconds < 1) return 'Instant';
    if (seconds < 60) return `${Math.round(seconds)} seconds`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
    if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
    if (seconds < 31536000000) return `${Math.round(seconds / 31536000)} years`;
    return `${Math.round(seconds / 31536000000)} centuries`;
  }

  /**
   * Helper methods
   */
  getPatternDescription(patternName) {
    const descriptions = {
      repeated_chars: 'Contains repeated characters',
      sequential_digits: 'Contains sequential digits',
      sequential_letters: 'Contains sequential letters',
      keyboard_patterns: 'Contains keyboard patterns',
      repeated_substring: 'Contains repeated substrings',
      year_pattern: 'Contains year-like patterns',
      date_pattern: 'Contains date-like patterns',
      common_substitutions: 'Uses predictable character substitutions'
    };
    return descriptions[patternName] || 'Contains weak patterns';
  }

  findCommonSubstitutions(password) {
    const substitutions = [];
    for (const [original, substitute] of Object.entries(this.commonSubstitutions)) {
      if (password.includes(substitute)) {
        substitutions.push({ original, substitute });
      }
    }
    return substitutions;
  }

  generatePasswordVariations(password) {
    // Generate common variations for dictionary checking
    const variations = [password];
    
    // Reverse substitutions
    let reversed = password;
    for (const [original, substitute] of Object.entries(this.commonSubstitutions)) {
      reversed = reversed.replace(new RegExp(substitute, 'g'), original);
    }
    if (reversed !== password) variations.push(reversed);

    // Remove numbers
    const noNumbers = password.replace(/\d/g, '');
    if (noNumbers !== password) variations.push(noNumbers);

    // Lowercase
    variations.push(password.toLowerCase());

    return [...new Set(variations)]; // Remove duplicates
  }

  getTransformations(original, variation) {
    // Simple transformation detection
    return ['substitution', 'case_change', 'number_addition'];
  }

  identifyVulnerabilities(password) {
    const vulnerabilities = [];
    
    if (password.length < 8) {
      vulnerabilities.push('Too short for modern security standards');
    }
    
    if (!/[A-Z]/.test(password) && !/[a-z]/.test(password)) {
      vulnerabilities.push('Missing letter characters');
    }
    
    if (!/\d/.test(password)) {
      vulnerabilities.push('Missing numeric characters');
    }
    
    return vulnerabilities;
  }

  checkCompliance(password) {
    return {
      nist: this.checkNISTCompliance(password),
      owasp: this.checkOWASPCompliance(password),
      pci: this.checkPCICompliance(password)
    };
  }

  checkNISTCompliance(password) {
    return {
      compliant: password.length >= 8,
      requirements: ['Minimum 8 characters'],
      met: password.length >= 8 ? ['Length requirement'] : [],
      missing: password.length < 8 ? ['Minimum length'] : []
    };
  }

  checkOWASPCompliance(password) {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      digits: /\d/.test(password),
      special: /[!@#$%^&*]/.test(password)
    };
    
    const met = Object.entries(requirements).filter(([, value]) => value).map(([key]) => key);
    const missing = Object.entries(requirements).filter(([, value]) => !value).map(([key]) => key);
    
    return {
      compliant: met.length >= 3,
      requirements: ['3 of: uppercase, lowercase, digits, special chars'],
      met,
      missing
    };
  }

  checkPCICompliance(password) {
    const requirements = {
      length: password.length >= 8,
      complexity: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)
    };
    
    return {
      compliant: requirements.length && requirements.complexity,
      requirements: ['Minimum 8 characters', 'Must contain uppercase, lowercase, and digits'],
      met: Object.entries(requirements).filter(([, value]) => value).map(([key]) => key),
      missing: Object.entries(requirements).filter(([, value]) => !value).map(([key]) => key)
    };
  }
}

module.exports = EntropyAnalyzer;

