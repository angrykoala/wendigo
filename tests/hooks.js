"use strict";

const dummyServer = require('./dummy_server/index.js');
const Wendigo = require('..');

before(() => {
    return dummyServer(3456);
});

after(async() => {
    await Wendigo.stop();
    dummyServer.close();
});
