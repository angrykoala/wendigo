"use strict";

const assert = require('assert');
const Wendigo = require('../..');
const utils = require('../test_utils');
const configUrls = require('../config.json').urls;

describe("Open", function() {
    this.timeout(5000);

    let browser;
    before(async() => {
        browser = await Wendigo.createBrowser();
    });

    after(async() => {
        await browser.close();
    });

    it("Open Fails", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.open("not-a-page");
        }, `FatalError: Failed to open "not-a-page". Protocol error (Page.navigate): Cannot navigate to invalid URL`);
    });

    it("Before Open Fails", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.click(".btn");
        }, `FatalError: Cannot perform action before opening a page.`);
    });

    it("Assert Before Open Fails", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.assert.exists(".btn");
        }, `FatalError: Cannot perform action before opening a page.`);
    });

    it("Assert Before Open Fails", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.localStorage.getItem("my-item");
        }, `FatalError: Cannot perform action before opening a page.`);
    });

    it("Open And Close", async() => {
        assert.strictEqual(browser.loaded, false);
        await browser.open(configUrls.index);
        assert.strictEqual(browser.loaded, true);
        assert.strictEqual(Wendigo._browsers.length, 1);
        assert(browser._originalHtml);
        await browser.close();
        assert.strictEqual(Wendigo._browsers.length, 0);
        assert.strictEqual(browser.loaded, false);
        assert.strictEqual(browser._originalHtml, undefined);
    });
});
