const express = require('express');
const promptController = require('../controllers/promptController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Prompts
 *   description: API for managing prompts
 */

/**
 * @swagger
 * /api/v1/prompt:
 *   get:
 *     summary: Retrieve a list of prompts with pagination
 *     tags: [Prompts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: A list of prompts.
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
 *                 prompts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Prompt' # Assuming you define schemas later
 *       500:
 *         description: Internal Server Error
 */
router.get('/', promptController.getAllPrompts);

/**
 * @swagger
 * /api/v1/prompt/{id}:
 *   get:
 *     summary: Retrieve a specific prompt by ID
 *     tags: [Prompts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the prompt to retrieve
 *     responses:
 *       200:
 *         description: Prompt data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Prompt'
 *       404:
 *         description: Prompt not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/:id', promptController.getPromptById);

/**
 * @swagger
 * /api/v1/prompt:
 *   post:
 *     summary: Create a new prompt
 *     tags: [Prompts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *               - prompt_tokens
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: The text of the prompt.
 *               prompt_tokens:
 *                 type: integer
 *                 description: The number of tokens in the prompt.
 *                 example: 50
 *               description:
 *                 type: string
 *                 description: Optional description for the prompt.
 *     responses:
 *       201:
 *         description: Prompt created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Prompt'
 *       400:
 *         description: Bad Request (e.g., missing fields, invalid data)
 *       500:
 *         description: Internal Server Error
 */
router.post('/', promptController.createPrompt);

/**
 * @swagger
 * /api/v1/prompt/{id}:
 *   put:
 *     summary: Update an existing prompt
 *     tags: [Prompts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the prompt to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: The updated text of the prompt.
 *               prompt_tokens:
 *                 type: integer
 *                 description: The updated number of tokens in the prompt.
 *                 example: 55
 *               description:
 *                 type: string
 *                 description: The updated description for the prompt.
 *     responses:
 *       200:
 *         description: Prompt updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Prompt'
 *       400:
 *         description: Bad Request (e.g., invalid data)
 *       404:
 *         description: Prompt not found
 *       500:
 *         description: Internal Server Error
 */
router.put('/:id', promptController.updatePrompt);

/**
 * @swagger
 * /api/v1/prompt/{id}:
 *   delete:
 *     summary: Delete a prompt
 *     tags: [Prompts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the prompt to delete
 *     responses:
 *       204:
 *         description: Prompt deleted successfully (No Content)
 *       400:
 *         description: Bad Request (e.g., cannot delete due to foreign key constraints)
 *       404:
 *         description: Prompt not found
 *       500:
 *         description: Internal Server Error
 */
router.delete('/:id', promptController.deletePrompt);

module.exports = router; 