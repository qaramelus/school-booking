FROM node:lts-alpine AS build

ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./

RUN apk update && \
    apk upgrade --no-cache && \
    apk add --no-cache git curl bash tar unzip && \
    npm install
COPY . .
RUN npm run build

# Production Stage
FROM nginx:stable-alpine
RUN rm -rf /etc/nginx/conf.d/*
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /var/www/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
