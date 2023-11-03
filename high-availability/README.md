<h1>High Availability</h1>

<summary>Table of Contents</summary>

- [Virtual Machines (Alma Linux)](#virtual-machines-alma-linux)
  - [Transversal](#transversal)


## Virtual Machines (Alma Linux)

**Note:** Using 3 nodes for this project.

### Transversal

1. Install `keepalived` on all nodes.

```bash
sudo dnf install -y keepalived
```

2. Configure `keepalived` on all nodes.

```bash
sudo vim /etc/keepalived/keepalived.conf
```

```conf
global_defs {
  # Keepalived process identifier
  router_id mysql # you can change this to any name
}

# Script to check if the MySQL Group Replication primary node is active
vrrp_script check_mysql {
  script "/bin/check_primary.sh" # Verifica que el servicio funcione.
  interval 2
  weight 50
  script_security script
}

# Virtual interface - The priority specifies the order in
# which the assigned interface to take over in a failover
vrrp_instance VI_01 {
  state BACKUP # Dependiento el nodo se configura MASTER o BACKUP
  interface enp0s3 # Agregar la interfaz de red eth0, enp0s3, etc.
  virtual_router_id 50 # De 0-255, el mismo en todos los nodos.
  priority 90 # 110 para MASTER o 100 para BACKUP

  # The virtual ip address shared between the two NGINX
  # Web Server which will float
  virtual_ipaddress {
    192.168.100.167/24 # Esta IP debe ir en todos los nodos.
  }

  track_script {
    check_mysql
  }

  authentication {
    auth_type AH
    auth_pass secret
  }
} 
```

3. Create `check_primary.sh` script.

```bash
sudo vim /bin/check_primary.sh
```

```bash
#!/bin/sh

# Specify the address and port of your MySQL Group Replication primary node
NODE_IP=$(hostname -I | awk '{print $1}')
NODE_PORT="3306"

# Specify the user and password to access MySQL (replace with your credentials)
MYSQL_USER="user_name"
MYSQL_PASSWORD="user_password"

# Define a function to check if the node is the primary
is_primary() {
    # validate if the node is active
    if [ -z `pidof mysqld` ]; then
        return 1  # Node is not active
    fi

    result=$(mysql -u$MYSQL_USER -p$MYSQL_PASSWORD -h $NODE_IP -P $NODE_PORT -e "SELECT MEMBER_HOST FROM performance_schema.replication_group_members WHERE MEMBER_ROLE = 'PRIMARY'" 2>/dev/null | grep 'SQL-')
    hostname=$(hostname)

    # validate if the node is the primary checking the hostname against the result
    if [ "$result" = "$hostname" ]; then
        return 0  # Node is the primary
    else
        return 1  # Node is not the primary
    fi
}

# Check if this node is the primary
if is_primary; then
    # This node is the primary, so Keepalived should notify that it's the master
    exit 0
else
    # This node is not the primary, so Keepalived should notify that it's a backup
    exit 1
fi
```

4. Le damos permisos de ejecución al script.

```bash
sudo chmod +x /bin/check_primary.sh
```

5. Enable `keepalived` service on all nodes.

```bash
sudo systemctl start keepalived
sudo systemctl enable keepalived
```