/**
 * Password Analyzer Frontend
 * 
 * Interactive password analysis application featuring:
 * - Real-time entropy calculation and visualization
 * - Educational insights into cryptographic concepts
 * - Security assessment with detailed explanations
 * - Pattern detection and recommendations
 * - Beautiful, responsive design with animations
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Paper,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tabs,
  Tab,
  Button,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Security,
  Visibility,
  VisibilityOff,
  InfoOutlined,
  Warning,
  CheckCircle,
  Schedule,
  Psychology,
  AutoGraph,
  Shield,
  BugReport,
  Lightbulb,
  Speed,
  ExpandMore,
  ContentCopy,
  Refresh
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import toast, { Toaster } from 'react-hot-toast';
import debounce from 'lodash.debounce';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002';

function App() {
  // State
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [realtimeAnalysis, setRealtimeAnalysis] = useState(true);
  const [educationData, setEducationData] = useState({});

  // Debounced analysis function
  const debouncedAnalyze = useCallback(
    debounce(async (pwd) => {
      if (!pwd || pwd.length === 0) {
        setAnalysis(null);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.post(`${API_BASE_URL}/api/analyze`, {
          password: pwd
        });
        
        if (response.data.success) {
          setAnalysis(response.data.data);
        } else {
          setError(response.data.error);
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Analysis failed');
        console.error('Analysis error:', err);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  // Load educational data
  useEffect(() => {
    const loadEducationData = async () => {
      try {
        const [entropyRes, charsetRes, attacksRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/education/entropy`),
          axios.get(`${API_BASE_URL}/api/education/charsets`),
          axios.get(`${API_BASE_URL}/api/education/attacks`)
        ]);
        
        setEducationData({
          entropy: entropyRes.data.data,
          charsets: charsetRes.data.data,
          attacks: attacksRes.data.data
        });
      } catch (err) {
        console.error('Failed to load education data:', err);
      }
    };
    
    loadEducationData();
  }, []);

  // Trigger analysis when password changes
  useEffect(() => {
    if (realtimeAnalysis) {
      debouncedAnalyze(password);
    }
  }, [password, realtimeAnalysis, debouncedAnalyze]);

  // Manual analysis trigger
  const handleAnalyze = () => {
    if (password) {
      debouncedAnalyze(password);
    }
  };

  // Generate secure password
  const handleGeneratePassword = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/generate`, {
        targetEntropy: 70,
        includeSymbols: true,
        excludeSimilar: true
      });
      
      if (response.data.success) {
        setPassword(response.data.data.password);
        toast.success('Secure password generated!');
      }
    } catch (err) {
      toast.error('Failed to generate password');
    }
  };

  // Get strength color
  const getStrengthColor = (level) => {
    const colors = {
      very_weak: '#ff4444',
      weak: '#ff8800',
      fair: '#ffaa00',
      good: '#88cc00',
      strong: '#44cc00',
      very_strong: '#00aa44'
    };
    return colors[level] || '#gray';
  };

  // Format time for display
  const formatTime = (seconds) => {
    if (seconds < 1) return 'Instant';
    if (seconds < 60) return `${Math.round(seconds)} seconds`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
    if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
    if (seconds < 31536000000) return `${Math.round(seconds / 31536000)} years`;
    return `${Math.round(seconds / 31536000000)} centuries`;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Toaster position="top-right" />
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box textAlign="center" mb={4}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            🔐 Password Analyzer
          </Typography>
          <Typography variant="h6" color="text.secondary" mb={2}>
            Advanced Cryptographic Analysis with Shannon Entropy
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Understand your password's true strength through mathematical analysis
          </Typography>
        </Box>
      </motion.div>

      {/* Password Input Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Enter password to analyze"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  )
                }}
                sx={{ mb: 2 }}
              />
              <Box display="flex" alignItems="center" gap={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={realtimeAnalysis}
                      onChange={(e) => setRealtimeAnalysis(e.target.checked)}
                    />
                  }
                  label="Real-time analysis"
                />
                {!realtimeAnalysis && (
                  <Button
                    variant="contained"
                    onClick={handleAnalyze}
                    disabled={!password || loading}
                    startIcon={<Speed />}
                  >
                    Analyze
                  </Button>
                )}
                <Button
                  variant="outlined"
                  onClick={handleGeneratePassword}
                  startIcon={<Refresh />}
                >
                  Generate Secure
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              {analysis && (
                <Box textAlign="center">
                  <Typography variant="h4" fontWeight="bold" mb={1}>
                    {analysis.strength.score}/100
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={analysis.strength.percentage}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getStrengthColor(analysis.strength.level)
                      }
                    }}
                  />
                  <Chip
                    label={analysis.strength.level.replace('_', ' ').toUpperCase()}
                    sx={{
                      mt: 1,
                      backgroundColor: getStrengthColor(analysis.strength.level),
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                </Box>
              )}
            </Grid>
          </Grid>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {loading && (
            <Box mt={2}>
              <LinearProgress />
              <Typography variant="caption" display="block" textAlign="center" mt={1}>
                Analyzing password...
              </Typography>
            </Box>
          )}
        </Paper>
      </motion.div>

      {/* Analysis Results */}
      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {/* Tabs Navigation */}
            <Paper elevation={1} sx={{ mb: 2 }}>
              <Tabs
                value={activeTab}
                onChange={(e, v) => setActiveTab(v)}
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab icon={<AutoGraph />} label="Entropy Analysis" />
                <Tab icon={<BugReport />} label="Pattern Detection" />
                <Tab icon={<Schedule />} label="Crack Times" />
                <Tab icon={<Shield />} label="Security Assessment" />
                <Tab icon={<Lightbulb />} label="Recommendations" />
                <Tab icon={<Psychology />} label="Education" />
              </Tabs>
            </Paper>

            {/* Tab Panels */}
            {activeTab === 0 && <EntropyPanel analysis={analysis} />}
            {activeTab === 1 && <PatternsPanel analysis={analysis} />}
            {activeTab === 2 && <CrackTimesPanel analysis={analysis} />}
            {activeTab === 3 && <SecurityPanel analysis={analysis} />}
            {activeTab === 4 && <RecommendationsPanel analysis={analysis} />}
            {activeTab === 5 && <EducationPanel educationData={educationData} />}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <Box textAlign="center" mt={6} py={2}>
        <Typography variant="body2" color="text.secondary">
          Built with ❤️ for cybersecurity education • Shannon Entropy • Information Theory
        </Typography>
      </Box>
    </Container>
  );
}

