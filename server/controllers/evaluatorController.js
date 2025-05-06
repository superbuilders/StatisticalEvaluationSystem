const evaluatorService = require('../services/evaluatorService');
const { validationResult, body, query, param } = require('express-validator');

// Validation rules
const evaluatorValidationRules = [
  body('name').notEmpty().withMessage('Name is required').trim(),
];

const paginationValidationRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer').toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100').toInt(), // Max limit
  query('search').optional().trim(),
];

const idValidationRule = [
    param('id').isUUID(4).withMessage('Invalid user ID format'), // Changed message
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
 *   name: Users (Evaluators)
 *   description: API for managing Users (Evaluators in the database)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Evaluator:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated id of the evaluator
 *         name:
 *           type: string
 *           description: The name of the user (evaluator)
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Timestamp of creation
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Timestamp of last update
 *       example:
 *         id: a1b2c3d4-e5f6-7890-1234-567890abcdef
 *         name: Jane Doe
 *         created_at: 2023-10-27T10:00:00.000Z
 *         updated_at: 2023-10-27T10:00:00.000Z
 *     EvaluatorInput:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the user (evaluator)
 *       example:
 *         name: John Smith
 *   parameters:
 *      userId:
 *        in: path
 *        name: id
 *        schema:
 *          type: string
 *          format: uuid
 *        required: true
 *        description: The User (Evaluator) ID
 */

// Controller Functions

/**
 * @swagger
 * /api/v1/user:
 *   get:
 *     summary: Returns a list of Users (Evaluators) with pagination
 *     tags: [Users (Evaluators)]
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
 *         description: Search term for user name
 *     responses:
 *       200:
 *         description: The list of users
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
 *                 evaluators:
 *                    type: array
 *                    items:
 *                      $ref: '#/components/schemas/Evaluator'
 *       422:
 *          description: Validation error (e.g., invalid page/limit)
 *       500:
 *          description: Server error
 */
exports.getAllUsers = [
  ...paginationValidationRules,
  validate,
  async (req, res, next) => {
    try {
      const { page, limit, search } = req.query;
      const result = await evaluatorService.getAllEvaluators({ page, limit, search });
      // Rename key for consistency with endpoint path
      res.status(200).json({ ...result, users: result.evaluators, evaluators: undefined });
    } catch (error) {
      next(error); // Pass error to global error handler
    }
  }
];

/**
 * @swagger
 * /api/v1/user/{id}:
 *   get:
 *     summary: Get a User (Evaluator) by ID
 *     tags: [Users (Evaluators)]
 *     parameters:
 *       - $ref: '#/components/parameters/userId'
 *     responses:
 *       200:
 *         description: The user description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Evaluator'
 *       404:
 *         description: User not found
 *       422:
 *         description: Validation error (invalid ID format)
 *       500:
 *         description: Server error
 */
exports.getUserById = [
  ...idValidationRule,
  validate,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = await evaluatorService.getEvaluatorById(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }
];

/**
 * @swagger
 * /api/v1/user:
 *   post:
 *     summary: Create a new User (Evaluator)
 *     tags: [Users (Evaluators)]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EvaluatorInput'
 *     responses:
 *       201:
 *         description: The user was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Evaluator'
 *       400:
 *         description: Bad request (e.g., validation error)
 *       422:
 *         description: Validation error (invalid input format)
 *       500:
 *         description: Server error
 */
exports.createUser = [
  ...evaluatorValidationRules,
  validate,
  async (req, res, next) => {
    try {
      const { name } = req.body;
      const evaluatorData = { name };
      const newUser = await evaluatorService.createEvaluator(evaluatorData);
      res.status(201).json(newUser); // 201 Created
    } catch (error) {
       // Handle specific errors from service
       if (error.message.includes('Validation Error')) {
           return res.status(400).json({ message: error.message }); // Bad Request
       }
       next(error); // Pass other errors to global handler
    }
  }
];

/**
 * @swagger
 * /api/v1/user/{id}:
 *   put:
 *     summary: Update an existing User (Evaluator)
 *     tags: [Users (Evaluators)]
 *     parameters:
 *       - $ref: '#/components/parameters/userId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EvaluatorInput'
 *     responses:
 *       200:
 *         description: The user was successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Evaluator'
 *       400:
 *         description: Bad request (e.g., validation error)
 *       404:
 *         description: User not found
 *       422:
 *         description: Validation error (invalid input format or ID)
 *       500:
 *         description: Server error
 */
exports.updateUser = [
  ...idValidationRule,
  ...evaluatorValidationRules, // Apply same validation rules for update
  validate,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name } = req.body;
      const updateData = { name };

      const updatedUser = await evaluatorService.updateEvaluator(id, updateData);

      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(updatedUser);
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
 * /api/v1/user/{id}:
 *   delete:
 *     summary: Delete a User (Evaluator) by ID
 *     tags: [Users (Evaluators)]
 *     parameters:
 *       - $ref: '#/components/parameters/userId'
 *     responses:
 *       204:
 *         description: User successfully deleted (No Content)
 *       400:
 *         description: Bad request (e.g., user is referenced by other records)
 *       404:
 *         description: User not found
 *       422:
 *         description: Validation error (invalid ID format)
 *       500:
 *         description: Server error
 */
exports.deleteUser = [
  ...idValidationRule,
  validate,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const deleted = await evaluatorService.deleteEvaluator(id);
      if (!deleted) {
        return res.status(404).json({ message: 'User not found' });
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