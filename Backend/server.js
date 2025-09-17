// ====================================
// PHISHCHECK BACKEND - NODE.JS EXPRESS SERVER
// ====================================
// This is a production-ready backend for URL security scanning
// Structure: API Routes -> ML Service -> Python Model -> Response

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const sqlite3 = require('sqlite3').verbose();

// ====================================
// CONFIGURATION & CONSTANTS
// ====================================
const CONFIG = {
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    PYTHON_SCRIPT_PATH: path.join(__dirname, 'ml_model', 'predict.py'),
    LOG_FILE_PATH: path.join(__dirname, 'logs', 'scan_logs.json'),
    DB_PATH: path.join(__dirname, 'data', 'phishcheck.db'),
    RATE_LIMIT: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // limit each IP to 100 requests per windowMs
    }
};

// ====================================
// APP INITIALIZATION
// ====================================
const app = express();

// Security middleware
app.use(helmet()); // Security headers
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true
}));

// Rate limiting
const limiter = rateLimit(CONFIG.RATE_LIMIT);
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// ====================================
// DATABASE INITIALIZATION
// ====================================
class DatabaseManager {
    constructor() {
        this.db = null;
    }

    async initialize() {
        try {
            // Ensure data directory exists
            await fs.mkdir(path.dirname(CONFIG.DB_PATH), { recursive: true });
            
            this.db = new sqlite3.Database(CONFIG.DB_PATH);
            
            // Create logs table if it doesn't exist
            await this.runQuery(`
                CREATE TABLE IF NOT EXISTS scan_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    ip_address TEXT,
                    user_agent TEXT,
                    url_features TEXT,
                    prediction_result TEXT,
                    processing_time_ms INTEGER,
                    status TEXT
                )
            `);
            
            console.log('✅ Database initialized successfully');
        } catch (error) {
            console.error('❌ Database initialization failed:', error);
            throw error;
        }
    }

