# Build stage
FROM node:20-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG VUE_APP_API_BASE_URL
ENV VUE_APP_API_BASE_URL=$VUE_APP_API_BASE_URL
RUN npm run build -- --mode production
RUN ls -al /app 

# Production stage
FROM nginx:alpine
COPY --from=build-stage /app/dist/ /usr/share/nginx/html/
COPY nginx.conf.template /etc/nginx/conf.d/nginx.conf.template
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]

