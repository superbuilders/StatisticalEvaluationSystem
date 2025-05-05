const express = require('express');
const providerController = require('../controllers/llmProviderController');

const router = express.Router();

// GET /api/v1/llm_provider?page=1&limit=10&search=...&country=...
router.get('/', providerController.getAllProviders);

// POST /api/v1/llm_provider
router.post('/', providerController.createProvider);

// GET /api/v1/llm_provider/:id
router.get('/:id', providerController.getProviderById);

// PUT /api/v1/llm_provider/:id
router.put('/:id', providerController.updateProvider);

// DELETE /api/v1/llm_provider/:id
router.delete('/:id', providerController.deleteProvider);

module.exports = router; 