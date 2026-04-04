FROM nginx:alpine

# Copy site files
COPY . /usr/share/nginx/html

# Remove deployment files from the served content
RUN rm -f /usr/share/nginx/html/Dockerfile \
          /usr/share/nginx/html/.dockerignore \
          /usr/share/nginx/html/docker-compose.yml && \
    rm -rf /usr/share/nginx/html/.github \
           /usr/share/nginx/html/.git

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
