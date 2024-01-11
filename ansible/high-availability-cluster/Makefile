# This script will add the public key to the authorized_keys file
# on the remote server. This will allow you to ssh into the remote
# server without a password.

# The script will also create a new ssh key if one does not exist
# already. This is useful if you are running this script on a new
# machine and do not have an ssh key yet.

# The script will also copy the public key to the clipboard. This
# is useful if you are running this script on a remote server and
# do not have access to the clipboard.

# The script will also print the public key to the terminal. This
# is useful if you are running this script on a remote server and
# do not have access to the clipboard.

IP_ADDRESSES=$(shell awk -F'[][]' '/^\[.*\]$$/{print $$2}' inventory.ini | while read -r section; do \
    awk -v section="$$section" '/^\[/{p=0}/'$$section'/{p=1} p && !/^$|^\[/{print}' inventory.ini | grep -v '^$$'; \
    done)

servers_are_up:
		@echo "Checking if servers are up..."
		@ansible -i inventory.ini all -m ping | grep "No route to host"  

get_ip_addresses:
		@echo "IP Addresses: $(IP_ADDRESSES)"

generate_ssh_key_for_remote_server:
		@echo "Generating ssh key..."
		@ssh-keygen -t rsa -b 4096 -C "wordpress-cluster" -f ~/.ssh/wordpress-cluster -q -N ""

copy_ssh_key_to_clipboard:
		@echo "Copying ssh key to clipboard..."
		@cat ~/.ssh/wordpress-cluster.pub | pbcopy

copy_ssh_key_to_remote_servers:
		@echo "Copiando clave SSH a los servidores remotos..."
		@echo $(IP_ADDRESSES) | xargs -n 1 echo | xargs -I {} ssh-copy-id -i ~/.ssh/wordpress-cluster.pub root@{}