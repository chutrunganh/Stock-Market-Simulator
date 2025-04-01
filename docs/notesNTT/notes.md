index.js has the following usages:
1. Server set up 
- Creates Express application
- Configure middleware for JSON parsing and CORS (cross-origin resource sharing)
- Set up the server to listen on a specified port (default as 3000)
2. Database initialization
- Has function initializeDatabase() that creates databases tables.
- Ensure the database Schema is ready before the application start running.
3. Route management
- 


Backend src folders usage:
- config: contains configuration files for app. For example createUserTable.js handles database table creation or schema initialization, include database connection settings, environment configurations, .....
- controllers: handles the app's business logic and process the requests. For example userController.js contains functions that receive HTTP requests, process them, interact with services, send responses, manage the core logic CRUD (create, read, update, delete).
- middlewares: contains functions that process requests before they reach the final request handler. For example errorHandler.js logs error details. InputValidation.js check for valid inputs.
- models: defines data structures and database interactions. For example userModels.js defines the attributes of class User and method to retrieve User data from the database without sensitive contents (password).
- routes: provides API endpoints routes and their corresponding controllers. For example in userRoutes.js, we have responses for HTTP POST (validate then create user), HTTP GET (get all users and get by userID), HTTP PUT (validate input before update the specific user), HTTP DELETE (delete a specific user).
- services: handles complex logic, interacts with databases or external services. For example in userServices.js, we have some method that create and insert user into database, get all users/specific user from database, update an existed user in the database by their ID, delete existed user from the database.

Export is used so that the exported element can be used in the main application file such as index.js


Command to by pass when running yarn start

```
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```
