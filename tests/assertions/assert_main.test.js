"use strict";

const Wendigo = require('../../lib/wendigo');
const configUrls = require('../config.json').urls;

describe("Assertions Main", function() {
    this.timeout(5000);
    let browser;

    before(async () => {
        browser = await Wendigo.createBrowser();
    });

    after(async () => {
        await browser.close();
    });

    it("Multiple Assertions From Same Node", async () => {
        await browser.open(configUrls.index);
        const node = await browser.query("h1");
        await browser.assert.text(node, "Main Title");
        await browser.assert.visible(node);
    });

});
