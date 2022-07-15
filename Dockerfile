FROM node:16-alpine

RUN mkdir /app

COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json

WORKDIR /app

RUN npm ci

COPY . /app

ENV NODE_ENV production

RUN npm run build

CMD ["npm", "start"]
