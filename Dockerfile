# 1. Base image
FROM node:18-alpine

# 2. Werkdirectory in container
WORKDIR /app

# 3. Kopieer ALLES naar de container
COPY . .

# 4. Installeer dependencies
RUN npm install

# 5. Poort waarop je app draait
EXPOSE 3000

# 6. Startcommando
CMD ["npm", "start"]

