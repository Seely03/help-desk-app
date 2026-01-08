# --- Stage 1: Build the React Frontend ---
    FROM node:20-alpine as client-build
    WORKDIR /app/client
    COPY client/package*.json ./
    RUN npm install
    COPY client/ ./
    # Build the React app to the 'dist' folder
    RUN npm run build
    
    # --- Stage 2: Build the Express Backend ---
    FROM node:20-alpine
    WORKDIR /app
    
    # Copy Server Dependencies
    COPY server/package*.json ./server/
    WORKDIR /app/server
    RUN npm install
    
    # Copy Server Source Code
    COPY server/ ./
    
    # Copy the React Build from Stage 1 into the Server's public folder
    # Note: You might need to adjust your server code to look for this folder
    COPY --from=client-build /app/client/dist ./public
    
    # Expose the API port
    EXPOSE 5000
    
    # Start the server
    CMD ["npm", "start"]