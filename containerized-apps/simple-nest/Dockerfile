ARG NODE_VERSION=18-alpine3.17

FROM node:${NODE_VERSION}

RUN npm install -g nest

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
