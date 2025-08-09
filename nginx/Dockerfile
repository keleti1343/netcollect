ARG ALPINE_MIRROR=dl-cdn.alpinelinux.org
ARG ALPINE_VERSION=v3.20

FROM nginx:alpine
USER root


RUN echo "https://${ALPINE_MIRROR}/${ALPINE_VERSION}/main" > /etc/apk/repositories && \
    echo "https://${ALPINE_MIRROR}/${ALPINE_VERSION}/community" >> /etc/apk/repositories

RUN apk update && apk add --no-cache \
    tar \
    grep \
    curl \
    bash \
    gettext

# Function to manually download and install packages
RUN echo -e '\
download_and_install() {\n\
  pkg="$1"\n\
  echo "Fetching $pkg from $ALPINE_MIRROR..."\n\
  wget -q -O /tmp/APKINDEX.tar.gz "https://${ALPINE_MIRROR}/alpine/${ALPINE_VERSION}/main/x86_64/APKINDEX.tar.gz" || \\\n\
  wget -q -O /tmp/APKINDEX.tar.gz "https://${ALPINE_MIRROR}/pub/alpinelinux/${ALPINE_VERSION}/main/x86_64/APKINDEX.tar.gz"\n\
  \n\
  pkg_info=$(tar -zxf /tmp/APKINDEX.tar.gz -O | grep -A 1 "^P:${pkg}$")\n\
  pkg_name=$(echo "$pkg_info" | grep "^P:" | cut -d: -f2)\n\
  pkg_version=$(echo "$pkg_info" | grep "^V:" | cut -d: -f2)\n\
  \n\
  wget -q -O "/tmp/${pkg}.apk" \\\n\
    "https://${ALPINE_MIRROR}/alpine/${ALPINE_VERSION}/main/x86_64/${pkg_name}-${pkg_version}.apk" || \\\n\
  wget -q -O "/tmp/${pkg}.apk" \\\n\
    "https://${ALPINE_MIRROR}/pub/alpinelinux/${ALPINE_VERSION}/main/x86_64/${pkg_name}-${pkg_version}.apk"\n\
  \n\
  apk add --allow-untrusted --no-cache "/tmp/${pkg}.apk"\n\
  rm "/tmp/${pkg}.apk" /tmp/APKINDEX.tar.gz\n\
}\n' > /usr/local/bin/download_pkg && \
    chmod +x /usr/local/bin/download_pkg

# Install required packages using our function
RUN download_pkg curl && \
    download_pkg gettext && \
    download_pkg bash

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