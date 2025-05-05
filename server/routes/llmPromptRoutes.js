const express = require('express');
const llmPromptController = require('../controllers/llmPromptController');

const router = express.Router();

// GET /api/v1/llm_prompt?page=1&limit=10&model_id=...&prompt_id=...
// Get all associations with optional filtering and pagination
router.get('/', llmPromptController.getAllLLMPrompts);

// POST /api/v1/llm_prompt
// Create a new association
router.post('/', llmPromptController.createLLMPrompt);

// PUT /api/v1/llm_prompt/:model_id/:prompt_id
// Update an existing association (specifically the 'order')
router.put('/:model_id/:prompt_id', llmPromptController.updateLLMPrompt);

// DELETE /api/v1/llm_prompt/:model_id/:prompt_id
// Delete an association by its composite key
router.delete('/:model_id/:prompt_id', llmPromptController.deleteLLMPrompt);

module.exports = router; 