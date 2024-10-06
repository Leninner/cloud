# Ansible Zero to Hero Workshop

## What is ansible?

Ansible is an open-source automation tool, or platform, used for IT tasks such as configuration management, application deployment, intraservice orchestration, and provisioning.

## Ansible playbook

An Ansible playbook is an organized unit of scripts that defines work for a server configuration managed by the automation tool Ansible. Ansible is a configuration management tool that automates the configuration of multiple servers by the use of Ansible playbooks.

## Without ansible

- Manually install all the required packages on all the servers.

## With ansible

- Write a playbook to install all the required packages on all the servers.

## Why ansible is agentless?

Ansible is agentless because it doesn't require any agent to be installed on the client machine. It uses SSH for connecting to the client machine.

## How does ansible work?

Write a playbook -> Run the playbook -> Connect to the client machine using SSH -> Run the playbook on the client machine and execute the tasks.

## How to install ansible?

- Ubuntu

```bash
sudo apt-get update
sudo apt-get install software-properties-common
sudo apt-get-add-repository --yes --update ppa:ansible/ansible
sudo apt-get update
sudo apt-get install ansible
```

- CentOS

```bash
sudo yum install ansible
```
