FROM node:18-alpine

WORKDIR /app

# SQLite
RUN apk add --no-cache sqlite

# Dépendances
COPY package.json ./
RUN npm install nodemon
RUN npm install --production

# Code
COPY . .

EXPOSE 3000

CMD ["npm", "start"]