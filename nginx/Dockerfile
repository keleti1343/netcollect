ARG ALPINE_MIRROR=mirror.math.princeton.edu/pub/alpinelinux
ARG ALPINE_VERSION=v3.20

FROM nginx:alpine

# Solution 1: Use IP addresses instead of hostnames
RUN echo "https://151.101.110.133/pub/alpinelinux/v3.20/main" > /etc/apk/repositories && \
    echo "https://151.101.110.133/pub/alpinelinux/v3.20/community" >> /etc/apk/repositories

# OR Solution 2: Use host networking during build
# RUN echo "https://${ALPINE_MIRROR}/${ALPINE_VERSION}/main" > /etc/apk/repositories && \
#     echo "https://${ALPINE_MIRROR}/${ALPINE_VERSION}/community" >> /etc/apk/repositories

# Install with retries
RUN for i in 1 2 3; do \
      apk update && \
      apk add --no-cache tar grep curl bash gettext && \
      break || sleep 5; \
    done



# Remove only default server config
RUN rm /etc/nginx/conf.d/default.conf

# Copy files
COPY nginx.conf.template /etc/nginx/nginx.conf.template
COPY conf.d/default.conf.template /etc/nginx/conf.d/default.conf.template
COPY rate-limit-error.html /usr/share/nginx/html/rate-limit-error.html
COPY entrypoint.sh /entrypoint.sh

# Set permissions
RUN chmod +x /entrypoint.sh && \
    mkdir -p /var/log/nginx && \
    chown -R nginx:nginx /var/cache/nginx /var/log/nginx /etc/nginx && \
    chmod -R 755 /var/cache/nginx /var/log/nginx /etc/nginx

#COPY webmail.conf /etc/nginx/sites-available/webmail.conf
#RUN  rm /etc/nginx/sites-enabled/default && \
#     ln -s /etc/nginx/sites-available/webmail.conf /etc/nginx/sites-enabled/
# Remove default configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy your custom configuration
COPY webmail.conf /etc/nginx/conf.d/webmail.conf
     
# Health check and expose
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost/health || exit 1
EXPOSE 80 443

ENTRYPOINT ["/entrypoint.sh"]