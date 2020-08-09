"use strict";

// const assert = require('assert');
const Wendigo = require('../..');
const configUrls = require('../config.json').urls;
// const utils = require('../test_utils');

describe.only("Browser Websockets", function() {
    this.timeout(5000);
    let browser;

    before(async() => {
        browser = await Wendigo.createBrowser({
            log: true
        });
    });

    beforeEach(async() => {
        await browser.open(configUrls.websocket);
    });

    after(async() => {
        await browser.close();
    });

    it('opens websocket', async() => {
        await browser.clickText('Open');
        await browser.wait(2000);
    });
});
