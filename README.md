# JobJournal Backend

A secure and scalable backend service for the JobJournal web application, built with Node.js, Express.js, and PostgreSQL. This service provides RESTful APIs for managing user accounts, job application data, and authentication using JWT. Designed to work seamlessly with the frontend to deliver a smooth and intuitive job tracking experience.

## Screenshots

![DemoImage](https://github.com/user-attachments/assets/a69db28d-dcf8-4e0c-9de3-4c2afadc72f2)

## Key Features

**RESTful API Architecture:** Well-structured endpoints for managing users and job application data.

**JWT Authentication:** Secure login and session management using JSON Web Tokens.

**PostgreSQL Integration:** Reliable, relational data storage for application and user data.

## Technologies Used

**Node.js:** Server-side JavaScript environment for handling API requests and business logic.  
**Express.js:** Web application framework to simplify routing and middleware management.  
**PostgreSQL:** Relational database management system for secure and scalable data storage. 
**JWT (JSON Web Tokens):** Secure authentication and session management.

## Installation & Setup

Follow the steps below to set up and run the application locally.

### 1. Clone the Repository

Begin by cloning both the repository to your local machine:

```bash
git clone https://github.com/SunandPolumuri/job-journal-service.git
cd job-journal-service
```

### 2. Backend Setup

Navigate to the backend directory:
```bash
cd job-journal-service
```
Install the required dependencies:
```bash
npm install
```
Create a .env file in the backend directory and add the following environment variables for your PostgreSQL setup and JWT configuration:
```ini
PORT=<desired-port>                  # Port for the backend server
PG_USER=<your-postgres-username>     # PostgreSQL user
PG_HOST=localhost                    # PostgreSQL host (use localhost if running locally)
PG_DATABASE=<your-database-name>     # PostgreSQL database name
PG_PASSWORD=<your-database-password> # PostgreSQL password
PG_PORT=<postgres-port>              # PostgreSQL port (default is 5432)
JWT_SECRET_KEY=<your-jwt-secret>     # Secret key for JWT authentication
```
Create Database Tables:  
Navigate to the `src/config/sql` folder inside the backend project. Inside, you'll find SQL commands to create the necessary tables.
Open the SQL files and run the commands in your local PostgreSQL instance to set up the required tables.  

Start the backend server using the development script:
```bash
npm run dev
```
The backend will now be running on http://localhost:3001 (or the port you have specified in your .env).
