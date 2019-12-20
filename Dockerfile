FROM node:12.13.1

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production;

COPY . .

CMD [ "npm", "start" ]
