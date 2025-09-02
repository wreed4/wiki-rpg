FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build the app for production
RUN npm run build

# Install serve to serve the production build
RUN npm install -g serve

EXPOSE 3000

# Use PORT env var if provided (Railway), otherwise default to 3000
CMD ["sh", "-c", "serve -s build -l ${PORT:-3000} --host 0.0.0.0"]