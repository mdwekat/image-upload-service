FROM node:12.13.1
EXPOSE 3000

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --no-cache
COPY . .
RUN npm run build

CMD [ "npm", "start" ]
