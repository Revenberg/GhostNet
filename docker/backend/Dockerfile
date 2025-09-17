# Gebruik een lichte Node.js image
FROM node:20-alpine

# Maak werkdirectory in container
WORKDIR /app

# Kopieer package.json en package-lock.json (indien aanwezig)
COPY package*.json ./

# Installeer dependencies
RUN npm install

# Kopieer de rest van de backend code
COPY . .

# Container luistert op poort 4000
EXPOSE 4000

# Start de server
CMD ["node", "server.js"]
