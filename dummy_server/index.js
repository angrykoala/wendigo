"use strict";

const path = require('path');
const express = require('express');
const app = express();

app.use("/", express.static(path.join(__dirname, "static")));

let server;
const dummy = function(port) {
    return new Promise((resolve) => {
        server = app.listen(port, () => {
            // console.log(`Dummy Listening To ${port}`);
            resolve();
        });
    });
};

dummy.close = function() {
    server.close();
};

module.exports = dummy;

if (require.main === module) {
    dummy(8002);
}
