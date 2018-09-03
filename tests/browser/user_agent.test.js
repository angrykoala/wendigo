"use strict";

const Wendigo = require('../../lib/wendigo');
const configUrls = require('../config.json').urls;

describe("User Agent", function() {
    this.timeout(5000);
    let browser;


    it("Default User Agent", async() => {
        browser = await Wendigo.createBrowser();
        await browser.open(configUrls.userAgent);
        await browser.assert.text("#user-agent", /Chrome/);
        await browser.close();
    });

    it("Set User Agent", async() => {
        browser = await Wendigo.createBrowser({
            userAgent: "wendigo"
        });
        await browser.open(configUrls.userAgent);
        await browser.assert.text("#user-agent", "wendigo");
        await browser.close();
    });
});
