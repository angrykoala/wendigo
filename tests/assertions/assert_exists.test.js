"use strict";

const Wendigo = require('../../lib/wendigo');
const utils = require('../test_utils');
const configUrls = require('../config.json').urls;

describe("Assert Exists", function() {
    this.timeout(5000);
    let browser;

    before(async() => {
        browser = await Wendigo.createBrowser();
    });

    after(async() => {
        await browser.close();
    });

    it("Exists", async() => {
        await browser.open(configUrls.index);
        await browser.assert.exists("h1");
        await browser.assert.exists(".container");
    });

    it("Exists Throws", async() => {
        await browser.open(configUrls.index);
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.exists("h2");
        }, `Expected element "h2" to exists`);
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.exists(".not_container");
        }, `Expected element ".not_container" to exists`);
    });

    it("Exists Throws With Custom Message", async() => {
        await browser.open(configUrls.index);
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.exists("h2", "test failed");
        }, `test failed`);
    });

    it("Exists From Node", async() => {
        await browser.open(configUrls.index);
        const node = await browser.query("h1");
        await browser.assert.exists(node);
        await browser.assert.exists(".container");
    });

    it("Not Exists", async() => {
        await browser.open(configUrls.index);
        await browser.assert.not.exists("h2");
        await browser.assert.not.exists(".not-container");
    });

    it("Not Exists Throws", async() => {
        await browser.open(configUrls.index);
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.not.exists("h1");
        }, `Expected element "h1" to not exists`);
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.not.exists(".container");
        }, `Expected element ".container" to not exists`);
    });

    it("Not Exists Throws With Custom Message", async() => {
        await browser.open(configUrls.index);
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.not.exists("h1", "not exists failed");
        }, `not exists failed`);
    });
});
