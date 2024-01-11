# High Availability Cluster

This is a high availability cluster build on top of [Ansible](https://www.ansible.com/), and [VirtualBox](https://www.virtualbox.org/).

## Requirements

* [Ansible](https://www.ansible.com/)
* [VirtualBox](https://www.virtualbox.org/)

## Usage

### Create the cluster

- Update inventory.ini with the desired IP addresses

```bash
[webservers]
192.168.100.113
192.168.100.114
192.168.100.115

[databases]
192.168.100.116

```

- Run the playbook

```bash
ansible-playbook -i inventory.ini main.yml -u root
```
