#!/bin/bash
yum update -y
sudo su

yum install nginx -y

cat <<EOF > /etc/nginx/conf.d/load-balancer.conf
upstream backend {
    server ;
    server ;
}

server {
    listen 80;
    location / {
        proxy_pass http://backend;
    }
}
EOF

systemctl start nginx
systemctl enable nginx

