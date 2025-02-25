# Gunakan image Node.js terbaru
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json dan install dependencies
COPY package.json ./
RUN npm install

# Copy semua file
COPY . .

# Jalankan server
CMD ["node", "server.js"]

# Pastikan container berjalan di port 8000
EXPOSE 8000
