"use strict";

const path = require('path');
const express = require('express');
const app = express();

app.use((req, res, next) => { // To avoid 304
    req.headers['if-none-match'] = 'no-match-for-this';
    res.set('Content-Security-Policy', "default-src 'self'"); // CSP set
    next();
});
app.use("/", express.static(path.join(__dirname, "static")));


app.get("/api", (req, res) => {
    if (req.query.query === "hi2") res.json({result: "QUERY"});
    else res.json({result: "DUMMY"});
});

app.get("/redirect", (req, res) => {
    res.redirect("/index.html");
});

let server;
function dummy(port) {
    return new Promise((resolve) => {
        server = app.listen(port, () => {
            // console.log(`Dummy Listening To ${port}`);
            resolve();
        });
    });
}

dummy.close = function() {
    server.close();
};

module.exports = dummy;

if (require.main === module) {
    dummy(8002).then(() => {
        console.log("Dummy Listening in 8002"); //eslint-disable-line
    });
}
