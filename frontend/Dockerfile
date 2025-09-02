FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install
ARG REACT_APP_API_URL

COPY . .

# Debug: Show environment variables during build
RUN echo "REACT_APP_API_URL during build: $REACT_APP_API_URL"
RUN env | grep REACT_APP || echo "No REACT_APP vars found"

# Build the app for production
RUN npm run build

# Install serve to serve the production build
RUN npm install -g serve

EXPOSE 3000

# serve defaults to 0.0.0.0:3000, -s flag rewrites 404s to index.html for React Router
CMD ["sh", "-c", "serve -s build -l tcp://0.0.0.0:3000"]
