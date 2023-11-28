#!/bin/bash
yum update -y
sudo su

yum install -y nginx

systemctl start nginx
systemctl enable nginx

echo "Hello World from $(hostname -f)" > /usr/share/nginx/html/index.html