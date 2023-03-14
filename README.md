# Feck Files

![CodeQL](https://github.com/ApocalypseCalculator/Feck/workflows/CodeQL/badge.svg)
[![Github issues](https://img.shields.io/github/issues/ApocalypseCalculator/Feck.svg)](https://github.com/ApocalypseCalculator/Feck/issues)
[![GitHub forks](https://img.shields.io/github/forks/ApocalypseCalculator/Feck.svg)](https://github.com/ApocalypseCalculator/Feck/network)
[![GitHub stars](https://img.shields.io/github/stars/ApocalypseCalculator/Feck.svg)](https://github.com/ApocalypseCalculator/Feck/stargazers)
[![GitHub license](https://img.shields.io/github/license/ApocalypseCalculator/Feck.svg)](https://github.com/ApocalypseCalculator/Feck)

A simple, robust online file drive system created in Node.js 

## Installation

Download the latest release onto your pc

Run 
```
npm install
```
Build client
```
npm install -g vite
cd client
vite build
cd ..
```
Migrate db schema
```
npx prisma migrate dev
```

After you finish that, start the server using 

```
node .
```

If you are using it in production I highly suggest using a script to monitor crashes and automatically restart and/or add it as a system service. 

**Installing on a Linux server? Follow [this guide](https://github.com/ApocalypseCalculator/Feck/blob/master/installation.md)**

If you have trouble setting it up, you can DM me on Discord for help at ApocalypseCalculator#7096

## Configuration

`name` your own name

`email` your email so that site users can contact you

`filelimit`
- `anon` file upload limit for anonymous users represented in bytes. Default 200MB
- `registered` file upload limit for registered users represented in bytes. Default 2GB
- `server` server allowed limit for saving files. The server will guaranteed this field's amount of space is free in the uploads folder. Default 5MB

`ratelimit`
- `time` ratelimit cooldown in minutes
- `requests` amount of requests allowed within `time`

`discord`
- `on` whether to turn on Discord notifications or not (true for on false for off)
- `webhook` the Discord webhook link (only required if on is set to true)

`workers` number of workers you want to spawn. Usually just 1 or 2 is enough. Must be between 1 and your machine CPU count. 


## Licensing and others

According the Apache 2.0 license included, this code is open source. The only condition is that you may not remove my credits. 

As for the site icon, I got it off a google search. I did not make that icon, and I am currently unable to find who made it.
