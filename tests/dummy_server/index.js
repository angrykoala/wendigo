"use strict";

const path = require('path');
const express = require('express');
const auth = require('basic-auth');
const app = express();
const WebSocket = require('ws');

const wss = new WebSocket.Server({port: 8003});

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        if (message === 'ping')
            ws.send('pong');
    });
});


app.use((req, res, next) => { // To avoid 304
    if (require.main !== module) { // No CSP when running it manually
        req.headers['if-none-match'] = 'no-match-for-this';
        res.set('Content-Security-Policy', "default-src 'self'"); // CSP set
    }
    next();
});
app.use("/", express.static(path.join(__dirname, "static")));

app.get("/api", (req, res) => {
    if (req.query.query === "hi2") res.json({result: "QUERY"});
    else res.json({result: "DUMMY"});
});

app.get("/auth", (req, res) => {
    const httpAuth = auth(req);
    const header = req.headers.authorization;

    res.json({
        httpAuth: httpAuth || null,
        authHeader: header || null
    });
});

app.get("/headers", (req, res) => {
    const rawHeaders = JSON.stringify(req.headers);
    res.send(`
        <!DOCTYPE html>
        <html>
        <body>
        <p>${rawHeaders}</p>
        </body>
        </html>`);
});


app.get("/redirect", (_req, res) => {
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
