const modelService = require('../services/llmModelService');
const { validationResult, body, query, param } = require('express-validator');

// --- Validation Rules ---

const modelBodyValidationRules = [
    body('name').notEmpty().withMessage('Name is required').trim(),
    body('hf_link').notEmpty().withMessage('Hugging Face link is required').isURL().withMessage('Invalid URL format for hf_link').trim(),
    body('description').optional().trim(), // description has default ''
    body('provider').notEmpty().withMessage('Provider ID is required').isUUID(4).withMessage('Invalid provider ID format'),
    body('license').optional({ checkFalsy: true }).trim(),
    body('version').notEmpty().withMessage('Version is required').trim(),
    body('param_count').notEmpty().withMessage('Parameter count is required').isInt({ min: 1 }).withMessage('Parameter count must be a positive integer').toInt(),
    body('top_p').optional({ checkFalsy: true }).isFloat({ min: 0, max: 1 }).withMessage('top_p must be a float between 0 and 1').toFloat(),
    body('temperature').optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage('Temperature must be a non-negative float').toFloat(),
    body('min_tokens').optional({ checkFalsy: true }).isInt({ min: 0 }).withMessage('min_tokens must be a non-negative integer').toInt(),
    body('max_tokens').optional({ checkFalsy: true }).isInt({ min: 1 }).withMessage('max_tokens must be a positive integer').toInt(),
    body('context_window').notEmpty().withMessage('Context window is required').isInt({ min: 1 }).withMessage('Context window must be a positive integer').toInt(),
];

const paginationAndFilterValidationRules = [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer').toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100').toInt(),
    query('search').optional().trim(), // General search on name
    query('name').optional().trim(), // Specific name filter
    query('provider').optional().isUUID(4).withMessage('Invalid provider ID format for filtering'), // Filter by provider ID
    query('license').optional().trim(), // Filter by license
];

const idValidationRule = [
    param('id').isUUID(4).withMessage('Invalid model ID format'),
];

// --- Validation Middleware ---
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));

    return res.status(422).json({
        errors: extractedErrors,
    });
};

// --- Controller Functions ---

/**
 * @swagger
 * tags:
 *   name: LLM Models
 *   description: API for managing LLM Models
 */

// (Add Swagger definitions for LLMModel, LLMModelInput similar to LLMProvider)

/**
 * @swagger
 * /api/v1/llm_model:
 *   get:
 *     summary: Returns a list of LLM Models with pagination and filtering
 *     tags: [LLM Models]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10, maximum: 100 }
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search term for model name (case-insensitive)
 *       - in: query
 *         name: name
 *         schema: { type: string }
 *         description: Filter by exact model name
 *       - in: query
 *         name: provider
 *         schema: { type: string, format: uuid }
 *         description: Filter by provider ID
 *       - in: query
 *         name: license
 *         schema: { type: string }
 *         description: Filter by license (case-insensitive)
 *     responses:
 *       200:
 *         description: Paginated list of LLM models
 *         content: 
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalItems: 
 *                   type: integer
 *                 totalPages: 
 *                   type: integer
 *                 currentPage: 
 *                   type: integer
 *                 models: 
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LLMModel' # Ensure LLMModel schema is defined elsewhere
 *       422:
 *          description: Validation error
 *       500:
 *          description: Server error
 */
exports.getAllModels = [
    ...paginationAndFilterValidationRules,
    validate,
    async (req, res, next) => {
        try {
            // Extract validated query parameters
            const { page, limit, search, name, provider, license } = req.query;
            const result = await modelService.getAllModels({ page, limit, search, name, provider, license });
            res.status(200).json(result);
        } catch (error) {
            next(error); // Pass error to global error handler
        }
    }
];

/**
 * @swagger
 * /api/v1/llm_model/{id}:
 *   get:
 *     summary: Get an LLM Model by ID
 *     tags: [LLM Models]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: The model ID
 *     responses:
 *       200:
 *         description: LLM model data
 *         content: { application/json: { schema: { $ref: '#/components/schemas/LLMModel' } } }
 *       404:
 *         description: Model not found
 *       422:
 *         description: Validation error (invalid ID format)
 *       500:
 *         description: Server error
 */
exports.getModelById = [
    ...idValidationRule,
    validate,
    async (req, res, next) => {
        try {
            const { id } = req.params;
            const model = await modelService.getModelById(id);
            if (!model) {
                // Use createError for standard HTTP errors
                return next(createError(404, 'Model not found'));
            }
            res.status(200).json(model);
        } catch (error) {
            next(error);
        }
    }
];

/**
 * @swagger
 * /api/v1/llm_model:
 *   post:
 *     summary: Create a new LLM Model
 *     tags: [LLM Models]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LLMModelInput' # Define LLMModelInput schema
 *     responses:
 *       201:
 *         description: Model successfully created
 *         content: { application/json: { schema: { $ref: '#/components/schemas/LLMModel' } } }
 *       400:
 *         description: Bad request (e.g., validation error, provider not found)
 *       422:
 *         description: Validation error (invalid input format)
 *       500:
 *         description: Server error
 */
exports.createModel = [
    ...modelBodyValidationRules,
    validate,
    async (req, res, next) => {
        try {
            // Data is already validated and sanitized by express-validator
            const modelData = req.body;
            const newModel = await modelService.createModel(modelData);
            res.status(201).json(newModel); // 201 Created
        } catch (error) {
            next(error); // Let service errors (like 400 for provider not found) pass through
        }
    }
];

/**
 * @swagger
 * /api/v1/llm_model/{id}:
 *   put:
 *     summary: Update an existing LLM Model
 *     tags: [LLM Models]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: The model ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LLMModelInput'
 *     responses:
 *       200:
 *         description: Model successfully updated
 *         content: { application/json: { schema: { $ref: '#/components/schemas/LLMModel' } } }
 *       400:
 *         description: Bad request (e.g., validation error, provider not found)
 *       404:
 *         description: Model not found
 *       422:
 *         description: Validation error (invalid input format or ID)
 *       500:
 *         description: Server error
 */
exports.updateModel = [
    ...idValidationRule,
    ...modelBodyValidationRules,
    validate,
    async (req, res, next) => {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const updatedModel = await modelService.updateModel(id, updateData);

            if (!updatedModel) {
                return next(createError(404, 'Model not found'));
            }
            res.status(200).json(updatedModel);
        } catch (error) {
            next(error);
        }
    }
];

/**
 * @swagger
 * /api/v1/llm_model/{id}:
 *   delete:
 *     summary: Delete an LLM Model by ID
 *     tags: [LLM Models]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: The model ID
 *     responses:
 *       204:
 *         description: Model successfully deleted (No Content)
 *       400:
 *         description: Bad request (e.g., model is referenced by other records)
 *       404:
 *         description: Model not found
 *       422:
 *         description: Validation error (invalid ID format)
 *       500:
 *         description: Server error
 */
exports.deleteModel = [
    ...idValidationRule,
    validate,
    async (req, res, next) => {
        try {
            const { id } = req.params;
            const deleted = await modelService.deleteModel(id);
            if (!deleted) {
                 return next(createError(404, 'Model not found'));
            }
            res.status(204).send(); // 204 No Content
        } catch (error) {
            next(error); // Let service errors (like 400 for foreign key constraint) pass through
        }
    }
]; 