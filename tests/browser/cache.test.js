"use strict";

const assert = require('assert');
const Wendigo = require('../..');

describe("Checkbox", function() {
    this.timeout(5000);
    let browser;

    after(async() => {
        if (browser)
            await browser.close();
    });

    it("Cache Enabled By Default", async() => {
        browser = await Wendigo.createBrowser();
        assert.strictEqual(browser.cacheEnabled, true);
    });

    it("Disable Cache On Create Browser", async() => {
        browser = await Wendigo.createBrowser({
            cache: false
        });
        assert.strictEqual(browser.cacheEnabled, false);
    });

    it("Disable Cache With Method", async() => {
        browser = await Wendigo.createBrowser();
        await browser.setCache(false);
        assert.strictEqual(browser.cacheEnabled, false);
    });

    it("Enable Cache With Method", async() => {
        browser = await Wendigo.createBrowser({
            cache: false
        });
        await browser.setCache(true);
        assert.strictEqual(browser.cacheEnabled, true);
    });
});
