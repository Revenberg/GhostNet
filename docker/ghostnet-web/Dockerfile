# Gebruik Node 20 Alpine (klein image, ARM compatibel)
FROM node:20-alpine

# Zet werkdirectory
WORKDIR /app

# Kopieer package files
COPY package*.json ./

# Installeer dependencies
RUN npm install

# Kopieer project
COPY . .

# Build de React app
RUN npm run build

# Gebruik een lichtgewicht webserver (serve) om de build te serveren
RUN npm install -g serve

# Exposeer poort 3000
EXPOSE 3000

# Start de server
CMD ["serve", "-s", "build", "-l", "3000"]
