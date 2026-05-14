FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src

# Create uploads directory (multer writes here at runtime)
RUN mkdir -p uploads/profile-images

EXPOSE 5000

CMD ["node", "src/server.js"]
