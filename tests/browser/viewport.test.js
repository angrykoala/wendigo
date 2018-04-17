"use strict";

const Wendigo = require('../../lib/wendigo');
const configUrls = require('../config.json').urls;

describe("Viewport", function() {
    this.timeout(5000);
    let browser;

    before(async () => {
        browser = await Wendigo.createBrowser();
    });

    beforeEach(async() => {
        await browser.open(configUrls.viewport);
    });

    after(async () => {
        await browser.close();
    });


    it("Set Viewport", async () => {
        await browser.assert.style(".my-element", "color", "rgb(0, 0, 0)");
        await browser.setViewport({width: 200});
        await browser.assert.style(".my-element", "color", "rgb(255, 0, 0)");
    });
});
