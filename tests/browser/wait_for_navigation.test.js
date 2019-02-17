"use strict";

const assert = require('assert');
const Wendigo = require('../..');
const configUrls = require('../config.json').urls;
const utils = require('../test_utils');

describe("Wait For Navigation", function() {
    this.timeout(5000);
    let browser;

    before(async() => {
        browser = await Wendigo.createBrowser();
    });

    after(async() => {
        await browser.close();
    });

    it("Wait For Navigation", async() => {
        await browser.open(configUrls.index);
        await browser.click("a");
        await browser.waitForNavigation();
        await browser.assert.global("WendigoUtils");
        await browser.assert.not.title("Index Test");
        await browser.assert.url(configUrls.simple);
    });

    it("Wait For Navigation Timeout", async() => {
        await browser.open(configUrls.index);
        await utils.assertThrowsAsync(async() => {
            await browser.waitForNavigation(1);
        }, "TimeoutError: [waitForNavigation] Timeout of 1ms exceeded.");
    });

    it("Click And Wait For Navigation", async() => {
        await browser.open(configUrls.index);
        const clicked = await browser.clickAndWaitForNavigation("a");
        await browser.assert.not.title("Index Test");
        assert.strictEqual(clicked, 2);
        await browser.assert.url(configUrls.simple);
    });

    it("Click And Wait For Navigation Timeout", async() => {
        await browser.open(configUrls.index);
        await utils.assertThrowsAsync(async() => {
            await browser.clickAndWaitForNavigation("p", 1);
        }, "TimeoutError: [clickAndWaitForNavigation] Timeout of 1ms exceeded.");
    });

    it("Click And Wait For Navigation Timeout Invalid Selector", async() => {
        await browser.open(configUrls.index);
        await utils.assertThrowsAsync(async() => {
            await browser.clickAndWaitForNavigation(".not-valid");
        }, `QueryError: [clickAndWaitForNavigation] No element ".not-valid" found.`);
    });
});
