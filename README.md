# Discord Typescript Template

This is an object oriented Typescript template for a Discord.js bot.

The bot comes with the following features:

- Support for both slash and text commands
- Uses Enmap.js for its database
- Custom logging
- Production and non production modes
- Docker containers for prod and non-prod
- A Makefile file for easily building and running the Docker containers
- Prettier config file
- Eslint config

## Usage

Feel free to either fork this repo and build your bot off of it or download the download the code and use it as the starting point for your project.

## Configuration

There is a configuration file stored in src/config. In that directory there is a sample file, which can be either copied to or renamed to `config.json`. In this file there are the following fields:

- Production mode
  - token
    - The token for the bot to be used in production mode
  - prefix
    - The prefix to be used for text commands in production mode
- Non production mode
  - token
    - The token for the bot to be used in non-production mode
  - prefix
    - The prefix to be used for text commands in non-production mode
  - guildId
    - The id of the guild to be used for when registering slash commands in non-production mode

## Docker

There are 2 Docker containers included, one for production (Dockerfile) and one for non-production(dev-Dockerfile).

### Production

The Dockerfile for this container will build the Typescript in a builder stage and then copy the Javascript code to a runner image. This helps keep the size down by not needing to have the dev dependencies installed.

The docker-compose.yml file will build and run the container as well as create a volume for the database files.

### Non-Production

The dev-dockerfile file for this container will not build the typescipt. It only installs the production and dev dependencies.

The dev-docker-compose.yml file will will build and run the dev container. Since the image does not build the typescript, you will need to build the project (from outside the Docker container) with the command `tsc`. The dist directory is passed to the dev container, so once the project has been built the command `npm run rundev` can be run in the dev container. Anytime a new change is made to the project the dev container does NOT need to be rebuilt (unless changes were made to the package.json). Just kill the instance of the bot that is running in the container, rebuild the project, then run `npm run rundev` again.

### Makefile

There is a Makefile present to make using the Docker container easier. Running the tasks in the makefile will require GNU Make to be installed (available for Windows, Linux, MacOS). To run a task use the command `make TASKNAME` replaceing `TASKNAME` with the name of the task that you want to run. Below are the included tasks:

- docker
  - Sets the run mode of the bot to production and spins up the production Docker container.
- docker-dev
  - Sets the run mode of the bot to non-production and spins up the non-production Docker container.
- docker-dev2
  - Sets the run mode of the bot to non-production, destroys the non-production Docker container, brings up the non-production Docker container. This task should only really be used for debugging if something isn't acting quite right with the dev container.

