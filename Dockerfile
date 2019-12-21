FROM node:12.13.1
EXPOSE 3000

WORKDIR /usr/src/ap
COPY . .
RUN npm install --no-cache
RUN npm run build

CMD [ "npm", "start" ]
