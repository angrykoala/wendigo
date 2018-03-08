"use strict";

const assert = require('assert');
const Wendigo = require('../../lib/wendigo');
const utils = require('../utils');
const configUrls = require('../config.json').urls;


describe("Assert Url", function() {
    this.timeout(5000);
    let browser;

    before(async () => {
        browser = await Wendigo.createBrowser();
    });

    after(async () => {
        await browser.close();
    });

    it("Url", async () => {
        await browser.open(configUrls.index);
        await browser.assert.url(configUrls.index);
    });

    it("Url Throws", async () => {
        const invalidUrl = "http://localhost/not_the_url";
        await browser.open(configUrls.index);
        await utils.assertThrowsAssertionAsync (async () => {
            await browser.assert.url(invalidUrl);
        }, `Expected url to be "${invalidUrl}", "${configUrls.index}" found`);
    });

    it("Url Throws With Custom Message", async () => {
        const invalidUrl = "http://localhost/not_the_url";
        await browser.open(configUrls.index);
        await utils.assertThrowsAssertionAsync (async () => {
            await browser.assert.url(invalidUrl, "invalid url");
        }, `invalid url`);
    });

    it("Not Url", async () => {
        const invalidUrl = "http://localhost/invalid_url";
        await browser.open(configUrls.index);
        await browser.assert.not.url(invalidUrl);
    });

    it("Not Url Throws", async () => {
        await browser.open(configUrls.index);
        assert(browser.assert.not.url);
        await utils.assertThrowsAssertionAsync (async () => {
            await browser.assert.not.url(configUrls.index);
        }, `Expected url not to be "${configUrls.index}"`);
    });

    it("Not Url Throws With Custom Message", async () => {
        await browser.open(configUrls.index);
        assert(browser.assert.not.url);
        await utils.assertThrowsAssertionAsync (async () => {
            await browser.assert.not.url(configUrls.index, "not url failed");
        }, `not url failed`);
    });
});
