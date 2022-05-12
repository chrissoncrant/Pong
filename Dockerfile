FROM node:lts-alpine

WORKDIR /app

COPY . /app

RUN npm install --only=production

USER node

CMD ["npm", "start"]

EXPOSE 3000