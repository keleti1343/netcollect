FROM  nginx:stable-alpine



RUN apk update && \
    apk add --no-cache \
        bind-tools \
        curl \
        nano \
        msmtp \
        mailx

# Verify installations
#RUN bash --version && \
#    curl --version && \
#    gettext --version




# Remove only default server config
RUN rm /etc/nginx/conf.d/default.conf

# Copy files
COPY  nginx/nginx.conf.template /etc/nginx/nginx.conf.template
COPY  nginx/conf.d/default.conf.template /etc/nginx/conf.d/default.conf.template
COPY  nginx/rate-limit-error.html /usr/share/nginx/html/rate-limit-error.html
COPY  nginx/entrypoint.sh /entrypoint.sh

# Set permissions
RUN chmod +x /entrypoint.sh && \
    mkdir -p /var/log/nginx && \
    chown -R nginx:nginx /var/cache/nginx /var/log/nginx /etc/nginx && \
    chmod -R 755 /var/cache/nginx /var/log/nginx /etc/nginx

#COPY webmail.conf /etc/nginx/sites-available/webmail.conf
#RUN  rm /etc/nginx/sites-enabled/default && \
#     ln -s /etc/nginx/sites-available/webmail.conf /etc/nginx/sites-enabled/
# Remove default configuration
#RUN rm /etc/nginx/conf.d/default.conf

# Copy your custom configuration
# COPY  nginx/webmail.conf /etc/nginx/conf.d/webmail.conf
     
# Health check and expose
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost/health || exit 1
EXPOSE 80 443

ENTRYPOINT ["/entrypoint.sh"]