"use strict";

const assert = require('assert');
const path = require('path');
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
            await browser.open(`http://localhost:3433/not-a-page.html`);
        }, `FatalError: [open] Failed to open "http://localhost:3433/not-a-page.html". net::ERR_CONNECTION_REFUSED at http://localhost:3433/not-a-page.html`);
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
        const browser2 = await Wendigo.createBrowser();
        assert.strictEqual(browser2.loaded, false);
        await browser2.open(configUrls.index);
        assert.strictEqual(browser2.loaded, true);
        assert(browser2._originalHtml);
        await browser2.close();
        assert.strictEqual(browser2.loaded, false);
        assert.strictEqual(browser2._originalHtml, undefined);
    });

    it("Open Does Not Fail CSP", async() => {
        const browser2 = await Wendigo.createBrowser({
            bypassCSP: false
        });
        await browser2.open(configUrls.index);
        await browser2.close();
    });

    it("Add JS Script Bypass CSP", async() => {
        const browser2 = await Wendigo.createBrowser({
            bypassCSP: true
        });
        await browser2.open(configUrls.index);
        await browser2.addScript(path.join(__dirname, "..", "dummy_server/static/worker.js"));
        await browser2.close();
    });

    it("Add JS Script Fail CSP", async() => {
        const browser2 = await Wendigo.createBrowser({
            bypassCSP: false
        });
        await browser2.open(configUrls.index);
        await utils.assertThrowsAsync(async() => {
            await browser2.addScript(path.join(__dirname, "..", "dummy_server/static/worker.js"));
        }, `InjectScriptError: [addScript] Error injecting scripts. This may be caused by the page Content Security Policy. Make sure the option bypassCSP is set to true in Wendigo.`); // eslint-disable-line max-len

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

    it("Open Without Protocol", async() => {
        await browser.open("localhost:3456/index.html");
        await browser.assert.url(configUrls.index);
        await browser.close();
    });
});
