FROM node:23.11.0 as build
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

FROM nginx:alpine
COPY dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/nginx.conf
