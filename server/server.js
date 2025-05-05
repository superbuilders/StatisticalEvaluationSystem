require('dotenv').config(); // Load environment variables first

const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
// const db = require('./config/db'); // Keep or remove based on whether pg is still needed elsewhere
const { sequelize } = require('./models'); // Import Sequelize instance

const app = express();
const PORT = process.env.PORT || 3000;

// --- Swagger Setup ---
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Evaluation System API',
      version: '1.0.0',
      description: 'API documentation for the Evaluation System',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
    // Define components like security schemes here if needed later
    // components: { ... }
  },
  // Path to the API docs
  // Make sure this points to where your JSDoc comments are
  apis: ['./routes/*.js', './controllers/*.js'], // Scan routes and controllers
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
// --- End Swagger Setup ---

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// --- API Routes ---
const llmProviderRoutes = require('./routes/llmProviderRoutes');
const promptRoutes = require('./routes/promptRoutes'); // Import prompt routes
const llmModelRoutes = require('./routes/llmModelRoutes'); // Import model routes

// Root Route
app.get('/', (req, res) => {
  res.send('Evaluation System API is running!');
});

// Mount Resource Routes
app.use('/api/v1/llm_provider', llmProviderRoutes);
app.use('/api/v1/prompt', promptRoutes); // Mount prompt routes
app.use('/api/v1/llm_model', llmModelRoutes); // Mount model routes
// TODO: Add routes for other entities (e.g., /api/v1/models)

// --- API Playground Route ---
app.use('/api-playground', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// --- End API Playground Route ---

// --- Global Error Handler ---
// Improved error handling to send JSON response
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err.stack);
  // Default error status and message
  let statusCode = err.status || 500;
  let message = err.message || 'Internal Server Error';

  // Handle specific Sequelize errors if needed, or rely on service/controller handling
  // if (err.name === 'SequelizeValidationError') { ... }

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    // Optionally include stack trace in development
    // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// Start the server
const startServer = async () => {
  try {
    // Test the database connection using Sequelize
    await sequelize.authenticate();
    console.log('Database connection established successfully (Sequelize).');

    // Optional: Sync models (useful for development, creates tables if they don't exist)
    // Be cautious using sync in production with existing data.
    // await sequelize.sync({ force: false }); // force: true drops tables first!
    // console.log('Models synchronized with database.');

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

startServer(); 