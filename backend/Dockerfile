FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

RUN mkdir -p /app/certs /app/avatar /app/data
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]