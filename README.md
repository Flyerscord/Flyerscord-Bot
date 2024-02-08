# Discord Typescript Template

This is an object oriented Typescript template for a Discord.js bot.

The bot comes with the following features:

- Support for both slash and text commands
- Uses Enmap.js for its database
- Custom logging
- Production and non production modes
- Docker containers for production and development
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

There are 2 Docker containers included, one for production (Dockerfile) and one for development(dev-Dockerfile).

### Production

The Dockerfile for this container will build the Typescript in a builder stage and then copy the Javascript code to a runner image. This helps keep the size down by not needing to have the dev dependencies installed.

The docker-compose.yml file will build and run the container as well as create a volume for the database files. This can be spun up using the command: `make prod`

This container can also be run in non-production mode so that you can test to make sure everything is working before pushing it to the live version. This can be spun up using the command: `make np`

### Development

The dev-dockerfile file for this container will not build the typescipt. It installs the production and dev dependencies, starts a background instance of tsc in watch mode, starts nodemon to watch the dist directory for changes.

The dev-docker-compose.yml file will build and run the dev container. The src directory is passed to the dev container, so that any changes that are made to the source code they will hot reload in the Docker container. The only time that the dev container will need to be rebuilt is when there are changes to the package.json or tsconfig.json files.

This can be spun up using the command: `make dev`

### Makefile

There is a Makefile present to make using the Docker container easier. Running the tasks in the makefile will require GNU Make to be installed (available for Windows, Linux, MacOS). To run a task use the command `make TASKNAME` replaceing `TASKNAME` with the name of the task that you want to run. Below are the included tasks:

- prod
  - Sets the run mode of the bot to production and spins up the production Docker container.
- np
  - Sets the run mode of the bot to non-production and spins up the production Docker container.
- dev
  - Sets the run mode of the bot to non-production and brings up the development Docker container.
