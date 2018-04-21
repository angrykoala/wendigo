"use strict";

const dummyServer = require('./dummy_server/index.js');
const Wendigo = require('../lib/wendigo');

before(() => {
    return dummyServer(3456);
});

after(async () => {
    // console.log("after1")
    await Wendigo.stop();
    dummyServer.close();
    // console.log("after2")
});
