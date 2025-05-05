require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') }); // Load .env file from project root

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres', // Specify PostgreSQL dialect
    dialectOptions: {
      // Add SSL options if needed for production/remote databases
      // ssl: {
      //   require: true,
      //   rejectUnauthorized: false // Adjust as needed for your SSL setup
      // }
    }
  },
  test: {
    username: process.env.DB_USER, // Use env vars or specific test DB config
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE_TEST || `${process.env.DB_DATABASE}_test`,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false // Disable logging for tests
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false, // Disable logging in production unless needed
    dialectOptions: {
      // Add SSL options if needed for production/remote databases
      // ssl: {
      //   require: true,
      //   rejectUnauthorized: false // Adjust as needed for your SSL setup
      // }
    },
    // Sequelize pool configuration (optional, defaults are usually fine)
    // pool: {
    //   max: 5,
    //   min: 0,
    //   acquire: 30000,
    //   idle: 10000
    // }
  }
};
