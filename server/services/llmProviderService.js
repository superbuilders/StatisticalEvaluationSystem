const { LLMProvider, sequelize } = require('../models'); // Adjust path if models/index.js exports differently
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
 * Get all LLM Providers with pagination and filtering.
 * @param {object} options - Filtering and pagination options.
 * @param {number} [options.page=1] - Current page.
 * @param {number} [options.limit=10] - Items per page.
 * @param {string} [options.search] - Search term for name.
 * @param {string} [options.country] - Filter by country.
 * @returns {Promise<object>} - Paginated list of providers.
 */
const getAllProviders = async ({ page = 1, limit = 10, search, country }) => {
  const offset = getOffset(page, limit);
  const whereClause = {};

  if (search) {
    whereClause.name = { [Op.iLike]: `%${search}%` }; // Case-insensitive search
  }
  if (country) {
    whereClause.country = { [Op.iLike]: country }; // Case-insensitive exact match for country
  }

  try {
    const { count, rows } = await LLMProvider.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['name', 'ASC']], // Default order
    });

    return {
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      providers: rows,
    };
  } catch (error) {
    console.error('Error fetching providers:', error);
    throw new Error('Could not retrieve providers');
  }
};

/**
 * Get a single LLM Provider by ID.
 * @param {string} id - Provider UUID.
 * @returns {Promise<LLMProvider|null>} - The provider object or null if not found.
 */
const getProviderById = async (id) => {
  try {
    const provider = await LLMProvider.findByPk(id);
    return provider;
  } catch (error) {
    console.error(`Error fetching provider with id ${id}:`, error);
    throw new Error('Could not retrieve provider');
  }
};

/**
 * Create a new LLM Provider.
 * @param {object} providerData - Data for the new provider.
 * @param {string} providerData.name - Name of the provider.
 * @param {string} providerData.hf_link - Hugging Face link.
 * @param {string} [providerData.country] - Country of the provider.
 * @returns {Promise<LLMProvider>} - The newly created provider object.
 */
const createProvider = async (providerData) => {
  try {
    const newProvider = await LLMProvider.create(providerData);
    return newProvider;
  } catch (error) {
    console.error('Error creating provider:', error);
    // Handle potential validation errors (e.g., unique constraints)
    if (error.name === 'SequelizeUniqueConstraintError') {
      throw new Error('Provider with this name or link might already exist.');
    } else if (error.name === 'SequelizeValidationError') {
      throw new Error(`Validation Error: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw new Error('Could not create provider');
  }
};

/**
 * Update an existing LLM Provider.
 * @param {string} id - Provider UUID.
 * @param {object} updateData - Data to update.
 * @returns {Promise<LLMProvider|null>} - The updated provider object or null if not found.
 */
const updateProvider = async (id, updateData) => {
  try {
    const provider = await LLMProvider.findByPk(id);
    if (!provider) {
      return null; // Indicate not found
    }
    const updatedProvider = await provider.update(updateData);
    return updatedProvider;
  } catch (error) {
    console.error(`Error updating provider with id ${id}:`, error);
    // Handle potential validation errors
     if (error.name === 'SequelizeValidationError') {
      throw new Error(`Validation Error: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw new Error('Could not update provider');
  }
};

/**
 * Delete an LLM Provider.
 * @param {string} id - Provider UUID.
 * @returns {Promise<boolean>} - True if deletion was successful, false otherwise.
 */
const deleteProvider = async (id) => {
  try {
    const provider = await LLMProvider.findByPk(id);
    if (!provider) {
      return false; // Indicate not found
    }
    await provider.destroy();
    return true;
  } catch (error) {
    // Check for foreign key constraint errors
    if (error.name === 'SequelizeForeignKeyConstraintError') {
        console.error(`Deletion failed: Provider ${id} is referenced by other records (e.g., LLM Models).`);
        throw new Error('Cannot delete provider because it is referenced by other records.');
    }
    console.error(`Error deleting provider with id ${id}:`, error);
    throw new Error('Could not delete provider');
  }
};

module.exports = {
  getAllProviders,
  getProviderById,
  createProvider,
  updateProvider,
  deleteProvider,
}; 