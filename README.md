# Feck Files

![CodeQL](https://github.com/ApocalypseCalculator/Feck/workflows/CodeQL/badge.svg)
[![Dependencies](https://david-dm.org/ApocalypseCalculator/Feck.svg)](https://david-dm.org/ApocalypseCalculator/Feck)
[![Github issues](https://img.shields.io/github/issues/ApocalypseCalculator/Feck.svg)](https://github.com/ApocalypseCalculator/Feck/issues)
[![GitHub forks](https://img.shields.io/github/forks/ApocalypseCalculator/Feck.svg)](https://github.com/ApocalypseCalculator/Feck/network)
[![GitHub stars](https://img.shields.io/github/stars/ApocalypseCalculator/Feck.svg)](https://github.com/ApocalypseCalculator/Feck/stargazers)
[![Downloads](https://img.shields.io/github/downloads/ApocalypseCalculator/Feck/total.svg)](https://github.com/ApocalypseCalculator/Feck/releases)
[![GitHub license](https://img.shields.io/github/license/ApocalypseCalculator/Feck.svg)](https://github.com/ApocalypseCalculator/Feck)

A simple, robust online file drive system created in Node.js 

This repository was forked from my original project with git completely reset to remove some sensitive personal information


## Installation

Download the latest release onto your pc, then launch your terminal and navigate to the folder

Run 
```
npm install
```

If you don't have npm you can install it from the official site or through snapd (it comes with nodejs)

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

`ratelimit`
- `time` ratelimit cooldown in minutes
- `requests` amount of requests allowed within `time`

`discord`
- `on` whether to turn on Discord notifications or not (true for on false for off)
- `webhook` the Discord webhook link (only required if on is set to true)


## Licensing and others

According the Apache 2.0 license included, this code is open source. The only condition is that you may not remove my credits. 

As for the site icon, I got it off a google search. I did not make that icon, and I am currently unable to find who made it.
