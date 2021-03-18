## This guide is for installation on Linux systems
(specifically, the OS used here is Debian 10, but it should be similar for other distros)
This guide assumes you have a domain that points to your IP address, with port forwarding set up properly

### Getting started

First off, you'll need to install `nginx`, `snapd`, `git` (optional), and `sqlite3` (optional, for your own purposes)
```
sudo apt-get install nginx snapd git sqlite3
```

Then you'll need to clone this repository onto your PC, so do
```
git clone https://github.com/ApocalypseCalculator/Feck
cd Feck
```
!!!**Warning**: The above commands clones the current code in the master branch. It may contain many bugs. If you wish to have a version without bugs, download the latest release from the releases tab.


After that we'll need to install [Node.js](https://nodejs.org/en/), the runtime that will run our server
```
sudo snap install node --classic --channel=12
```
We need a create a symlink to a directory that is recognized in PATH, so
```
sudo ln -s /snap/bin/node /usr/bin/node
```
Then we install the required libraries by doing
```
npm install
```
Add your info to the configuration files by doing
```
nano config.js
```
and replace the data as required


Now we have all (except https) of our required items installed. 

### Setting up Nginx

By default, nginx is already loaded and active when you install it. Make sure you expose the required ports so it can run. 
```
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```
You should set all other ports you don't need to deny for security.

Then if you visit your IP address from the browser, you should see a default Nginx page showing up. If it doesn't, check your firewall and Nginx service status.
If you are running the server from home, make sure you set up Port forwarding rules to forward port 80 and 443 to your computer's respective ports.

If it works as expected, go ahead and delete the default configuration file
```
sudo rm /etc/nginx/sites-enabled/default
```
and then create a new file called site
```
sudo nano /etc/nginx/sites-available/site
```
and add in the following, replace YOUR_DOMAIN_NAME with your domain name
```
server {
   listen 80 default_server;
   server_name YOUR_DOMAIN_NAME;
   access_log /var/log/nginx/something-access.log;

   client_max_body_size 100M;
   
   location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
after that is done create a symlink to sites-enabled by doing
```
sudo ln -s /etc/nginx/sites-available/site /etc/nginx/sites-enabled/site
```
check your configuration syntax by doing
```
nginx -t
```
If it outputs OK, restart/reload the service
```
sudo systemctl restart nginx
```
Now run 
```
node .
```
in the Feck directory, it should output "Listening on port 8080" or something similar. 
If it does, visit your domain in your browser, and you should be able to connect to the Feck site.

### Using a service to run your server

You won't always have your terminal on, so if you close your terminal, the server will stop. 
To avoid this, let's use a script and then create a service to run the script. 
```
nano start.sh
```
inside the file paste in, where you replace yourfilepath with the current directory path
```
#!/bin/bash
cd yourfilepath
while :
do
    node .
    sleep 1
done
```
This script automatically restarts the server when it encounters crashes.

Give it permissions using `chmod 777 start.sh`, and then run it using `./start.sh`. 
If it works, exit the process, and create a service file by doing
```
sudo nano /etc/systemd/system/server.service
```
and paste in the following, replacing yourfilepath with the current directory path
```sh
[Unit]
Description=Feck Files Server
#Name of the service, you can change it if you want
After=network.target
#Wait for network access

[Service]
ExecStart=yourfilepath/start.sh
#the file path of the script to execute
TimeoutSec=300
#Allowed timeout
Restart=on-failure
#restart service on failure

[Install]
WantedBy=multi-user.target
```
Save the file and enable the service by doing
```
sudo systemctl enabled server
```
This will enable the service to start automatically on reboot. 
Start/check the service using 
```
sudo systemctl start server
sudo systemctl status server
```

### Running the database cleanup script

The database should be cleaned up every once in a while
You can do this manually by running
```
node csrfclean.js
```
or set up a cronjob to automatically run the script after a given amount of time by doing
```
sudo crontab -e
```
and enter in, replacing yourfilepath with the current directory path
```
* 0 * * * node yourfilepath/csrfclean.js
```
Save the file and you're good to go.

### Adding HTTPS (optional)

HTTPS makes going onto your website secure by encrypting all traffic.
You can get a free certificate from [letsencrypt](https://letsencrypt.org/)

To install HTTPS, follow instructions from [certbot](https://certbot.eff.org/instructions)

### The end

I hope you liked this guide :3

a few things to note: 
- be careful about file space, this does not check your file space, and may cause errors once your disk space fills up
- if you are uploading > 100MB files, increase allowed traffic in Nginx config by editing `client_max_body_size XM;` (replace X with the max size in MB), remember to save and restart the service. 
- If you encounter problems, open an issue in this repository
- Want to contribute? Open a pull request!
