# Step 1: Build the Angular app
FROM node:20 AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx ng build --configuration production

# Step 2: Serve with NGINX
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built Angular app
COPY --from=build /app/dist/Client /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
