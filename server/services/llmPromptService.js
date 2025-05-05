const { LLMPrompt, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * Calculates offset for pagination.
 * @param {number} page - Current page number (1-indexed).
 * @param {number} limit - Number of items per page.
 * @returns {number} - Database offset.
 */
const getOffset = (page, limit) => {
  return (page - 1) * limit;
};

/**
 * Get all LLM-Prompt associations with pagination and filtering.
 * @param {object} options - Filtering and pagination options.
 * @param {number} [options.page=1] - Current page.
 * @param {number} [options.limit=10] - Items per page.
 * @param {string} [options.model_id] - Filter by model UUID.
 * @param {string} [options.prompt_id] - Filter by prompt UUID.
 * @returns {Promise<object>} - Paginated list of associations.
 */
const getAllLLMPrompts = async ({ page = 1, limit = 10, model_id, prompt_id }) => {
  const offset = getOffset(page, limit);
  const whereClause = {};

  if (model_id) {
    whereClause.model_id = model_id;
  }
  if (prompt_id) {
    whereClause.prompt_id = prompt_id;
  }

  try {
    const { count, rows } = await LLMPrompt.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['created_at', 'DESC']], // Default order, can be adjusted
      // Include associated models if needed
      // include: [
      //   { model: sequelize.models.LLMModel, as: 'llmModel' },
      //   { model: sequelize.models.Prompt, as: 'prompt' }
      // ]
    });

    return {
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      llmPrompts: rows,
    };
  } catch (error) {
    console.error('Error fetching LLM prompts:', error);
    throw new Error('Could not retrieve LLM prompts');
  }
};

/**
 * Get a single LLM-Prompt association by its composite key.
 * @param {string} model_id - Model UUID.
 * @param {string} prompt_id - Prompt UUID.
 * @returns {Promise<LLMPrompt|null>} - The association object or null if not found.
 */
const getLLMPromptByIds = async (model_id, prompt_id) => {
  try {
    const llmPrompt = await LLMPrompt.findOne({
      where: {
        model_id: model_id,
        prompt_id: prompt_id,
      },
      // Include associated models if needed
      // include: [...] 
    });
    return llmPrompt;
  } catch (error) {
    console.error(`Error fetching LLM prompt with model_id ${model_id} and prompt_id ${prompt_id}:`, error);
    throw new Error('Could not retrieve LLM prompt');
  }
};

/**
 * Create a new LLM-Prompt association.
 * @param {object} data - Data for the new association.
 * @param {string} data.model_id - Model UUID.
 * @param {string} data.prompt_id - Prompt UUID.
 * @param {number} [data.order] - Order value.
 * @returns {Promise<LLMPrompt>} - The newly created association object.
 */
const createLLMPrompt = async (data) => {
  try {
    // Add validation or checks if 'order' needs to be unique per model_id here if needed
    const newLLMPrompt = await LLMPrompt.create(data);
    return newLLMPrompt;
  } catch (error) {
    console.error('Error creating LLM prompt:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
       // Check if it's the primary key or the (model_id, order) unique constraint
       if (error.fields && error.fields.model_id && error.fields.prompt_id) {
           throw new Error('This model-prompt association already exists.');
       } else if (error.fields && error.fields.model_id && error.fields.order) {
           throw new Error('This order value is already used for the specified model.');
       } else {
           throw new Error('A unique constraint was violated.');
       }
    } else if (error.name === 'SequelizeForeignKeyConstraintError') {
        throw new Error('Invalid model_id or prompt_id provided.');
    } else if (error.name === 'SequelizeValidationError') {
        throw new Error(`Validation Error: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw new Error('Could not create LLM prompt association');
  }
};

/**
 * Update an existing LLM-Prompt association (only the order). // Primarily useful for order
 * @param {string} model_id - Model UUID.
 * @param {string} prompt_id - Prompt UUID.
 * @param {object} updateData - Data to update (likely just 'order').
 * @param {number} [updateData.order] - New order value.
 * @returns {Promise<LLMPrompt|null>} - The updated association object or null if not found.
 */
const updateLLMPrompt = async (model_id, prompt_id, updateData) => {
  try {
    const llmPrompt = await LLMPrompt.findOne({
      where: { model_id, prompt_id },
    });

    if (!llmPrompt) {
      return null; // Indicate not found
    }

    // Only allow updating specific fields, e.g., 'order'
    const allowedUpdates = { order: updateData.order };

    const updatedLLMPrompt = await llmPrompt.update(allowedUpdates);
    return updatedLLMPrompt;
  } catch (error) {
    console.error(`Error updating LLM prompt with model_id ${model_id}, prompt_id ${prompt_id}:`, error);
     if (error.name === 'SequelizeUniqueConstraintError') {
        // Specifically check for the (model_id, order) constraint
        if (error.fields && error.fields.model_id && error.fields.order) {
            throw new Error('This order value is already used for the specified model.');
        } else {
            throw new Error('A unique constraint was violated during update.');
        }
    } else if (error.name === 'SequelizeValidationError') {
        throw new Error(`Validation Error: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw new Error('Could not update LLM prompt association');
  }
};

/**
 * Delete an LLM-Prompt association.
 * @param {string} model_id - Model UUID.
 * @param {string} prompt_id - Prompt UUID.
 * @returns {Promise<boolean>} - True if deletion was successful, false otherwise.
 */
const deleteLLMPrompt = async (model_id, prompt_id) => {
  try {
    const llmPrompt = await LLMPrompt.findOne({
      where: { model_id, prompt_id },
    });

    if (!llmPrompt) {
      return false; // Indicate not found
    }

    await llmPrompt.destroy();
    return true;
  } catch (error) {
    // Junction table rows usually don't have FK constraints *on* them
    // but check just in case for specific DB setups
    console.error(`Error deleting LLM prompt with model_id ${model_id}, prompt_id ${prompt_id}:`, error);
    throw new Error('Could not delete LLM prompt association');
  }
};

module.exports = {
  getAllLLMPrompts,
  getLLMPromptByIds, // Renamed for clarity as it uses both IDs
  createLLMPrompt,
  updateLLMPrompt,
  deleteLLMPrompt,
}; 