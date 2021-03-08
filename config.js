module.exports = {
    name: "unknown", //your name to be referred by
    email: "someemail@example.com", //your email so site users can contact you
    ratelimit: {
        time: 3, //time window specified in minutes
        requests: 100 //how many requests allowed for the time specified per IP address
    }
}