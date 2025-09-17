# ARM-vriendelijke Node Alpine
FROM node:20-alpine

WORKDIR /app

# Dependencies installeren
COPY package*.json ./
RUN npm install

# Source kopiëren (volume mount overschrijft dit)
COPY . .

# Exposeer dev server
EXPOSE 3000

# Dev server starten
CMD ["npm", "start"]
