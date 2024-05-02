# Frontend/Dockerfile
# Build stage
FROM node:20-alpine as build-stage

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Accept `VUE_APP_API_BASE_URL` from build-args
ARG VUE_APP_API_BASE_URL
ENV VUE_APP_API_BASE_URL=$VUE_APP_API_BASE_URL
RUN echo "VUE_APP_API_BASE_URL=$VUE_APP_API_BASE_URL"

RUN npm run build -- --mode production

# Production stage
FROM nginx:alpine
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
