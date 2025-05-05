const { LLMModel, LLMProvider, Prompt, sequelize } = require('../models'); // Adjust path as needed
const { Op } = require('sequelize');
const createError = require('http-errors');

/**
 * Fetch all LLM Models with pagination and filtering.
 * @param {object} options - Filtering and pagination options.
 * @param {number} [options.page=1] - Page number.
 * @param {number} [options.limit=10] - Items per page.
 * @param {string} [options.search] - Search term for model name.
 * @param {string} [options.name] - Filter by exact model name.
 * @param {string} [options.provider] - Filter by provider UUID.
 * @param {string} [options.license] - Filter by license.
 * @returns {Promise<object>} Paginated list of models.
 */
exports.getAllModels = async ({ page = 1, limit = 10, search, name, provider, license }) => {
    const offset = (page - 1) * limit;
    const whereClause = {};

    if (search) {
        whereClause.name = { [Op.iLike]: `%${search}%` }; // Case-insensitive search
    }
    if (name) {
        whereClause.name = name;
    }
    if (provider) {
        // Add validation upstream to ensure provider is a valid UUID
        whereClause.provider = provider;
    }
    if (license) {
        whereClause.license = { [Op.iLike]: `%${license}%` };
    }

    try {
        const { count, rows } = await LLMModel.findAndCountAll({
            where: whereClause,
            include: [
                { model: LLMProvider, as: 'llmProvider', attributes: ['id', 'name'] } // Include provider info
            ],
            limit: limit,
            offset: offset,
            order: [['name', 'ASC']], // Default ordering
        });

        return {
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            models: rows,
        };
    } catch (error) {
        console.error("Error fetching models:", error);
        throw createError(500, 'Error fetching models from database');
    }
};

/**
 * Fetch a single LLM Model by its ID.
 * @param {string} id - The UUID of the model.
 * @returns {Promise<LLMModel|null>} The model object or null if not found.
 */
exports.getModelById = async (id) => {
    try {
        const model = await LLMModel.findByPk(id, {
             include: [
                { model: LLMProvider, as: 'llmProvider', attributes: ['id', 'name'] } // Include provider info
            ],
        });
        return model;
    } catch (error) {
        console.error(`Error fetching model with ID ${id}:`, error);
        throw createError(500, 'Database error fetching model');
    }
};

/**
 * Create a new LLM Model.
 * @param {object} modelData - Data for the new model.
 * @returns {Promise<LLMModel>} The newly created model object.
 */
exports.createModel = async (modelData) => {
    try {
        // Optional: Check if provider UUID exists before creating
        const providerExists = await LLMProvider.findByPk(modelData.provider);
        if (!providerExists) {
            throw createError(400, `Provider with ID ${modelData.provider} not found.`);
        }

        const newModel = await LLMModel.create(modelData);
        // Refetch to include associations if needed for the response
        return await this.getModelById(newModel.id);
    } catch (error) {
        if (error instanceof createError.HttpError) {
            throw error; // Re-throw http-errors
        }
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
             console.error("Validation Error creating model:", error);
            throw createError(400, `Validation Error: ${error.errors.map(e => e.message).join(', ')}`);
        }
        console.error("Error creating model:", error);
        throw createError(500, 'Error creating model in database');
    }
};

/**
 * Update an existing LLM Model.
 * @param {string} id - The UUID of the model to update.
 * @param {object} updateData - Data to update the model with.
 * @returns {Promise<LLMModel|null>} The updated model object or null if not found.
 */
exports.updateModel = async (id, updateData) => {
    try {
        const model = await LLMModel.findByPk(id);
        if (!model) {
            return null; // Indicate not found
        }

        // Optional: Check if new provider UUID exists if it's being changed
        if (updateData.provider && updateData.provider !== model.provider) {
             const providerExists = await LLMProvider.findByPk(updateData.provider);
             if (!providerExists) {
                 throw createError(400, `Provider with ID ${updateData.provider} not found.`);
            }
        }

        await model.update(updateData);
        // Refetch to get updated data and associations
        return await this.getModelById(id);
    } catch (error) {
         if (error instanceof createError.HttpError) {
            throw error; // Re-throw http-errors
        }
        if (error.name === 'SequelizeValidationError') {
             console.error("Validation Error updating model:", error);
            throw createError(400, `Validation Error: ${error.errors.map(e => e.message).join(', ')}`);
        }
        console.error(`Error updating model with ID ${id}:`, error);
        throw createError(500, 'Error updating model in database');
    }
};

/**
 * Delete an LLM Model by its ID.
 * @param {string} id - The UUID of the model to delete.
 * @returns {Promise<boolean>} True if deletion was successful, false otherwise.
 */
exports.deleteModel = async (id) => {
    try {
        const model = await LLMModel.findByPk(id);
        if (!model) {
            return false; // Not found
        }
        await model.destroy();
        return true;
    } catch (error) {
         // Handle potential foreign key constraint errors (due to ON DELETE RESTRICT)
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            console.warn(`Attempted to delete model ${id} referenced by other records.`);
            // Customize this message as needed
            throw createError(400, 'Cannot delete model: it is referenced by other records (e.g., responses, prompts). You may need to delete associated records first.');
        }
        console.error(`Error deleting model with ID ${id}:`, error);
        throw createError(500, 'Error deleting model from database');
    }
}; 