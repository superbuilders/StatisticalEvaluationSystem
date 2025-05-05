const express = require('express');
const modelController = require('../controllers/llmModelController');

const router = express.Router();

// GET /api/v1/llm_model?page=1&limit=10&search=...&name=...&provider=...&license=...
// Handles both fetching all models (paginated) and filtered models (paginated)
router.get('/', modelController.getAllModels);

// POST /api/v1/llm_model
router.post('/', modelController.createModel);

// GET /api/v1/llm_model/:id
router.get('/:id', modelController.getModelById);

// PUT /api/v1/llm_model/:id
router.put('/:id', modelController.updateModel);

// DELETE /api/v1/llm_model/:id
router.delete('/:id', modelController.deleteModel);

module.exports = router; 