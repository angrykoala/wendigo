"use strict";

const dummyServer = require('../dummy_server/index.js');
const Ghoul = require('../lib/ghoul');
before(() => {
    return dummyServer(3456);
});

after(() => {
    Ghoul.stop();
    dummyServer.close();
});
