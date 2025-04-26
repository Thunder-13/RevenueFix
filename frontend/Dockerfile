# --- Stage 1: Build the React app ---
    FROM node:23.11.0 AS build

    WORKDIR /app
    
    # Install dependencies
    COPY package*.json ./
    RUN npm install
    
    # Copy the full source
    COPY . .
    
    # Build the app
    RUN npm run build
    
    # --- Stage 2: Serve with Nginx ---
    FROM nginx:alpine
    
    # Copy build output to Nginx public directory
    COPY --from=build /app/dist /usr/share/nginx/html
    
    # Copy custom Nginx config
    COPY nginx/default.conf /etc/nginx/conf.d/default.conf
    
    # Expose port
    EXPOSE 80
    
    # Start Nginx
    CMD ["nginx", "-g", "daemon off;"]
    