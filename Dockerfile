FROM node:13.8.0-alpine3.11

ARG BOT_SECRET_TOKEN
ARG APP_ENV
ARG NASA_API_KEY

COPY package.json package-lock.json ./
RUN npm ci

COPY ./src/ ./src/
COPY ./index.js ./index.js

ENV BOT_SECRET_TOKEN=$BOT_SECRET_TOKEN
ENV APP_ENV=$APP_ENV
ENV NASA_API_KEY=$NASA_API_KEY

CMD ["node", "index.js"]