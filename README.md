# 2A4C
CNPM 20242

# Build with

![Yarn](docs/images/yarn-original.svg)

![Node JS](docs/images/nodejs-original-wordmark.svg)


# RUN

Set up the database:

Create `.env` file at the root of the project, you can read the instrcutions in the `.env.example` file to see the template, replace with the username and password you want to use or just use the default values.

After that, run the following commands:

```bash

docker-compose up -d # start the database
# docker-compose down # stop the database

After that, go to loccalhost:8080 to access the pgadmin interface, login with the credentials you set in the .env file.

```

Then, run the following commands:

```bash

cd app/backend # go to the backend directory
yarn install # install dependencies
yarn start # start the server
```


The process will be as follows:

User access to routes, which then calls the controller functions (may go throuhgt middelware berfore actual go to thet controller). The controller function hande the request, call the service functions, and return the response to the user. The services perfrom the business logic and interact with the database through the models. The models define the database structure and interact with the database. The database returns the data to the models, which then return the data to the services, and then to the controller, and finally to the user.