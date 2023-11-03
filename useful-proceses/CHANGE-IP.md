# Change IP on Virtual Machine (Alma Linux)

1. Edit the ip of a connection

```bash
nmcli con modify <connection_name> ipv4.addresses <ip_address>
```

2. Edit the gateway of a connection

```bash
nmcli con modify <connection_name> ipv4.gateway <gateway_address>
```

3. Edit the DNS of the connection

```bash
nmcli con modify <connection_name> ipv4.dns <dns_address>
```

4. Edit the DNS ip asignation method to manual

```bash
nmcli con modify <connection_name> ipv4.method manual
```

5. Reboot the connection

```bash
nmcli con down <connection_name> && nmcli con up <connection_name>
```

6. Reboot the system

```bash
systemctl reboot
```
