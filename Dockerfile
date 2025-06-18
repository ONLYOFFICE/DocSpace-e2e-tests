FROM node:22-bookworm-slim

WORKDIR /app

COPY  package-lock.json .
COPY  package.json  .

RUN npm ci
RUN npx playwright install chromium --with-deps

COPY . .

