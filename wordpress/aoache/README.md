# Wordpress

This is a configuration for a Wordpress site.

## Virtual Machine (Alma Linux)

1. Install httpd

    ```bash
    sudo dnf install httpd -y
    ```

2. Install PHP extensions

    ```bash
    sudo dnf install php php-mysqlnd php-fpm php-gd php-xml php-mbstring php-json php-opcache php-zip php-curl -y
    ```

3. Install Wordpress on `/var/www/html` and move the contents to the root directory

    ```bash
    cd /var/www/html
    sudo wget https://wordpress.org/latest.tar.gz
    sudo tar -xvzf latest.tar.gz
    sudo mv wordpress/* /var/www/html
    ```

4. Remove unnecessary files

    ```bash
    sudo rm -rf wordpress latest.tar.gz
    ```

4. Copy the wp-config-sample.php file to wp-config.php

    ```bash
    sudo cp /var/www/html/wp-config-sample.php /var/www/html/wp-config.php
    ```

5. Update the database name, username, and password in the wp-config.php file
6. Update the firewall rules

    ```bash
    sudo firewall-cmd --permanent --add-service=http
    sudo firewall-cmd --permanent --add-service=https
    sudo firewall-cmd --reload
    ```

7. Start and enable the httpd and php-fpm services

    ```bash
    sudo systemctl start httpd
    sudo systemctl enable httpd
    sudo systemctl start php-fpm
    sudo systemctl enable php-fpm
    ```

8. Set SELinux to permissive mode

    ```bash
    sudo setenforce 0
    ```

9. Open the browser and navigate to `http://<IP_ADDRESS>`

## Docker