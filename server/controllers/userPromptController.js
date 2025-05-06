const userPromptService = require('../services/userPromptService');
const { validationResult, body, query, param } = require('express-validator');

// Validation rules
const createValidationRules = [
  body('user_id').isUUID(4).withMessage('Valid user_id (UUID v4) is required'),
  body('prompt_id').isUUID(4).withMessage('Valid prompt_id (UUID v4) is required'),
];

const queryValidationRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer').toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100').toInt(),
  query('user_id').optional().isUUID(4).withMessage('Invalid user_id format (UUID v4)'),
  query('prompt_id').optional().isUUID(4).withMessage('Invalid prompt_id format (UUID v4)'),
];

const compositeKeyValidationRules = [
    param('userId').isUUID(4).withMessage('Invalid user ID format (UUID v4)'),
    param('promptId').isUUID(4).withMessage('Invalid prompt ID format (UUID v4)'),
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
    errors: extractedErrors,
  });
};

/**
 * @swagger
 * tags:
 *   name: User Prompts
 *   description: API for managing associations between Users (Evaluators) and Prompts
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UserPromptAssociation:
 *       type: object
 *       properties:
 *         user_id:
 *           type: string
 *           format: uuid
 *           description: The ID of the associated user (evaluator)
 *         prompt_id:
 *           type: string
 *           format: uuid
 *           description: The ID of the associated prompt
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Timestamp of creation
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Timestamp of last update
 *         evaluator: # Included from association
 *           type: object
 *           properties:
 *              id:
 *                 type: string
 *                 format: uuid
 *              name:
 *                 type: string
 *           readOnly: true
 *         prompt: # Included from association
 *            type: object
 *            properties:
 *               id:
 *                  type: string
 *                  format: uuid
 *               description:
 *                  type: string
 *                  nullable: true
 *            readOnly: true
 *       example:
 *         user_id: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
 *         prompt_id: "f0e9d8c7-b6a5-4321-fedc-ba9876543210"
 *         created_at: "2023-10-27T10:00:00.000Z"
 *         updated_at: "2023-10-27T10:00:00.000Z"
 *         evaluator:
 *            id: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
 *            name: "Jane Doe"
 *         prompt:
 *            id: "f0e9d8c7-b6a5-4321-fedc-ba9876543210"
 *            description: "A creative writing prompt"
 *     UserPromptInput:
 *       type: object
 *       required:
 *         - user_id
 *         - prompt_id
 *       properties:
 *         user_id:
 *           type: string
 *           format: uuid
 *           description: The ID of the user (evaluator) to associate
 *         prompt_id:
 *           type: string
 *           format: uuid
 *           description: The ID of the prompt to associate
 *       example:
 *         user_id: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
 *         prompt_id: "f0e9d8c7-b6a5-4321-fedc-ba9876543210"
 *   parameters:
 *      userIdParam:
 *        in: path
 *        name: userId
 *        schema:
 *          type: string
 *          format: uuid
 *        required: true
 *        description: The user (evaluator) ID
 *      promptIdParam:
 *        in: path
 *        name: promptId
 *        schema:
 *          type: string
 *          format: uuid
 *        required: true
 *        description: The prompt ID
 */

// Controller Functions

/**
 * @swagger
 * /api/v1/user_prompt:
 *   get:
 *     summary: Returns a list of User-Prompt associations with pagination and filtering
 *     tags: [User Prompts]
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
 *         name: user_id
 *         schema: { type: string, format: uuid }
 *         description: Filter by User (Evaluator) ID
 *       - in: query
 *         name: prompt_id
 *         schema: { type: string, format: uuid }
 *         description: Filter by Prompt ID
 *     responses:
 *       200:
 *         description: A list of user-prompt associations.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalItems: { type: integer }
 *                 totalPages: { type: integer }
 *                 currentPage: { type: integer }
 *                 associations: {
 *                   type: array,
 *                   items: { $ref: '#/components/schemas/UserPromptAssociation' }
 *                 }
 *       422:
 *          description: Validation error (e.g., invalid page/limit/UUID format)
 *       500:
 *          description: Server error
 */
