"use strict";

const Wendigo = require('../../lib/wendigo');
const configUrls = require('../config.json').urls;

describe("Wait For", function() {
    this.timeout(5000);
    let browser;

    before(async () => {
        browser = await Wendigo.createBrowser();
    });

    after(async () => {
        await browser.close();
    });


    it("Wendigo Utils Exists", async () => {
        await browser.open(configUrls.index);
        await browser.assert.global("WendigoUtils");
    });

    it("Using Wendigo Utils After Redirect", async () => {
        await browser.open(configUrls.index);
        await browser.click("a");
        await browser.waitForUrl(configUrls.simple);
        await browser.wait();
        await browser.assert.global("WendigoUtils");
        await browser.assert.text("p", "html_test"); // Requires WendigoUtils
    });

});
