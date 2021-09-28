FROM node:14

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN npm install

# Install packages
RUN apt update
RUN apt install html-xml-utils

# Bundle app source
COPY . .

CMD [ "node", "nhl_helper.js"]