exports.getAllUserPrompts = [
  ...queryValidationRules,
  validate,
  async (req, res, next) => {
    try {
      const { page, limit, user_id, prompt_id } = req.query;
      const result = await userPromptService.getAllUserPrompts({ page, limit, user_id, prompt_id });
      res.status(200).json(result);
    } catch (error) {
      next(error); // Pass error to global error handler
    }
  }
];

/**
 * @swagger
 * /api/v1/user_prompt/user/{userId}/prompt/{promptId}:
 *   get:
 *     summary: Get a specific User-Prompt association by composite key
 *     tags: [User Prompts]
 *     parameters:
 *       - $ref: '#/components/parameters/userIdParam'
 *       - $ref: '#/components/parameters/promptIdParam'
 *     responses:
 *       200:
 *         description: The requested User-Prompt association
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/UserPromptAssociation' }
 *       404:
 *         description: Association not found
 *       422:
 *         description: Validation error (invalid UUID format)
 *       500:
 *         description: Server error
 */
exports.getUserPromptByKey = [
  ...compositeKeyValidationRules,
  validate,
  async (req, res, next) => {
    try {
      const { userId, promptId } = req.params;
      const association = await userPromptService.getUserPromptByCompositeKey(userId, promptId);
      if (!association) {
        return res.status(404).json({ message: 'User-Prompt association not found' });
      }
      res.status(200).json(association);
    } catch (error) {
      next(error);
    }
  }
];


/**
 * @swagger
 * /api/v1/user_prompt:
 *   post:
 *     summary: Create a new User-Prompt association
 *     tags: [User Prompts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UserPromptInput' }
 *     responses:
 *       201:
 *         description: The association was successfully created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/UserPromptAssociation' }
 *       400:
 *         description: Bad request (e.g., user/prompt not found, association already exists)
 *       422:
 *         description: Validation error (invalid input format)
 *       500:
 *         description: Server error
 */
exports.createUserPrompt = [
  ...createValidationRules,
  validate,
  async (req, res, next) => {
    try {
      const { user_id, prompt_id } = req.body;
      const associationData = { user_id, prompt_id };
      const newAssociation = await userPromptService.createUserPrompt(associationData);
      // Refetch to include associated data in the response
      const fullAssociation = await userPromptService.getUserPromptByCompositeKey(newAssociation.user_id, newAssociation.prompt_id);
      res.status(201).json(fullAssociation || newAssociation); // Send full data if refetch worked
    } catch (error) {
       // Handle specific errors from service
       if (error.message.includes('not found') || error.message.includes('already exists') || error.message.includes('Invalid')) {
           return res.status(400).json({ message: error.message }); // Bad Request
       }
       next(error); // Pass other errors to global handler
    }
  }
];

/**
 * @swagger
 * /api/v1/user_prompt/user/{userId}/prompt/{promptId}:
 *   delete:
 *     summary: Delete a User-Prompt association by composite key
 *     tags: [User Prompts]
 *     parameters:
 *       - $ref: '#/components/parameters/userIdParam'
 *       - $ref: '#/components/parameters/promptIdParam'
 *     responses:
 *       204:
 *         description: Association successfully deleted (No Content)
 *       404:
 *         description: Association not found
 *       422:
 *         description: Validation error (invalid UUID format)
 *       500:
 *         description: Server error
 */
exports.deleteUserPrompt = [
  ...compositeKeyValidationRules,
  validate,
  async (req, res, next) => {
    try {
      const { userId, promptId } = req.params;
      const deleted = await userPromptService.deleteUserPrompt(userId, promptId);
      if (!deleted) {
        return res.status(404).json({ message: 'User-Prompt association not found' });
      }
      res.status(204).send(); // 204 No Content
    } catch (error) {
      next(error);
    }
  }
]; 