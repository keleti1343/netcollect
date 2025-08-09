FROM nginx:alpine

# Set Alpine Linux mirror (replace if needed)
RUN echo "https://eu.edge.kernel.org/pub/alpinelinux/v3.22/main" > /etc/apk/repositories && \
    echo "https://eu.edge.kernel.org/pub/alpinelinux/v3.22/community" >> /etc/apk/repositories

# Force IPv4 preference (if network issues persist)
RUN echo "precedence ::ffff:0:0/96  100" >> /etc/gai.conf

# Install packages with retry logic (in case of temporary failures)
RUN apk update && \
    apk add --no-cache curl gettext bash

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

COPY webmail.conf /etc/nginx/sites-available/webmail.conf
RUN  rm /etc/nginx/sites-enabled/default && \
     ln -s /etc/nginx/sites-available/webmail.conf /etc/nginx/sites-enabled/
     
# Health check and expose
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost/health || exit 1
EXPOSE 80 443

ENTRYPOINT ["/entrypoint.sh"]