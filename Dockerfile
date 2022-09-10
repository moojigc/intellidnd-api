FROM node:16

RUN mkdir /app

COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json

WORKDIR /app

RUN npm ci

COPY . /app

RUN npm run build

ENV NODE_ENV production
ENV PORT 80

EXPOSE 80

CMD ["npm", "start"]
