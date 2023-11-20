const fs = require('fs');
const bcrypt = require('bcrypt'); 
const nanoid = require('nanoid'); 

let setuppwd = nanoid.nanoid(32);

console.log('Setting up secrets file...');

bcrypt.hash(setuppwd, 16, function (err, pwdhash) {
    if(err) {
        console.log('Error creating setup password'); 
    }
    else {
        fs.writeFileSync('./secrets.json', 
            JSON.stringify({
                nodeid: nanoid.customAlphabet('1234567890abcdef')(8),
                jwt: nanoid.nanoid(64),
                setupsecret: pwdhash
            }, null, 4)
        );
        console.log(`Created setup.json file. Worker setup password is ${setuppwd}`); 
    }
});
