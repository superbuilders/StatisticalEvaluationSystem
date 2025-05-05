'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Prompt extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // Example: Prompt.belongsToMany(models.LLMModel, { through: 'LLMPrompt', foreignKey: 'prompt_id', as: 'models' });
      // Example: Prompt.belongsToMany(models.Evaluator, { through: 'UserPrompt', foreignKey: 'prompt_id', as: 'users' });
    }
  }

  Prompt.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    prompt: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    prompt_tokens: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1 // Based on CHECK constraint: positive_prompt_tokens
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true, // Default is nullable
    },
    created_at: {
      type: DataTypes.DATE,
      // Let the DB handle the default value
    },
    updated_at: {
      type: DataTypes.DATE,
      // Let the DB handle the default value via trigger
    },
  }, {
    sequelize,
    modelName: 'Prompt',
    tableName: 'prompt', // Match the table name in schema.sql
    timestamps: false, // Disable Sequelize's default timestamp fields (createdAt, updatedAt)
    underscored: true, // Use snake_case (created_at, updated_at)
    // Sequelize will automatically use the columns `created_at` and `updated_at`
    // if `timestamps: true` and `underscored: true`, but since we have DB defaults
    // and triggers, setting `timestamps: false` is often cleaner to avoid potential conflicts.
    // However, Sequelize can still *read* these columns if they exist.
  });

  return Prompt;
}; 