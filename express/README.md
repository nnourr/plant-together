# Plant Together - Express Application

This README will guide you through the steps to run the backend of Plant Together locally using Docker Compose.

## Components

The application uses Docker Compose to manage the following services:

1. **Express Server**: The main application server built with Express.js. It handles REST API requests and WebSocket connections.
2. **Postgres Database**: A local PostgreSQL database to store application data.
3. **pgAdmin**: A web-based DBMS tool for PostgreSQL, allowing you to manage and interact with your database.

## Prerequisites
Before you begin, ensure you have the following installed:
- Docker
- Docker Compose

## Installation
1. Clone the repository:
  ```bash
  git clone https://github.com/yourusername/plant-together.git
  ```
2. Navigate to the project directory:
  ```bash
  cd plant-together/express
  ```

## Environment Variables
Create a `.env` file in the `express` directory and add the following mandatory environment variables:
  
```plaintext
  ADMIN_EMAIL=your_pgadmin_default_email
  ADMIN_PASS=your_pgadmin_default_password
  DB_PASS=your_database_password
```

You can also change your database connection to an external database using the following variables:

```plaintext
  DB_HOST=your_database_host
  DB_PORT=your_database_port
  DB_NAME=your_database_name
  DB_USER=your_database_user
```

Finally, you can change the express server port using the `PORT` variable.

## Running the Server
1. Start the services using Docker Compose:
  ```bash
  docker compose up
  ```
2. Hit the `http://localhost:${PORT:-3000}` endpoint to see the application running.

3. Navigate to `http://localhost:5555` to login to pgAdmin using `ADMIN_EMAIL` and `ADMIN_PASSWORD` values.

4. Add New Server connection using the database details to gain access to the database.

