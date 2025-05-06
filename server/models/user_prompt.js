'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class UserPrompt extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define association to Evaluator (User)
      UserPrompt.belongsTo(models.Evaluator, {
        foreignKey: 'user_id',
        as: 'evaluator', // Alias for the association
        targetKey: 'id'
      });

      // Define association to Prompt
      UserPrompt.belongsTo(models.Prompt, {
        foreignKey: 'prompt_id',
        as: 'prompt', // Alias for the association
        targetKey: 'id'
      });
    }
  }

  UserPrompt.init({
    user_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'evaluator', // Name of the target table
        key: 'id',
      }
    },
    prompt_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'prompt', // Name of the target table
        key: 'id',
      }
    },
    created_at: {
      type: DataTypes.DATE,
      // allowNull defaults to true, Sequelize won't set default if defaultValue missing
      // defaultValue: DataTypes.NOW, // Let DB handle default
    },
    updated_at: {
      type: DataTypes.DATE,
      // allowNull defaults to true
      // defaultValue: DataTypes.NOW, // Let DB handle default via trigger
    },
  }, {
    sequelize,
    modelName: 'UserPrompt',
    tableName: 'user_prompt', // Explicitly set table name
    timestamps: true, // Enable Sequelize timestamps (created_at, updated_at)
    underscored: true, // Use snake_case to match DB columns
    // No need for hooks if timestamps: true is used and matches DB trigger behavior
  });

  return UserPrompt;
}; 