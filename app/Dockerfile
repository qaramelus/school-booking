# Stage 1: Building the application
FROM node:20-alpine as build-stage

WORKDIR /app
COPY . .
RUN npm install 

ENV PATH=$PATH:/app/node_modules/.bin
EXPOSE 8080 
CMD ["npm", "run", "serve"]

# RUN npm run build
#
#
# # Stage 2: Setting up the server
# FROM nginx:stable as production-stage
# COPY --from=build-stage /app/dist /usr/share/nginx/html
# COPY nginx/nginx.conf /etc/nginx/nginx.conf
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]
