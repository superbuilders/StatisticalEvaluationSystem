const { Prompt } = require('../models'); // Assuming models/index.js exports all models

// Utility function for pagination (optional, can be in a helper file)
const getPagination = (page, size) => {
  const limit = size ? +size : 10; // Default limit to 10 items per page
  const offset = page ? (page - 1) * limit : 0;
  return { limit, offset };
};

// GET /prompt - Get all prompts with pagination
exports.getAllPrompts = async (req, res, next) => {
  const { page, size } = req.query; // Get page and size from query params
  const { limit, offset } = getPagination(page, size);

  try {
    const prompts = await Prompt.findAndCountAll({
      limit,
      offset,
      order: [['created_at', 'DESC']] // Optional: order by creation date
    });

    const response = {
      totalItems: prompts.count,
      totalPages: Math.ceil(prompts.count / limit),
      currentPage: page ? +page : 1,
      prompts: prompts.rows,
    };

    res.status(200).json(response);
  } catch (err) {
    next(err); // Pass error to global error handler
  }
};

// GET /prompt/:id - Get a specific prompt by ID
exports.getPromptById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const prompt = await Prompt.findByPk(id);
    if (!prompt) {
      return res.status(404).json({ message: 'Prompt not found' });
    }
    res.status(200).json(prompt);
  } catch (err) {
    next(err);
  }
};

// POST /prompt - Create a new prompt
exports.createPrompt = async (req, res, next) => {
  const { prompt, prompt_tokens, description } = req.body;

  // Basic validation
  if (!prompt || prompt_tokens === undefined) {
    return res.status(400).json({ message: 'Missing required fields: prompt and prompt_tokens' });
  }
  if (typeof prompt_tokens !== 'number' || prompt_tokens <= 0) {
      return res.status(400).json({ message: 'prompt_tokens must be a positive number' });
  }

  try {
    const newPrompt = await Prompt.create({
      prompt,
      prompt_tokens,
      description: description || null, // Handle optional description
    });
    res.status(201).json(newPrompt); // 201 Created
  } catch (err) {
     if (err.name === 'SequelizeValidationError') {
       return res.status(400).json({ message: err.errors.map(e => e.message).join(', ') });
     }
    next(err);
  }
};

// PUT /prompt/:id - Update an existing prompt
exports.updatePrompt = async (req, res, next) => {
  const { id } = req.params;
  const { prompt, prompt_tokens, description } = req.body;

  // Basic validation (optional: only update provided fields)
  if (prompt_tokens !== undefined && (typeof prompt_tokens !== 'number' || prompt_tokens <= 0)) {
    return res.status(400).json({ message: 'If provided, prompt_tokens must be a positive number' });
  }

  try {
    const promptToUpdate = await Prompt.findByPk(id);
    if (!promptToUpdate) {
      return res.status(404).json({ message: 'Prompt not found' });
    }

    // Update fields if they are provided in the request body
    if (prompt !== undefined) promptToUpdate.prompt = prompt;
    if (prompt_tokens !== undefined) promptToUpdate.prompt_tokens = prompt_tokens;
    if (description !== undefined) promptToUpdate.description = description;

    await promptToUpdate.save();
    res.status(200).json(promptToUpdate);
  } catch (err) {
     if (err.name === 'SequelizeValidationError') {
       return res.status(400).json({ message: err.errors.map(e => e.message).join(', ') });
     }
    next(err);
  }
};

// DELETE /prompt/:id - Delete a prompt
exports.deletePrompt = async (req, res, next) => {
  const { id } = req.params;
  try {
    const promptToDelete = await Prompt.findByPk(id);
    if (!promptToDelete) {
      return res.status(404).json({ message: 'Prompt not found' });
    }

    await promptToDelete.destroy();
    res.status(204).send(); // 204 No Content
  } catch (err) {
    // Handle potential foreign key constraint errors if needed
    if (err.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({ message: 'Cannot delete prompt as it is referenced by other records.', error: err.message });
    }
    next(err);
  }
}; 