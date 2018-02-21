"use strict";

const assert = require('assert');
const Wendigo = require('../../lib/wendigo');
const configUrls = require('.././config.json').urls;

describe("Url", function() {
    this.timeout(5000);
    let browser;

    before(async () => {
        browser = await Wendigo.createBrowser();
    });

    after(async() => {
        await browser.close();
    });


    it("Url", async() => {
        await browser.open(configUrls.index);
        assert.strictEqual(await browser.url(), "http://localhost:3456/index.html");
    });

    it("Changing Url", async() => {
        await browser.open(configUrls.index);
        assert.strictEqual(await browser.url(), "http://localhost:3456/index.html");
        await browser.open(configUrls.click);
        assert.strictEqual(await browser.url(), "http://localhost:3456/click.html");
    });

    it("Url Before Opening", async() => {
        const browser2 = await Wendigo.createBrowser();
        assert.strictEqual(await browser2.url(), null);
        browser2.close();
    });

    it("Dynamic Url Update", async() => {
        await browser.open(configUrls.url);
        assert.strictEqual(await browser.url(), "http://localhost:3456/url_history.html");
        await browser.click(".btn");
        assert.strictEqual(await browser.url(), "http://localhost:3456/new-url");
    });

    it("Click Link And Url Update", async() => {
        await browser.open(configUrls.index);
        await browser.click("a");
        await browser.wait();
        await browser.assert.url(configUrls.simple);
    });
});