// Entropy Analysis Panel
const EntropyPanel = ({ analysis }) => (
  <Grid container spacing={3}>
    <Grid item xs={12} md={6}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <AutoGraph sx={{ mr: 1, verticalAlign: 'middle' }} />
            Shannon Entropy
          </Typography>
          <Typography variant="h4" color="primary" gutterBottom>
            {analysis.entropy.shannon.totalBits.toFixed(2)} bits
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Per character: {analysis.entropy.shannon.bitsPerCharacter.toFixed(2)} bits
          </Typography>
          <LinearProgress
            variant="determinate"
            value={(analysis.entropy.shannon.totalBits / 128) * 100}
            sx={{ height: 8, borderRadius: 4, mb: 2 }}
          />
          <Typography variant="caption">
            Efficiency: {(analysis.entropy.shannon.efficiency * 100).toFixed(1)}%
          </Typography>
        </CardContent>
      </Card>
    </Grid>

    <Grid item xs={12} md={6}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Character Space Analysis
          </Typography>
          <Box mb={2}>
            <Typography variant="body2" gutterBottom>
              Character Space: {analysis.entropy.characterSet.characterSpace.toLocaleString()}
            </Typography>
            <Typography variant="body2" gutterBottom>
              Theoretical Max: {analysis.entropy.characterSet.totalBits.toFixed(2)} bits
            </Typography>
            <Typography variant="body2">
              Effective Entropy: {analysis.entropy.effective.value.toFixed(2)} bits
            </Typography>
          </Box>
          <Typography variant="caption" color="error">
            Reduction: -{analysis.entropy.effective.reductionPercentage.toFixed(1)}%
          </Typography>
        </CardContent>
      </Card>
    </Grid>

    <Grid item xs={12}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Character Composition
          </Typography>
          <Grid container spacing={2}>
            {[
              { name: 'Length', value: analysis.composition.length, icon: '📏' },
              { name: 'Unique Characters', value: analysis.composition.uniqueChars, icon: '🔤' },
              { name: 'Lowercase', value: analysis.composition.hasLowercase ? 'Yes' : 'No', icon: '🔡' },
              { name: 'Uppercase', value: analysis.composition.hasUppercase ? 'Yes' : 'No', icon: '🔠' },
              { name: 'Digits', value: analysis.composition.hasDigits ? 'Yes' : 'No', icon: '🔢' },
              { name: 'Symbols', value: analysis.composition.hasSymbols ? 'Yes' : 'No', icon: '🔣' }
            ].map((item, index) => (
              <Grid item xs={6} sm={4} md={2} key={index}>
                <Box textAlign="center" p={2}>
                  <Typography variant="h4" mb={1}>{item.icon}</Typography>
                  <Typography variant="body2" fontWeight="bold">{item.value}</Typography>
                  <Typography variant="caption" color="text.secondary">{item.name}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Grid>
  </Grid>
);

// Patterns Panel
const PatternsPanel = ({ analysis }) => (
  <Grid container spacing={3}>
    <Grid item xs={12}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <BugReport sx={{ mr: 1, verticalAlign: 'middle' }} />
            Pattern Detection Results
          </Typography>
          
          {analysis.patterns.detected.length === 0 ? (
            <Alert severity="success">
              <CheckCircle sx={{ mr: 1 }} />
              No weak patterns detected - excellent!
            </Alert>
          ) : (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Warning sx={{ mr: 1 }} />
              {analysis.patterns.totalPatterns} weak patterns detected
            </Alert>
          )}

          {analysis.patterns.detected.map((pattern, index) => (
            <Accordion key={index}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box display="flex" alignItems="center" width="100%">
                  <Typography sx={{ width: '40%', flexShrink: 0 }}>
                    {pattern.name.replace('_', ' ').toUpperCase()}
                  </Typography>
                  <Chip
                    label={`${pattern.matches} matches`}
                    color="warning"
                    size="small"
                    sx={{ mr: 2 }}
                  />
                  <Chip
                    label={`-${(pattern.penalty * 100).toFixed(0)}% entropy`}
                    color="error"
                    size="small"
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" paragraph>
                  {pattern.description}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Examples: {pattern.examples.join(', ')}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </CardContent>
      </Card>
    </Grid>
  </Grid>
);

// Crack Times Panel
const CrackTimesPanel = ({ analysis }) => (
  <Grid container spacing={3}>
    {Object.entries(analysis.crackTimes).map(([method, data], index) => (
      <Grid item xs={12} sm={6} md={4} key={index}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Typography>
            <Typography variant="h4" color={data.feasible ? 'error' : 'success'} gutterBottom>
              {data.display}
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              {data.attacksPerSecond.toLocaleString()} attempts/sec
            </Typography>
            <Chip
              label={data.feasible ? 'Vulnerable' : 'Secure'}
              color={data.feasible ? 'error' : 'success'}
              size="small"
            />
          </CardContent>
        </Card>
      </Grid>
    ))}
  </Grid>
);

// Security Panel
const SecurityPanel = ({ analysis }) => (
  <Grid container spacing={3}>
    <Grid item xs={12} md={6}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <Shield sx={{ mr: 1, verticalAlign: 'middle' }} />
            Security Level
          </Typography>
          <Box textAlign="center" py={2}>
            <Typography variant="h3" sx={{ color: analysis.security.color }} gutterBottom>
              {analysis.security.level.replace('_', ' ').toUpperCase()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {analysis.security.description}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Grid>

    <Grid item xs={12} md={6}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Compliance Check
          </Typography>
          <List>
            {Object.entries(analysis.security.compliance).map(([standard, data]) => (
              <ListItem key={standard}>
                <ListItemIcon>
                  {data.compliant ? <CheckCircle color="success" /> : <Warning color="warning" />}
                </ListItemIcon>
                <ListItemText
                  primary={standard.toUpperCase()}
                  secondary={data.compliant ? 'Compliant' : `Missing: ${data.missing.join(', ')}`}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Grid>

    {analysis.security.vulnerabilities.length > 0 && (
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom color="warning.main">
              <Warning sx={{ mr: 1, verticalAlign: 'middle' }} />
              Identified Vulnerabilities
            </Typography>
            <List>
              {analysis.security.vulnerabilities.map((vulnerability, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <Warning color="warning" />
                  </ListItemIcon>
                  <ListItemText primary={vulnerability} />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    )}
  </Grid>
);

// Recommendations Panel
const RecommendationsPanel = ({ analysis }) => (
  <Grid container spacing={3}>
    <Grid item xs={12}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <Lightbulb sx={{ mr: 1, verticalAlign: 'middle' }} />
            Improvement Recommendations
          </Typography>
          
          {analysis.recommendations.map((rec, index) => (
            <Alert
              key={index}
              severity={rec.priority === 'high' ? 'error' : rec.priority === 'medium' ? 'warning' : 'info'}
              sx={{ mb: 2 }}
            >
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                {rec.message}
              </Typography>
              <Typography variant="caption">
                Impact: {rec.impact}
              </Typography>
            </Alert>
          ))}
        </CardContent>
      </Card>
    </Grid>
  </Grid>
);

// Education Panel
const EducationPanel = ({ educationData }) => (
  <Grid container spacing={3}>
    <Grid item xs={12}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <Psychology sx={{ mr: 1, verticalAlign: 'middle' }} />
            Understanding Password Security
          </Typography>
          
          {educationData.entropy && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6">What is Entropy?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography paragraph>
                  {educationData.entropy.explanation.definition}
                </Typography>
                <Typography variant="h6" gutterBottom>Formula:</Typography>
                <Typography component="code" display="block" p={2} bgcolor="grey.100" mb={2}>
                  {educationData.entropy.explanation.formula}
                </Typography>
                <Typography paragraph>
                  {educationData.entropy.explanation.interpretation}
                </Typography>
              </AccordionDetails>
            </Accordion>
          )}

          {educationData.charsets && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6">Character Sets</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {educationData.charsets.characterSets.map((set, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Paper elevation={1} sx={{ p: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>{set.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Size: {set.size} characters
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Entropy/char: {set.entropy_per_char} bits
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          )}

          {educationData.attacks && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6">Attack Methods</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {educationData.attacks.attackTypes.map((attack, index) => (
                  <Paper key={index} elevation={1} sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h6" gutterBottom>{attack.name}</Typography>
                    <Typography paragraph>{attack.description}</Typography>
                    <Typography variant="body2" color="success.main" gutterBottom>
                      Defense: {attack.defense}
                    </Typography>
                  </Paper>
                ))}
              </AccordionDetails>
            </Accordion>
          )}
        </CardContent>
      </Card>
    </Grid>
  </Grid>
);

export default App;

