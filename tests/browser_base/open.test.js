"use strict";

const Wendigo = require('../../lib/wendigo');
const utils = require('../utils');

describe("Open", function() {
    this.timeout(5000);

    let browser;
    before(async () => {
        browser = await Wendigo.createBrowser();
    });

    after(async () => {
        await browser.close();
    });

    it("Open Fails", async () => {
        await utils.assertThrowsAsync(async () => {
            await browser.open("not-a-page");
        }, `FatalError: Failed to open not-a-page.`);
    });

});
