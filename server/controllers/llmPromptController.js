const llmPromptService = require('../services/llmPromptService');
const { validationResult, body, query, param } = require('express-validator');

// --- Validation Rules ---

// Validation for pagination and filtering query parameters
const listQueryValidationRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer').toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100').toInt(),
  query('model_id').optional().isUUID(4).withMessage('Invalid model_id format (UUID v4 required)').trim(),
  query('prompt_id').optional().isUUID(4).withMessage('Invalid prompt_id format (UUID v4 required)').trim(),
];

// Validation for request body (Create/Update)
const bodyValidationRules = [
  body('model_id').notEmpty().withMessage('model_id is required').isUUID(4).withMessage('Invalid model_id format').trim(),
  body('prompt_id').notEmpty().withMessage('prompt_id is required').isUUID(4).withMessage('Invalid prompt_id format').trim(),
  body('order').optional({ nullable: true }).isInt().withMessage('Order must be an integer').toInt(), // Allow null or integer
];

// Validation for composite key in path parameters (Update/Delete)
const pathIdsValidationRules = [
    param('model_id').isUUID(4).withMessage('Invalid model_id format in URL'),
    param('prompt_id').isUUID(4).withMessage('Invalid prompt_id format in URL'),
];

// Validation for the update request body (only order is updatable)
const updateBodyValidationRules = [
    body('order').optional({ nullable: true }).isInt().withMessage('Order must be an integer').toInt(),
    // Prevent other fields from being updated via PUT
    body('model_id').not().exists().withMessage('model_id cannot be updated'),
    body('prompt_id').not().exists().withMessage('prompt_id cannot be updated'),
];

// Middleware to handle validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  errors.array().map(err => extractedErrors.push({ [err.path || 'general']: err.msg }));

  return res.status(422).json({
    status: 'error',
    message: 'Validation failed',
    errors: extractedErrors,
  });
};

// --- Swagger Definitions ---
/**
 * @swagger
 * tags:
 *   name: LLM Prompts
 *   description: API for managing associations between LLM Models and Prompts
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     LLMPrompt:
 *       type: object
 *       required:
 *         - model_id
 *         - prompt_id
 *       properties:
 *         model_id:
 *           type: string
 *           format: uuid
 *           description: The ID of the associated LLM model
 *         prompt_id:
 *           type: string
 *           format: uuid
 *           description: The ID of the associated prompt
 *         order:
 *           type: integer
 *           format: int16
 *           nullable: true
 *           description: Optional order for the prompt within the model's sequence
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Timestamp of creation
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Timestamp of last update
 *       example:
 *         model_id: d290f1ee-6c54-4b01-90e6-d701748f0851
 *         prompt_id: f5a2b1e0-7d98-4c23-8e1a-9f0e8d7c6b34
 *         order: 1
 *         created_at: 2023-01-10T10:00:00.000Z
 *         updated_at: 2023-01-10T10:00:00.000Z
 *     LLMPromptInput:
 *       type: object
 *       required:
 *         - model_id
 *         - prompt_id
 *       properties:
 *         model_id:
 *           type: string
 *           format: uuid
 *           description: The ID of the LLM model
 *         prompt_id:
 *           type: string
 *           format: uuid
 *           description: The ID of the Prompt
 *         order:
 *           type: integer
 *           format: int16
 *           nullable: true
 *           description: Optional order
 *       example:
 *         model_id: d290f1ee-6c54-4b01-90e6-d701748f0851
 *         prompt_id: a1b2c3d4-e5f6-7890-1234-567890abcdef
 *         order: 2
 *     LLMPromptUpdateInput:
 *       type: object
 *       properties:
 *         order:
 *           type: integer
 *           format: int16
 *           nullable: true
 *           description: The new order value (optional)
 *       example:
 *         order: 5
 *   parameters:
 *     llmPromptModelId:
 *       in: path
 *       name: model_id
 *       schema:
 *         type: string
 *         format: uuid
 *       required: true
 *       description: The LLM Model ID
 *     llmPromptPromptId:
 *       in: path
 *       name: prompt_id
 *       schema:
 *         type: string
 *         format: uuid
 *       required: true
 *       description: The Prompt ID
 */

// --- Controller Functions ---

/**
 * @swagger
 * /api/v1/llm_prompt:
 *   get:
 *     summary: Returns a list of LLM-Prompt associations
 *     tags: [LLM Prompts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *         description: Number of items per page
 *       - in: query
 *         name: model_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by LLM Model ID
 *       - in: query
 *         name: prompt_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by Prompt ID
 *     responses:
 *       200:
 *         description: A paginated list of LLM-Prompt associations
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
 *                 llmPrompts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LLMPrompt'
 *       422:
 *         description: Validation error (e.g., invalid query parameter format)
 *       500:
 *         description: Server error
 */
