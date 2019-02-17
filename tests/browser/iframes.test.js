"use strict";

const assert = require('assert');
const Wendigo = require('../..');
const configUrls = require('../config.json').urls;

describe("Iframes", function() {
    this.timeout(5000);
    let browser;

    before(async() => {
        browser = await Wendigo.createBrowser();
    });

    beforeEach(async() => {
        await browser.open(configUrls.iframes);
    });

    after(async() => {
        await browser.close();
    });


    it("Page Frames", async() => {
        assert.strictEqual(browser.frames().length, 2);
        await browser.open(configUrls.simple);
        assert.strictEqual(browser.frames().length, 1);
    });

    it("Selector With Iframe", async() => {
        await browser.assert.element("h1", 1);
        await browser.assert.element("iframe", 1);
    });
});
