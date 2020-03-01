FROM node:13.8.0-alpine3.11

COPY package.json package-lock.json ./
RUN npm ci

COPY ./.env ./.env
COPY ./index.js ./index.js

CMD ["node", "index.js"]