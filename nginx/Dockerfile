ARG ALPINE_MIRROR=mirror.math.princeton.edu/pub/alpinelinux
ARG ALPINE_VERSION=v3.20

FROM nginx:alpine

# 1. Explicitly list all .apk files (replace with your exact filenames)
COPY bash-5.2.37-r0.apk \
     curl-8.14.1-r1.apk \
     gettext-0.24.1-r0.apk \
     tar-1.35-r3.apk  \
     grep-3.12-r0.apk \
     /tmp/

# 2. Verify files exist before installation
RUN ls -la /tmp/*.apk && \
    echo "Files present:" && \
    find /tmp -name "*.apk" -exec echo {} \; && \
    echo "Disabling repositories..." && \
    mv /etc/apk/repositories /etc/apk/repositories.bak && \
    touch /etc/apk/repositories && \
    echo "Installing packages..." && \
    apk add --allow-untrusted --no-cache $(find /tmp -name "*.apk" -printf "/tmp/%f ") && \
    echo "Restoring repositories..." && \
    mv /etc/apk/repositories.bak /etc/apk/repositories && \
    echo "Cleaning up..." && \
    rm -f /tmp/*.apk



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