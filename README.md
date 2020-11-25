# Online-Book-Store

A online book store, for sellers and buyers seperate

Project implemented in nodejs-express and mysql
## Setup

1. Clone this repo and run `npm i` in the root directory

2. Create .env file from .env.example as sample inside src/env/ with your credentials

3. create .env file from .env.example and update it with your db credentials inside /env/.env

4. `create database bookStore;` in mysql

5. run `node database/setup.js` to setup the database

6. run `node database/index.js` to setup sample data

7. run `npm start` to start the project (`node index.js`)

8. run `npm run lint` to debug code

## contributions

Visit [CONTRIBUTING.md](./contibuting.md) for contibution guidelines