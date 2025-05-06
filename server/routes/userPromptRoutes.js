const express = require('express');
const userPromptController = require('../controllers/userPromptController');

const router = express.Router();

// GET /api/v1/user_prompt?page=1&limit=10&user_id=...&prompt_id=...
router.get('/', userPromptController.getAllUserPrompts);

// POST /api/v1/user_prompt
router.post('/', userPromptController.createUserPrompt);

// GET /api/v1/user_prompt/user/:userId/prompt/:promptId
router.get('/user/:userId/prompt/:promptId', userPromptController.getUserPromptByKey);

// DELETE /api/v1/user_prompt/user/:userId/prompt/:promptId
router.delete('/user/:userId/prompt/:promptId', userPromptController.deleteUserPrompt);

module.exports = router; 