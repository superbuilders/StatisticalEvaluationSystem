# LLM Evaluation System Server

This directory contains the Express.js backend server for the LLM Evaluation System.

## Prerequisites

*   Node.js (v18 or later recommended)
*   npm or yarn
*   PostgreSQL database running
*   [Sequelize CLI](https://github.com/sequelize/cli) (installed via npm)

## Setup

1.  **Navigate to the server directory:**
    ```bash
    cd server
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    ```
3.  **Create a `.env` file:**
    Copy the `.env.example` file to `.env`:
    ```bash
    cp .env.example .env
    ```
4.  **Configure environment variables:**
    Edit the `.env` file and replace the placeholder values with your actual database credentials and desired server port.

5.  **Set up the database:**
    Ensure your PostgreSQL server is running and you have created the database specified in your `.env` file (`DB_DATABASE`).

    You have two options for schema management:
    *   **Option A (Using original SQL schema):** Run the schema script provided:
        ```bash
        # Make sure you are in the project root, not the server directory
        psql -U your_db_user -d your_db_name -a -f evaluation_system/db/schema.sql
        ```
        *(Adjust user and db name. This is suitable if you prefer managing the schema manually)*
    *   **Option B (Using Sequelize Migrations - Recommended for future changes):**
        If you want Sequelize to manage the schema, you would typically create migration files for each table change instead of running the raw SQL. If migrations are created (check the `migrations/` folder), run:
        ```bash
        # Make sure you are in the server directory
        npx sequelize-cli db:migrate
        ```
        *(Note: We haven't automatically created migrations for the existing schema in this setup, so Option A is the primary way for now unless you create migrations manually or via `sequelize-cli model:generate --name ... --attributes ...`)*

## Running the Server

*   **Development Mode (with automatic restarts):**
    ```bash
    npm run dev
    # or
    # yarn dev
    ```
*   **Production Mode:**
    ```bash
    npm start
    # or
    # yarn start
    ```

The server should now be running on the port specified in your `.env` file (default is 3000).

## Project Structure

*   `config/`: Database configuration (including Sequelize `config.js`).
*   `controllers/`: Request handlers (logic connecting routes to services).
*   `middleware/`: Custom middleware functions (e.g., validation handlers).
*   `models/`: Sequelize model definitions and `index.js` setup.
*   `migrations/`: Sequelize database migration files.
*   `seeders/`: Sequelize database seeder files.
*   `services/`: Business logic and database interaction layer.
*   `routes/`: API route definitions.
*   `server.js`: Main application entry point.
*   `.env`: Environment variables (ignored by Git).
*   `.env.example`: Example environment variables.
*   `package.json`: Project dependencies and scripts.

## API Endpoints

*(TODO: Document API endpoints as they are created)* 