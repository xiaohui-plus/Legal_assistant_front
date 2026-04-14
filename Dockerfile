FROM nginx:alpine

WORKDIR /usr/share/nginx/html

COPY . .

RUN rm -rf /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]