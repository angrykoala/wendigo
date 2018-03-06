"use strict";

const assert = require('assert');
const Wendigo = require('../lib/wendigo');
const utils = require('./utils');
const configUrls = require('./config.json').urls;

describe("Not Assertions", function() {
    this.timeout(5000);
    let browser;

    before(async () => {
        browser = await Wendigo.createBrowser();
    });

    after(async() => {
        await browser.close();
    });

    it("Not Visible", async() => {
        assert(browser.assert.not.visible);
        await browser.open(configUrls.index);
        await browser.assert.not.visible(".hidden-text");
        await browser.assert.not.visible(".hidden-text2");
    });

    it("Not Visible Not Exists", async() => {
        assert(browser.assert.not.visible);
        await browser.open(configUrls.index);
        await browser.assert.not.visible(".imaginary-text");
    });

    it("Not Visible Throws", async() => {
        await browser.open(configUrls.index);
        assert(browser.assert.not.visible);
        await utils.assertThrowsAssertionAsync(async () => {
            await browser.assert.not.visible("p");
        }, `Expected element "p" to not be visible`);
        await utils.assertThrowsAssertionAsync(async () => {
            await browser.assert.not.visible("h1");
        }, `Expected element "h1" to not be visible`);
    });

    it("Not Visible Throws With Custom Message", async () => {
        await browser.open(configUrls.index);
        await utils.assertThrowsAssertionAsync(async () => {
            await browser.assert.not.visible("p", "not visible failed");
        }, `not visible failed`);
    });

    it("Not Url", async() => {
        const invalidUrl = "http://localhost/invalid_url";
        await browser.open(configUrls.index);
        await browser.assert.not.url(invalidUrl);
    });

    it("Not Url Throws", async() => {
        await browser.open(configUrls.index);
        assert(browser.assert.not.url);
        await utils.assertThrowsAssertionAsync(async () => {
            await browser.assert.not.url(configUrls.index);
        }, `Expected url not to be "${configUrls.index}"`);
    });

    it("Not Url Throws With Custom Message", async() => {
        await browser.open(configUrls.index);
        assert(browser.assert.not.url);
        await utils.assertThrowsAssertionAsync(async () => {
            await browser.assert.not.url(configUrls.index, "not url failed");
        }, `not url failed`);
    });

});