    runQuery(query, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(query, params, function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, changes: this.changes });
            });
        });
    }

    async logScan(logData) {
        try {
            await this.runQuery(`
                INSERT INTO scan_logs 
                (ip_address, user_agent, url_features, prediction_result, processing_time_ms, status)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [
                logData.ip_address,
                logData.user_agent,
                JSON.stringify(logData.url_features),
                JSON.stringify(logData.prediction_result),
                logData.processing_time_ms,
                logData.status
            ]);
        } catch (error) {
            console.error('❌ Failed to log scan:', error);
        }
    }
}

const dbManager = new DatabaseManager();

// ====================================
// ML MODEL SERVICE
// ====================================
class MLModelService {
    constructor() {
        this.isModelAvailable = false;
        this.checkModelAvailability();
    }

    async checkModelAvailability() {
        try {
            const modelDir = path.dirname(CONFIG.PYTHON_SCRIPT_PATH);
            const modelFile = path.join(modelDir, 'model.pkl');
            const encoderFile = path.join(modelDir, 'label_encoder.pkl');

            await fs.access(CONFIG.PYTHON_SCRIPT_PATH);
            await fs.access(modelFile);
            await fs.access(encoderFile);
            
            this.isModelAvailable = true;
            console.log('✅ ML Model files found and accessible');
        } catch (error) {
            console.error('❌ ML Model files not found:', error.message);
            console.log('📝 Expected structure:');
            console.log('   ml_model/');
            console.log('   ├── predict.py');
            console.log('   ├── model.pkl');
            console.log('   └── label_encoder.pkl');
        }
    }

    async predictURL(features) {
        if (!this.isModelAvailable) {
            throw new Error('ML Model is not available. Please check model files.');
        }

        return new Promise((resolve, reject) => {
            // Convert features object to JSON string for Python script
            const featuresJson = JSON.stringify(features);
            
            // Spawn Python process
            const pythonProcess = spawn('python', [CONFIG.PYTHON_SCRIPT_PATH], {
                stdio: ['pipe', 'pipe', 'pipe']
            });

            let outputData = '';
            let errorData = '';

            // Handle Python script output
            pythonProcess.stdout.on('data', (data) => {
                outputData += data.toString();
            });

            pythonProcess.stderr.on('data', (data) => {
                errorData += data.toString();
            });

            pythonProcess.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error(`Python script failed with code ${code}: ${errorData}`));
                    return;
                }

                try {
                    // Parse the JSON response from Python script
                    const result = JSON.parse(outputData.trim());
                    resolve(result);
                } catch (parseError) {
                    reject(new Error(`Failed to parse Python script output: ${parseError.message}`));
                }
            });

            pythonProcess.on('error', (error) => {
                reject(new Error(`Failed to start Python process: ${error.message}`));
            });

            // Send features data to Python script
            pythonProcess.stdin.write(featuresJson);
            pythonProcess.stdin.end();

            // Set timeout for the prediction process
            setTimeout(() => {
                pythonProcess.kill();
                reject(new Error('Prediction timeout - process took too long'));
            }, 30000); // 30 second timeout
        });
    }
}

const mlService = new MLModelService();

// ====================================
// INPUT VALIDATION
// ====================================
class InputValidator {
    static validateURLFeatures(features) {
        const errors = [];
        
        // Required numeric features
        const numericFeatures = [
            'url_length', 'number_of_dots', 'number_of_hyphens',
            'number_of_underscores', 'number_of_slashes', 'number_of_digits',
            'number_of_parameters'
        ];

        // Required boolean features
        const booleanFeatures = [
            'has_ip_address', 'has_https', 'has_shortening_service',
            'has_suspicious_words'
        ];

        // Validate numeric features
        numericFeatures.forEach(feature => {
            if (features[feature] === undefined || features[feature] === null) {
                errors.push(`Missing required feature: ${feature}`);
            } else if (!Number.isInteger(features[feature]) || features[feature] < 0) {
                errors.push(`Feature ${feature} must be a non-negative integer`);
            }
        });

        // Validate boolean features
        booleanFeatures.forEach(feature => {
            if (features[feature] === undefined || features[feature] === null) {
                errors.push(`Missing required feature: ${feature}`);
            } else if (typeof features[feature] !== 'boolean') {
                errors.push(`Feature ${feature} must be a boolean`);
            }
        });

        // Validate ranges
        if (features.url_length && features.url_length > 10000) {
            errors.push('URL length seems unreasonably large (>10000 characters)');
        }

        return errors;
    }
}

// ====================================
// API ROUTES
// ====================================

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        ml_model_available: mlService.isModelAvailable
    });
});

// Main URL checking endpoint
app.post('/api/check', async (req, res) => {
    const startTime = Date.now();
    let logData = {
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        url_features: req.body,
        prediction_result: null,
        processing_time_ms: 0,
        status: 'unknown'
    };

    try {
        // 1. Input validation
        console.log('🔍 Starting URL analysis...');
        
        if (!req.body || Object.keys(req.body).length === 0) {
            logData.status = 'validation_error';
            return res.status(400).json({
                error: 'Request body is required',
                message: 'Please provide URL features in the request body'
            });
        }

        // Validate required features
        const validationErrors = InputValidator.validateURLFeatures(req.body);
        if (validationErrors.length > 0) {
            logData.status = 'validation_error';
            return res.status(400).json({
                error: 'Invalid input features',
                details: validationErrors
            });
        }

        console.log('✅ Input validation passed');

        // 2. Call ML model for prediction
        console.log('🤖 Calling ML model...');
        const prediction = await mlService.predictURL(req.body);
        
        logData.prediction_result = prediction;
        logData.status = 'success';
        
        console.log('✅ ML model prediction completed:', prediction);

        // 3. Prepare response
        const response = {
            success: true,
            data: {
                status: prediction.status,
                risk_score: prediction.risk_score,
                message: prediction.message,
                confidence: prediction.confidence || null,
                features_analyzed: Object.keys(req.body).length
            },
            metadata: {
                processing_time_ms: Date.now() - startTime,
                timestamp: new Date().toISOString()
            }
        };

        // 4. Log the scan (async, don't wait)
        logData.processing_time_ms = Date.now() - startTime;
        dbManager.logScan(logData).catch(console.error);

        // 5. Send response
        res.json(response);
        console.log(`✅ Request completed in ${Date.now() - startTime}ms`);

    } catch (error) {
        console.error('❌ Error processing request:', error);
        
        logData.status = 'error';
        logData.processing_time_ms = Date.now() - startTime;
        
        // Log the error (async)
        dbManager.logScan(logData).catch(console.error);

        // Send error response
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: CONFIG.NODE_ENV === 'development' ? error.message : 'An error occurred while processing your request',
            metadata: {
                processing_time_ms: Date.now() - startTime,
                timestamp: new Date().toISOString()
            }
        });
    }
});

// Get scan statistics endpoint (optional)
app.get('/api/stats', async (req, res) => {
    try {
        // This is a simple implementation - in production you might want more sophisticated queries
        res.json({
            message: 'Statistics endpoint - implement based on your needs',
            total_scans: 'Query from database',
            success_rate: 'Calculate from logs',
            avg_processing_time: 'Calculate from logs'
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// ====================================
// ERROR HANDLING MIDDLEWARE
// ====================================
app.use((err, req, res, next) => {
    console.error('🚨 Unhandled error:', err);
    
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: CONFIG.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// Handle 404 for unknown routes
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        message: `The requested endpoint ${req.method} ${req.originalUrl} does not exist`
    });
});

// ====================================
// SERVER STARTUP
// ====================================
async function startServer() {
    try {
        // Initialize database
        await dbManager.initialize();
        
        // Ensure logs directory exists
        await fs.mkdir(path.dirname(CONFIG.LOG_FILE_PATH), { recursive: true });
        
        // Start server
        app.listen(CONFIG.PORT, () => {
            console.log('\n🚀 PhishCheck Backend Server Started!');
            console.log('=====================================');
            console.log(`📍 Server: http://localhost:${CONFIG.PORT}`);
            console.log(`🌍 Environment: ${CONFIG.NODE_ENV}`);
            console.log(`🤖 ML Model: ${mlService.isModelAvailable ? '✅ Available' : '❌ Not Available'}`);
            console.log(`📊 Health Check: http://localhost:${CONFIG.PORT}/api/health`);
            console.log(`🔍 URL Check: POST http://localhost:${CONFIG.PORT}/api/check`);
            console.log('=====================================\n');
            
            if (!mlService.isModelAvailable) {
                console.log('⚠️  WARNING: ML Model not available. Please ensure:');
                console.log('   - ml_model/predict.py exists');
                console.log('   - ml_model/model.pkl exists');
                console.log('   - ml_model/label_encoder.pkl exists\n');
            }
        });
        
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('🔄 Received SIGTERM, shutting down gracefully...');
    if (dbManager.db) {
        dbManager.db.close();
    }
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🔄 Received SIGINT, shutting down gracefully...');
    if (dbManager.db) {
        dbManager.db.close();
    }
    process.exit(0);
});

// Start the server
startServer();

module.exports = app;
