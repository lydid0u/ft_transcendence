FROM node:18-alpine

WORKDIR /app

# SQLite
RUN apk add --no-cache sqlite

# Dépendances
COPY package*.json ./
RUN npm install

# Code
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]