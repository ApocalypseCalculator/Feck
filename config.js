module.exports = {
    name: "unknown", //your name to be referred by
    email: "someemail@example.com", //your email so site users can contact you
    ratelimit: {
        time: 3, //time window specified in minutes
        requests: 100 //how many requests allowed for the time specified per IP address
    },
    filelimit: {
        anon: 209715200, //200mb
        registered: 2147483648, //2gb
        server: 5 * 1024 * 1024 //allows uploading to folder until last 5mb reached
    },
    discord: {
        on: false, //switch this to true to turn it on, false to turn it off
        webhook: 'your webhook link' //create one in Discord in channel settings -> integrations
    },
    secrets: {
        jwt: "jwt signing secret here" //please use a secure signing secret 
    },
    workers: 2 //amount of worker threads
}