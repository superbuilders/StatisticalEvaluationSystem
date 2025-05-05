'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class LLMProvider extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // Example: LLMProvider.hasMany(models.LLMModel, { foreignKey: 'provider', as: 'models' });
      LLMProvider.hasMany(models.LLMModel, {
          foreignKey: 'provider',
          as: 'llmModels' // Alias for the association from provider side
      });
    }
  }

  LLMProvider.init({
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
      allowNull: false, // Based on schema
      // Consider adding validation for URL format if desired
      // validate: {
      //   isUrl: true
      // }
    },
    country: {
      type: DataTypes.TEXT,
      allowNull: true, // Based on schema
    },
    // Define the columns because they exist in the DB, but Sequelize won't manage them
    // or validate their non-null status before insert/update.
    created_at: {
      type: DataTypes.DATE,
      // allowNull: false, // Remove this: Let the DB handle the NOT NULL constraint
      // defaultValue: DataTypes.NOW, // Rely on DB default
    },
    updated_at: {
      type: DataTypes.DATE,
      // allowNull: false, // Remove this: Let the DB handle the NOT NULL constraint
      // defaultValue: DataTypes.NOW, // Rely on DB trigger
    },
  }, {
    sequelize,
    modelName: 'LLMProvider',
    tableName: 'llm_provider', // Explicitly set table name to match schema.sql
    timestamps: false, // Disable Sequelize's timestamp management
    underscored: true, // Use snake_case for column names (created_at, updated_at)
    // If you want Sequelize to use the existing trigger function from schema.sql:
    // hooks: {
    //   beforeUpdate: (provider, options) => {
    //     // Sequelize usually handles updated_at, but this ensures consistency if trigger is primary
    //     // No explicit action needed here if timestamps: true and underscored: true work as expected
    //   }
    // }
  });

  return LLMProvider;
}; 