'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class LLMModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define association here
      LLMModel.belongsTo(models.LLMProvider, {
        foreignKey: 'provider',
        as: 'llmProvider' // Alias for the association
      });
      // Define other associations if needed (e.g., with Prompt via llm_prompt)
      LLMModel.belongsToMany(models.Prompt, {
        through: 'llm_prompt', // Name of the junction table
        foreignKey: 'model_id',
        otherKey: 'prompt_id',
        as: 'prompts'
      });
    }
  }

  LLMModel.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    hf_link: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        // isUrl: true // Optional: Add URL validation if needed
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
    },
    provider: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'llm_provider', // Name of the target table
        key: 'id',
      },
    },
    license: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    version: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    param_count: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            min: 1 // Corresponds to CHECK (param_count > 0)
        }
    },
    top_p: {
      type: DataTypes.REAL,
      allowNull: true,
    },
    temperature: {
      type: DataTypes.REAL,
      allowNull: true,
    },
    min_tokens: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
          min: 0 // Assuming min_tokens cannot be negative
      }
    },
    max_tokens: {
      type: DataTypes.INTEGER,
      allowNull: true,
       validate: {
          min: 1 // Assuming max_tokens must be positive if set
      }
    },
    context_window: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1 // Corresponds to CHECK (context_window > 0)
      }
    },
    created_at: {
      type: DataTypes.DATE,
      // Let the DB handle default value and NOT NULL
    },
    updated_at: {
      type: DataTypes.DATE,
      // Let the DB handle default value and trigger
    },
  }, {
    sequelize,
    modelName: 'LLMModel',
    tableName: 'llm_model',
    timestamps: false, // Disable Sequelize's default timestamp handling
    underscored: true, // Use snake_case (created_at, updated_at)
    // No need for hooks if DB triggers handle updated_at
  });

  return LLMModel;
}; 