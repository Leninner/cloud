# Squid Proxy Server

## Virtual Machine (Alma linux)

### Block domains

1. Install squid

```bash
dnf update -y
dnf install squid
```

2. Start the service and enable for start when the server starts

```bash
systemctl start squid
systemctl enable squid
```

**Note**: To check the status `systemctl statud squid`

3. Create a file with blocked domains in `/etc/squid/` with .txt extension

```bash
touch /etc/squid/blocked_domains.txt
```

4. Fill the created file with some domains to block

```txt
.facebook.com
.twitter.com
.youtube.com
.tiktok.com
.uta.edu
.ec
.io
```

**Note:** Also we can create a file to save blocked words in the URL 

5. Create a backup for the squid configuration file

```bash
cp /etc/squid/squid.conf /etc/squid/squid.conf.bak
```

6. In the `squid.conf` put the following content

```bash
#
# Recommended minimum configuration:
#

# Example rule allowing access from your local networks.
# Adapt to list your (internal) IP networks from where browsing
# should be allowed

### Comment these lines

# acl localnet src 0.0.0.1-0.255.255.255	# RFC 1122 "this" network (LAN)
# acl localnet src 10.0.0.0/8		# RFC 1918 local private network (LAN)
# acl localnet src 100.64.0.0/10		# RFC 6598 shared address space (CGN)
# acl localnet src 169.254.0.0/16 	# RFC 3927 link-local (directly plugged) machines
# acl localnet src 172.16.0.0/12		# RFC 1918 local private network (LAN)
# acl localnet src 192.168.0.0/16		# RFC 1918 local private network (LAN)
# acl localnet src fc00::/7       	# RFC 4193 local private network range
# acl localnet src fe80::/10      	# RFC 4291 link-local (directly plugged) machines

acl bad_domains dstdomain "/etc/squid/blocked_domains.txt"
acl bad_words url_regex "etc/squid/blocked_words.txt" # for blocked words

acl SSL_ports port 443
acl Safe_ports port 80		# http
acl Safe_ports port 21		# ftp
acl Safe_ports port 443		# https
acl Safe_ports port 70		# gopher
acl Safe_ports port 210		# wais
acl Safe_ports port 1025-65535	# unregistered ports
acl Safe_ports port 280		# http-mgmt
acl Safe_ports port 488		# gss-http
acl Safe_ports port 591		# filemaker
acl Safe_ports port 777		# multiling http

#
# Recommended minimum Access Permission configuration:
#
# Deny requests to certain unsafe ports
http_access deny !Safe_ports

# Deny CONNECT to other than secure SSL ports
http_access deny CONNECT !SSL_ports

# Only allow cachemgr access from localhost
http_access allow localhost manager
http_access deny manager

# We strongly recommend the following be uncommented to protect innocent
# web applications running on the proxy server who think the only
# one who can access services on "localhost" is a local user
# http_access deny to_localhost

#
# INSERT YOUR OWN RULE(S) HERE TO ALLOW ACCESS FROM YOUR CLIENTS
#

# Example rule allowing access from your local networks.
# Adapt localnet in the ACL section to list your (internal) IP networks
# from where browsing should be allowed

# http_access allow localnet
# http_access allow localhost

# And finally deny all other access to this proxy

# http_access deny all

http_access deny bad_domains
http_access deny bad_words
http_access allow all

# Squid normally listens to port 3128
http_port 3128

# Uncomment and adjust the following to add a disk cache directory.
#cache_dir ufs /var/spool/squid 100 16 256

# Leave coredumps in the first cache dir
coredump_dir /var/spool/squid

#
# Add any of your own refresh_pattern entries above these.
#
refresh_pattern ^ftp:		1440	20%	10080
refresh_pattern ^gopher:	1440	0%	1440
refresh_pattern -i (/cgi-bin/|\?) 0	0%	0
refresh_pattern .		0	20%	4320
```

7. Disable the firewall and disable to start when the server starts

```bash
systemctl stop firewalld
systemctl disable firewalld
```

8. Restart the squid service

```bash
systemctl restart squid
```

9.  Check the squid logs

```bash
tail -f /var/log/squid/access.log
```

10. Configure the browser to use the proxy server

  - Go to the browser settings
  - Search for proxy settings
  - Put the IP address of the server and the port 3128
    - IP: You can know the IP address of the server with the command `ip a`
    - PORT: **3128** is the default port for squid

## Docker
