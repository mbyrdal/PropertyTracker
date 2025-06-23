# Stage 1: Build the React app with Vite
FROM node:18 AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve the built app using nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 (optional)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]