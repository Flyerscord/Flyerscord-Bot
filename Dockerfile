FROM node:16.10

# Set the timezone
ENV TZ=America/New_York
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

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