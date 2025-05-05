const providerService = require('../services/llmProviderService');
const { validationResult, body, query, param } = require('express-validator');

// Validation rules
const providerValidationRules = [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('hf_link').notEmpty().withMessage('Hugging Face link is required').isURL().withMessage('Invalid URL format for hf_link').trim(),
  body('country').optional({ checkFalsy: true }).trim(), // Optional, allows empty string
];

const paginationValidationRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer').toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100').toInt(), // Max limit
  query('search').optional().trim(),
  query('country').optional().trim(),
];

const idValidationRule = [
    param('id').isUUID(4).withMessage('Invalid provider ID format'),
];

// Middleware to handle validation results
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

/**
 * @swagger
 * tags:
 *   name: LLM Providers
 *   description: API for managing LLM Providers
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     LLMProvider:
 *       type: object
 *       required:
 *         - name
 *         - hf_link
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated id of the provider
 *         name:
 *           type: string
 *           description: The name of the LLM provider
 *         hf_link:
 *           type: string
 *           format: url
 *           description: Hugging Face link for the provider
 *         country:
 *           type: string
 *           nullable: true
 *           description: The country of the provider
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Timestamp of creation
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Timestamp of last update
 *       example:
 *         id: d290f1ee-6c54-4b01-90e6-d701748f0851
 *         name: OpenAI
 *         hf_link: https://huggingface.co/openai
 *         country: USA
 *         created_at: 2023-01-01T00:00:00.000Z
 *         updated_at: 2023-01-01T00:00:00.000Z
 *     LLMProviderInput:
 *       type: object
 *       required:
 *         - name
 *         - hf_link
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the LLM provider
 *         hf_link:
 *           type: string
 *           format: url
 *           description: Hugging Face link for the provider
 *         country:
 *           type: string
 *           nullable: true
 *           description: The country of the provider
 *       example:
 *         name: Cohere
 *         hf_link: https://huggingface.co/Cohere
 *         country: Canada
 *   parameters:
 *      providerId:
 *        in: path
 *        name: id
 *        schema:
 *          type: string
 *          format: uuid
 *        required: true
 *        description: The provider ID
 */

// Controller Functions

/**
 * @swagger
 * /api/v1/llm_provider:
 *   get:
 *     summary: Returns a list of LLM Providers with pagination and filtering
 *     tags: [LLM Providers]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for provider name
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         description: Filter by country
 *     responses:
 *       200:
 *         description: The list of LLM providers
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
 *                    type: integer
 *                 providers:
 *                    type: array
 *                    items:
 *                      $ref: '#/components/schemas/LLMProvider'
 *       422:
 *          description: Validation error (e.g., invalid page/limit)
 *       500:
 *          description: Server error
 */
exports.getAllProviders = [
  ...paginationValidationRules,
  validate,
  async (req, res, next) => {
    try {
      const { page, limit, search, country } = req.query;
      const result = await providerService.getAllProviders({ page, limit, search, country });
      res.status(200).json(result);
    } catch (error) {
      next(error); // Pass error to global error handler
    }
  }
];

/**
 * @swagger
 * /api/v1/llm_provider/{id}:
 *   get:
 *     summary: Get an LLM Provider by ID
 *     tags: [LLM Providers]
 *     parameters:
 *       - $ref: '#/components/parameters/providerId'
 *     responses:
 *       200:
 *         description: The LLM provider description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LLMProvider'
 *       404:
 *         description: Provider not found
 *       422:
 *         description: Validation error (invalid ID format)
 *       500:
 *         description: Server error
 */
exports.getProviderById = [
  ...idValidationRule,
  validate,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const provider = await providerService.getProviderById(id);
      if (!provider) {
        return res.status(404).json({ message: 'Provider not found' });
      }
      res.status(200).json(provider);
    } catch (error) {
      next(error);
    }
  }
];

/**
 * @swagger
 * /api/v1/llm_provider:
 *   post:
 *     summary: Create a new LLM Provider
 *     tags: [LLM Providers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LLMProviderInput'
 *     responses:
 *       201:
 *         description: The LLM provider was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LLMProvider'
 *       400:
 *         description: Bad request (e.g., validation error, provider already exists)
 *       422:
 *         description: Validation error (invalid input format)
 *       500:
 *         description: Server error
 */
exports.createProvider = [
  ...providerValidationRules,
  validate,
  async (req, res, next) => {
    try {
      const { name, hf_link, country } = req.body;
      // Ensure country is null if empty string after validation/trimming
      const providerData = {
        name,
        hf_link,
        country: country || null,
      };
      const newProvider = await providerService.createProvider(providerData);
      res.status(201).json(newProvider); // 201 Created
    } catch (error) {
       // Handle specific errors from service (like unique constraint)
       if (error.message.includes('already exist') || error.message.includes('Validation Error')) {
           return res.status(400).json({ message: error.message }); // Bad Request
       }
       next(error); // Pass other errors to global handler
    }
  }
];

/**
 * @swagger
 * /api/v1/llm_provider/{id}:
 *   put:
 *     summary: Update an existing LLM Provider
 *     tags: [LLM Providers]
 *     parameters:
 *       - $ref: '#/components/parameters/providerId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LLMProviderInput'
 *     responses:
 *       200:
 *         description: The LLM provider was successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LLMProvider'
 *       400:
 *         description: Bad request (e.g., validation error)
 *       404:
 *         description: Provider not found
 *       422:
 *         description: Validation error (invalid input format or ID)
 *       500:
 *         description: Server error
 */
exports.updateProvider = [
  ...idValidationRule,
  ...providerValidationRules, // Apply same validation rules for update
  validate,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, hf_link, country } = req.body;
      const updateData = {
        name,
        hf_link,
        country: country || null,
      };

      const updatedProvider = await providerService.updateProvider(id, updateData);

      if (!updatedProvider) {
        return res.status(404).json({ message: 'Provider not found' });
      }
      res.status(200).json(updatedProvider);
    } catch (error) {
       if (error.message.includes('Validation Error')) {
           return res.status(400).json({ message: error.message }); // Bad Request
       }
      next(error);
    }
  }
];

/**
 * @swagger
 * /api/v1/llm_provider/{id}:
 *   delete:
 *     summary: Delete an LLM Provider by ID
 *     tags: [LLM Providers]
 *     parameters:
 *       - $ref: '#/components/parameters/providerId'
 *     responses:
 *       204:
 *         description: Provider successfully deleted (No Content)
 *       400:
 *         description: Bad request (e.g., provider is referenced by other records)
 *       404:
 *         description: Provider not found
 *       422:
 *         description: Validation error (invalid ID format)
 *       500:
 *         description: Server error
 */
exports.deleteProvider = [
  ...idValidationRule,
  validate,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const deleted = await providerService.deleteProvider(id);
      if (!deleted) {
        return res.status(404).json({ message: 'Provider not found' });
      }
      res.status(204).send(); // 204 No Content
    } catch (error) {
       // Handle foreign key constraint error from service
       if (error.message.includes('referenced by other records')) {
           return res.status(400).json({ message: error.message }); // Bad Request - Cannot delete
       }
      next(error);
    }
  }
]; 