exports.getAllLLMPrompts = [
  ...listQueryValidationRules,
  validate,
  async (req, res, next) => {
    try {
      const { page, limit, model_id, prompt_id } = req.query;
      const result = await llmPromptService.getAllLLMPrompts({ page, limit, model_id, prompt_id });
      res.status(200).json(result);
    } catch (error) {
      next(error); // Pass error to global error handler
    }
  }
];

/**
 * @swagger
 * /api/v1/llm_prompt:
 *   post:
 *     summary: Create a new LLM-Prompt association
 *     tags: [LLM Prompts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LLMPromptInput'
 *     responses:
 *       201:
 *         description: The LLM-Prompt association was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LLMPrompt'
 *       400:
 *         description: Bad request (e.g., association already exists, invalid foreign key, unique order violation)
 *       422:
 *         description: Validation error (invalid input format)
 *       500:
 *         description: Server error
 */
exports.createLLMPrompt = [
  ...bodyValidationRules,
  validate,
  async (req, res, next) => {
    try {
      const { model_id, prompt_id, order } = req.body;
      const data = {
        model_id,
        prompt_id,
        // Ensure order is null if not provided or explicitly null
        order: (order === undefined || order === null) ? null : order,
      };
      const newLLMPrompt = await llmPromptService.createLLMPrompt(data);
      res.status(201).json(newLLMPrompt); // 201 Created
    } catch (error) {
      // Handle specific errors from service
      if (error.message.includes('already exists') ||
          error.message.includes('Invalid model_id or prompt_id') ||
          error.message.includes('already used for the specified model') ||
          error.message.includes('Validation Error')) {
        return res.status(400).json({ status: 'error', message: error.message }); // Bad Request
      }
      next(error); // Pass other errors to global handler
    }
  }
];

/**
 * @swagger
 * /api/v1/llm_prompt/{model_id}/{prompt_id}:
 *   put:
 *     summary: Update the order of an existing LLM-Prompt association
 *     tags: [LLM Prompts]
 *     parameters:
 *       - $ref: '#/components/parameters/llmPromptModelId'
 *       - $ref: '#/components/parameters/llmPromptPromptId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LLMPromptUpdateInput'
 *     responses:
 *       200:
 *         description: The LLM-Prompt association order was successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LLMPrompt'
 *       400:
 *         description: Bad request (e.g., unique order violation)
 *       404:
 *         description: LLM-Prompt association not found
 *       422:
 *         description: Validation error (invalid input/path format, trying to update immutable fields)
 *       500:
 *         description: Server error
 */
exports.updateLLMPrompt = [
  ...pathIdsValidationRules,
  ...updateBodyValidationRules, // Validate body specifically for update
  validate,
  async (req, res, next) => {
    try {
      const { model_id, prompt_id } = req.params;
      const { order } = req.body; // Only expect 'order' in the body

      // Pass only the order field to the service for update
      const updateData = { order: (order === undefined || order === null) ? null : order };

      const updatedLLMPrompt = await llmPromptService.updateLLMPrompt(model_id, prompt_id, updateData);

      if (!updatedLLMPrompt) {
        return res.status(404).json({ status: 'error', message: 'LLM-Prompt association not found' });
      }
      res.status(200).json(updatedLLMPrompt);
    } catch (error) {
      if (error.message.includes('already used for the specified model') ||
          error.message.includes('Validation Error')) {
        return res.status(400).json({ status: 'error', message: error.message }); // Bad Request
      }
      next(error);
    }
  }
];

/**
 * @swagger
 * /api/v1/llm_prompt/{model_id}/{prompt_id}:
 *   delete:
 *     summary: Delete an LLM-Prompt association by its composite key
 *     tags: [LLM Prompts]
 *     parameters:
 *       - $ref: '#/components/parameters/llmPromptModelId'
 *       - $ref: '#/components/parameters/llmPromptPromptId'
 *     responses:
 *       204:
 *         description: Association successfully deleted (No Content)
 *       404:
 *         description: LLM-Prompt association not found
 *       422:
 *         description: Validation error (invalid ID format in URL)
 *       500:
 *         description: Server error
 */
exports.deleteLLMPrompt = [
  ...pathIdsValidationRules,
  validate,
  async (req, res, next) => {
    try {
      const { model_id, prompt_id } = req.params;
      const deleted = await llmPromptService.deleteLLMPrompt(model_id, prompt_id);
      if (!deleted) {
        return res.status(404).json({ status: 'error', message: 'LLM-Prompt association not found' });
      }
      res.status(204).send(); // 204 No Content
    } catch (error) {
      // Most errors should be caught by the service, pass others up
      next(error);
    }
  }
]; 