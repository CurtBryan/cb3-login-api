FROM node:14-alpine

# Create app directory
WORKDIR /usr/src/app

ARG DB_URL

ENV DB_URL=${DB_URL}

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 8080
CMD [ "node", "app.js" ] 