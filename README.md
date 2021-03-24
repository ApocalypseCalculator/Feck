# Feck Files

![CodeQL](https://github.com/ApocalypseCalculator/Feck/workflows/CodeQL/badge.svg)
[![Dependencies](https://david-dm.org/ApocalypseCalculator/Feck.svg)](https://david-dm.org/ApocalypseCalculator/Feck)
[![Github issues](https://img.shields.io/github/issues/ApocalypseCalculator/Feck.svg)](https://github.com/ApocalypseCalculator/Feck/issues)
[![GitHub forks](https://img.shields.io/github/forks/ApocalypseCalculator/Feck.svg)](https://github.com/ApocalypseCalculator/Feck/network)
[![GitHub stars](https://img.shields.io/github/starsApocalypseCalculator/Feck.svg)](https://github.com/ApocalypseCalculator/Feck/stargazers)
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

If you are using it in production I highly suggest using a script to monitor crashes and automatically restart,
then add it as a system service. 

**Installing on a Linux server? Follow [this guide](https://github.com/ApocalypseCalculator/Feck/blob/master/installation.md)**


## Folders and Subfolders

Uploads is the folder where all the uploads are stored, inside will be subfolders of `file_id/file_name`

Pages are static pages

Templates are pages that require some meddling before being sent to the user, such as CSRF token placement. 

Data is the folder storing data such as site database, website icons, etc. 

# Licensing and others

According the Apache 2.0 license included, this code is open source. The only condition is that you may not remove my credits from the code.

As for the site icon, I got it off a google search. I did not make that icon, and I am currently unable to find who made it.
