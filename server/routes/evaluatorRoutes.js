const express = require('express');
const evaluatorController = require('../controllers/evaluatorController');

const router = express.Router();

// Note: The database table is 'evaluator', but the API route is '/user' as requested.

// GET /api/v1/user?page=1&limit=10&search=...
router.get('/', evaluatorController.getAllUsers); // Maps to getAllUsers

// POST /api/v1/user
router.post('/', evaluatorController.createUser); // Maps to createUser

// GET /api/v1/user/:id
router.get('/:id', evaluatorController.getUserById); // Maps to getUserById

// PUT /api/v1/user/:id
router.put('/:id', evaluatorController.updateUser); // Maps to updateUser

// DELETE /api/v1/user/:id
router.delete('/:id', evaluatorController.deleteUser); // Maps to deleteUser

module.exports = router; 