'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Evaluator extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // Example: Evaluator has many Feedbacks, UserPrompts, Scores, Tags
      // Evaluator.hasMany(models.Feedback, {
      //   foreignKey: 'user_id',
      //   as: 'feedbacks'
      // });
      Evaluator.hasMany(models.UserPrompt, {
        foreignKey: 'user_id',
        as: 'userPrompts'
      });

      // Add association to Prompt through UserPrompt
      Evaluator.belongsToMany(models.Prompt, {
        through: models.UserPrompt, // The junction model
        foreignKey: 'user_id', // Foreign key in the junction table that points to Evaluator
        otherKey: 'prompt_id', // Foreign key in the junction table that points to Prompt
        as: 'prompts' // Alias to access associated prompts from an evaluator instance
      });

      // Add other associations if needed (Score, Tag)
      //  Evaluator.hasMany(models.Score, {
      //    foreignKey: 'user_id',
      //    as: 'scores' // Alias for association from evaluator side
      //  });
      //  Evaluator.hasMany(models.Tag, {
      //    foreignKey: 'user_id',
      //    as: 'tags' // Alias for association from evaluator side
      //  });
    }
  }

  Evaluator.init({
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
    // created_at and updated_at are managed by the database trigger
    created_at: {
      type: DataTypes.DATE,
      // allowNull: false, // Let DB handle constraint
      // defaultValue: DataTypes.NOW // Let DB handle default
    },
    updated_at: {
      type: DataTypes.DATE,
      // allowNull: false, // Let DB handle constraint
      // defaultValue: DataTypes.NOW // Let DB handle trigger
    },
  }, {
    sequelize,
    modelName: 'Evaluator',
    tableName: 'evaluator', // Explicitly set table name
    timestamps: false, // Disable Sequelize timestamp management
    underscored: true, // Use snake_case (created_at, updated_at)
  });

  return Evaluator;
}; 