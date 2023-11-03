# SQL

This is the configuration for a SQL server.

## Virtual Machine (Alma Linux)

1. Install `mysql` and `mysql-server`

```bash
sudo dnf install mysql mysql-server -y
```

2. Start and enable the `mysqld` service

```bash
sudo systemctl start mysqld
sudo systemctl enable mysqld
```

3. Run the `mysql_secure_installation` script

```bash
sudo mysql_secure_installation
```

**Note:** The script will ask you to set a password for the `root` user. Make sure to remember this password. You will need it later. Make sure you answer 'N' to all the other questions.

4. Log in to the MySQL shell

```bash
sudo mysql -u root -p
```

5. Create a database and a user

```sql
CREATE DATABASE <DATABASE_NAME>;
CREATE USER '<USER_NAME>'@'%' IDENTIFIED BY '<PASSWORD>';
GRANT ALL PRIVILEGES ON <DATABASE_NAME>.* TO '<USER_NAME>'@'%';
FLUSH PRIVILEGES;
```

6. Update the firewall rules

```bash
sudo firewall-cmd --permanent --add-service=mysql
sudo firewall-cmd --permanent --add-port=3306/tcp
sudo firewall-cmd --reload
```

7. Restart the `mysqld` service

```bash
sudo systemctl restart mysqld
```
