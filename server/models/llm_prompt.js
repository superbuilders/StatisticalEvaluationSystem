'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class LLMPrompt extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define association to LLMModel
      LLMPrompt.belongsTo(models.LLMModel, {
        foreignKey: 'model_id',
        targetKey: 'id',
        as: 'llmModel' // Alias for the associated model
      });

      // Define association to Prompt
      LLMPrompt.belongsTo(models.Prompt, {
        foreignKey: 'prompt_id',
        targetKey: 'id',
        as: 'prompt' // Alias for the associated prompt
      });
    }
  }

  LLMPrompt.init({
    model_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true, // Part of the composite primary key
      references: {
        model: 'llm_model', // Name of the target table
        key: 'id'
      }
    },
    prompt_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true, // Part of the composite primary key
      references: {
        model: 'prompt', // Name of the target table
        key: 'id'
      }
    },
    order: {
      type: DataTypes.SMALLINT,
      allowNull: true, // Assuming order can be optional based on schema
      // Add unique constraint for model_id + order combination
      // Note: Sequelize doesn't directly support composite unique constraints
      // via init options easily. This is typically added via migrations or raw SQL.
      // We rely on the DB schema constraint: UNIQUE (model_id, "order")
    },
    created_at: {
      type: DataTypes.DATE,
      // Rely on DB default
    },
    updated_at: {
      type: DataTypes.DATE,
      // Rely on DB trigger
    },
  }, {
    sequelize,
    modelName: 'LLMPrompt',
    tableName: 'llm_prompt', // Explicitly set table name
    timestamps: false, // Disable Sequelize timestamp management
    underscored: true, // Use snake_case (matches schema)
    // Define composite primary key explicitly (though Sequelize infers it)
    primaryKey: ['model_id', 'prompt_id'],
  });

  return LLMPrompt;
}; 