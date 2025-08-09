ARG ALPINE_MIRROR=mirror.math.princeton.edu/pub/alpinelinux
ARG ALPINE_VERSION=v3.20

FROM nginx:alpine

# Create packages directory
#WORKDIR /packages

# Copy each package individually with verification
COPY bash-5.2.37-r0.apk .
RUN [ -f bash-5.2.37-r0.apk ] || (echo "Missing bash package" && exit 1)

COPY curl-8.14.1-r1.apk .
RUN [ -f curl-8.14.1-r1.apk ] || (echo "Missing curl package" && exit 1)

COPY gettext-0.24.1-r0.apk .
RUN [ -f gettext-0.24.1-r0.apk ] || (echo "Missing gettext package" && exit 1)

COPY tar-1.35-r3.apk .
RUN [ -f tar-1.35-r3.apk ] || (echo "Missing tar package" && exit 1)

COPY grep-3.12-r0.apk .
RUN [ -f grep-3.12-r0.apk ] || (echo "Missing grep package" && exit 1)

# Install all packages in offline mode
RUN mv /etc/apk/repositories /etc/apk/repositories.bak && \
    touch /etc/apk/repositories && \
    apk add --allow-untrusted --no-cache /packages/*.apk && \
    mv /etc/apk/repositories.bak /etc/apk/repositories && \
    rm -rf /packages




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