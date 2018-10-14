"use strict";

const assert = require('assert');
const Wendigo = require('../..');
const utils = require('../test_utils');
const configUrls = require('../config.json').urls;


describe("Assert Title", function() {
    this.timeout(5000);
    let browser;

    before(async() => {
        browser = await Wendigo.createBrowser();
    });

    after(async() => {
        await browser.close();
    });

    it("Title", async() => {
        await browser.open(configUrls.index);
        await browser.assert.title("Index Test");
    });

    it("Title Default", async() => {
        await browser.open(configUrls.simple);
        await browser.assert.title("");
    });

    it("Title Throws", async() => {
        await browser.open(configUrls.index);
        assert(browser.assert.title);
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.title("Index Test 2");
        }, `Expected page title to be "Index Test 2", "Index Test" found`);
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.title("");
        }, `Expected page title to be "", "Index Test" found`);
    });

    it("Title Throws With Custom Message", async() => {
        await browser.open(configUrls.index);
        assert(browser.assert.title);
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.title("Index Test 2", "title test failed");
        }, `title test failed`);
    });

    it("Title Regex", async() => {
        await browser.open(configUrls.index);
        await browser.assert.title(/Index\sTest/);
    });

    it("Title Regex Throws", async() => {
        await browser.open(configUrls.index);
        assert(browser.assert.title);
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.title(/Index\sTest\s2/);
        }, `Expected page title to be "/Index\\sTest\\s2/", "Index Test" found`);
    });

    it("Not Title", async() => {
        assert(browser.assert.not.title);
        await browser.open(configUrls.index);
        await browser.assert.not.title("Not Index Test");
    });

    it("Not Title Default", async() => {
        await browser.open(configUrls.simple);
        await browser.assert.not.title("Test title");
    });

    it("Not Title Throws", async() => {
        await browser.open(configUrls.index);
        assert(browser.assert.not.title);
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.not.title("Index Test");
        }, `Expected page title not to be "Index Test"`);
    });

    it("Not Title Throws With Custom Message", async() => {
        await browser.open(configUrls.index);
        assert(browser.assert.not.title);
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.not.title("Index Test", "not title failed");
        }, `not title failed`);
    });
});
