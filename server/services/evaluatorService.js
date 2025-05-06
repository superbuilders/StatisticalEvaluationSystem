const { Evaluator, sequelize } = require('../models');
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
 * Get all Evaluators with pagination and optional searching.
 * @param {object} options - Filtering and pagination options.
 * @param {number} [options.page=1] - Current page.
 * @param {number} [options.limit=10] - Items per page.
 * @param {string} [options.search] - Search term for name.
 * @returns {Promise<object>} - Paginated list of evaluators.
 */
const getAllEvaluators = async ({ page = 1, limit = 10, search }) => {
  const offset = getOffset(page, limit);
  const whereClause = {};

  if (search) {
    whereClause.name = { [Op.iLike]: `%${search}%` }; // Case-insensitive search
  }

  try {
    const { count, rows } = await Evaluator.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['name', 'ASC']], // Default order
    });

    return {
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      evaluators: rows, // Changed from 'providers' to 'evaluators'
    };
  } catch (error) {
    console.error('Error fetching evaluators:', error);
    throw new Error('Could not retrieve evaluators');
  }
};

/**
 * Get a single Evaluator by ID.
 * @param {string} id - Evaluator UUID.
 * @returns {Promise<Evaluator|null>} - The evaluator object or null if not found.
 */
const getEvaluatorById = async (id) => {
  try {
    const evaluator = await Evaluator.findByPk(id);
    return evaluator;
  } catch (error) {
    console.error(`Error fetching evaluator with id ${id}:`, error);
    throw new Error('Could not retrieve evaluator');
  }
};

/**
 * Create a new Evaluator.
 * @param {object} evaluatorData - Data for the new evaluator.
 * @param {string} evaluatorData.name - Name of the evaluator.
 * @returns {Promise<Evaluator>} - The newly created evaluator object.
 */
const createEvaluator = async (evaluatorData) => {
  try {
    const newEvaluator = await Evaluator.create(evaluatorData);
    return newEvaluator;
  } catch (error) {
    console.error('Error creating evaluator:', error);
    // Handle potential validation errors (e.g., unique constraints if added)
    if (error.name === 'SequelizeValidationError') {
      throw new Error(`Validation Error: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw new Error('Could not create evaluator');
  }
};

/**
 * Update an existing Evaluator.
 * @param {string} id - Evaluator UUID.
 * @param {object} updateData - Data to update.
 * @returns {Promise<Evaluator|null>} - The updated evaluator object or null if not found.
 */
const updateEvaluator = async (id, updateData) => {
  try {
    const evaluator = await Evaluator.findByPk(id);
    if (!evaluator) {
      return null; // Indicate not found
    }
    const updatedEvaluator = await evaluator.update(updateData);
    return updatedEvaluator;
  } catch (error) {
    console.error(`Error updating evaluator with id ${id}:`, error);
    // Handle potential validation errors
     if (error.name === 'SequelizeValidationError') {
      throw new Error(`Validation Error: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw new Error('Could not update evaluator');
  }
};

/**
 * Delete an Evaluator.
 * @param {string} id - Evaluator UUID.
 * @returns {Promise<boolean>} - True if deletion was successful, false otherwise.
 */
const deleteEvaluator = async (id) => {
  try {
    const evaluator = await Evaluator.findByPk(id);
    if (!evaluator) {
      return false; // Indicate not found
    }
    await evaluator.destroy();
    return true;
  } catch (error) {
    // Check for foreign key constraint errors
    if (error.name === 'SequelizeForeignKeyConstraintError') {
        console.error(`Deletion failed: Evaluator ${id} is referenced by other records (e.g., Feedback, UserPrompt, Score, Tag).`);
        throw new Error('Cannot delete evaluator because it is referenced by other records.');
    }
    console.error(`Error deleting evaluator with id ${id}:`, error);
    throw new Error('Could not delete evaluator');
  }
};

module.exports = {
  getAllEvaluators,
  getEvaluatorById,
  createEvaluator,
  updateEvaluator,
  deleteEvaluator,
}; 