"use strict";

const assert = require('assert');
const Wendigo = require('../..');
const utils = require('../test_utils');
const configUrls = require('../config.json').urls;

describe("Open", function() {
    this.timeout(5000);

    let browser;
    before(async() => {
        await Wendigo.stop(); // closes any dangling browser
        browser = await Wendigo.createBrowser();
    });

    after(async() => {
        await browser.close();
    });

    it("Open Fails", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.open("not-a-page");
        }, `FatalError: [open] Failed to open "not-a-page". Protocol error (Page.navigate): Cannot navigate to invalid URL`);
    });

    it("Before Open Fails", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.click(".btn");
        }, `FatalError: [click] Cannot perform action before opening a page.`);
    });

    it("Assert Before Open Fails", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.assert.exists(".btn");
        }, `FatalError: [assert.exists] Cannot perform action before opening a page.`);
    });

    it("Assert localStorage Before Open Fails", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.localStorage.getItem("my-item");
        }, `FatalError: [localStorage.getItem] Cannot perform action before opening a page.`);
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
        browser = await Wendigo.createBrowser();
    });

    it("Open Fails CSP", async() => {
        const browser2 = await Wendigo.createBrowser({
            bypassCSP: false
        });
        await utils.assertThrowsAsync(async() => {
            await browser2.open(configUrls.index);
        }, `InjectScriptError: [open] Evaluation failed: Event. This may be caused by the page Content Security Policy. Make sure the option bypassCSP is set to true in Wendigo.`);
        await browser2.close();
    });

    it("Open With Querystring", async() => {
        await browser.open(`${configUrls.queryString}?test=foo`);
        await browser.assert.text(".qs", "test=foo");
    });

    it("Open With Querystring Parameter As String", async() => {
        await browser.open(configUrls.queryString, {
            queryString: "test=foo"
        });
        await browser.assert.text(".qs", "test=foo");
    });

    it("Open With Querystring Parameter As String With Separator", async() => {
        await browser.open(configUrls.queryString, {
            queryString: "?test=foo"
        });
        await browser.assert.text(".qs", "test=foo");
    });

    it("Open With Querystring Parameter As Object", async() => {
        await browser.open(configUrls.queryString, {
            queryString: {
                test: "foo"
            }
        });
        await browser.assert.text(".qs", "test=foo");
    });
});
