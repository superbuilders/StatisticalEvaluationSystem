const { UserPrompt, Evaluator, Prompt, sequelize } = require('../models');
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
 * Get all UserPrompt associations with pagination and filtering.
 * @param {object} options - Filtering and pagination options.
 * @param {number} [options.page=1] - Current page.
 * @param {number} [options.limit=10] - Items per page.
 * @param {string} [options.user_id] - Filter by user UUID.
 * @param {string} [options.prompt_id] - Filter by prompt UUID.
 * @returns {Promise<object>} - Paginated list of user-prompt associations.
 */
const getAllUserPrompts = async ({ page = 1, limit = 10, user_id, prompt_id }) => {
  const offset = getOffset(page, limit);
  const whereClause = {};

  if (user_id) {
    whereClause.user_id = user_id;
  }
  if (prompt_id) {
    whereClause.prompt_id = prompt_id;
  }

  try {
    const { count, rows } = await UserPrompt.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      // Include associated Evaluator and Prompt data
      include: [
        { model: Evaluator, as: 'evaluator', attributes: ['id', 'name'] }, // Select specific attributes
        { model: Prompt, as: 'prompt', attributes: ['id', 'description'] } // Select specific attributes
      ],
      order: [['created_at', 'DESC']], // Default order
    });

    return {
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      associations: rows,
    };
  } catch (error) {
    console.error('Error fetching user-prompt associations:', error);
    throw new Error('Could not retrieve user-prompt associations');
  }
};

/**
 * Find a specific UserPrompt association by its composite key.
 * @param {string} userId - User UUID.
 * @param {string} promptId - Prompt UUID.
 * @returns {Promise<UserPrompt|null>} - The association object or null if not found.
 */
const getUserPromptByCompositeKey = async (userId, promptId) => {
  try {
    const association = await UserPrompt.findOne({
      where: {
        user_id: userId,
        prompt_id: promptId,
      },
      include: [
        { model: Evaluator, as: 'evaluator', attributes: ['id', 'name'] },
        { model: Prompt, as: 'prompt', attributes: ['id', 'description'] }
      ],
    });
    return association;
  } catch (error) {
    console.error(`Error fetching user-prompt association for user ${userId} and prompt ${promptId}:`, error);
    throw new Error('Could not retrieve user-prompt association');
  }
};


/**
 * Create a new UserPrompt association.
 * @param {object} associationData - Data for the new association.
 * @param {string} associationData.user_id - User UUID.
 * @param {string} associationData.prompt_id - Prompt UUID.
 * @returns {Promise<UserPrompt>} - The newly created association object.
 */
const createUserPrompt = async (associationData) => {
  try {
    // Optional: Check if user and prompt exist before creating association
    const userExists = await Evaluator.findByPk(associationData.user_id);
    if (!userExists) {
        throw new Error(`Evaluator (User) with ID ${associationData.user_id} not found.`);
    }
    const promptExists = await Prompt.findByPk(associationData.prompt_id);
    if (!promptExists) {
        throw new Error(`Prompt with ID ${associationData.prompt_id} not found.`);
    }

    // Check if association already exists
    const existingAssociation = await UserPrompt.findOne({
        where: {
            user_id: associationData.user_id,
            prompt_id: associationData.prompt_id,
        }
    });
    if (existingAssociation) {
        throw new Error('This user-prompt association already exists.');
    }

    const newAssociation = await UserPrompt.create(associationData);
    // Optionally refetch with includes if needed immediately, otherwise return the basic object
    // return getUserPromptByCompositeKey(newAssociation.user_id, newAssociation.prompt_id);
    return newAssociation;
  } catch (error) {
    console.error('Error creating user-prompt association:', error);
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      throw new Error('Invalid user_id or prompt_id.');
    } else if (error.message.includes('not found') || error.message.includes('already exists')) {
      throw new Error(error.message); // Propagate specific validation messages
    }
    throw new Error('Could not create user-prompt association');
  }
};

/**
 * Delete a UserPrompt association by its composite key.
 * @param {string} userId - User UUID.
 * @param {string} promptId - Prompt UUID.
 * @returns {Promise<boolean>} - True if deletion was successful, false otherwise.
 */
const deleteUserPrompt = async (userId, promptId) => {
  try {
    const association = await UserPrompt.findOne({
      where: {
        user_id: userId,
        prompt_id: promptId,
      }
    });
    if (!association) {
      return false; // Indicate not found
    }
    await association.destroy();
    return true;
  } catch (error) {
    console.error(`Error deleting user-prompt association for user ${userId} and prompt ${promptId}:`, error);
    throw new Error('Could not delete user-prompt association');
  }
};

module.exports = {
  getAllUserPrompts,
  getUserPromptByCompositeKey,
  createUserPrompt,
  deleteUserPrompt,
}; 