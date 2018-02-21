"use strict";

const assert = require('assert');
const Wendigo = require('../../lib/wendigo');
const utils = require('../utils');
const configUrls = require('../config.json').urls;

describe("Assert Visible", function() {
    this.timeout(5000);
    let browser;

    before(async () => {
        browser = await Wendigo.createBrowser();
    });

    after(async() => {
        await browser.close();
    });

    it("Is Visible", async() => {
        assert(browser.assert.visible);
        await browser.open(configUrls.index);
        await browser.assert.visible("h1");
        await browser.assert.visible(".container p");
        await browser.assert.visible("p");
    });

    it("Is Visible Throws", async() => {
        await browser.open(configUrls.index);
        assert(browser.assert.visible);
        await utils.assertThrowsAssertionAsync(async () => {
            await browser.assert.visible(".hidden-text");
        }, `Expected element ".hidden-text" to be visible`);
    });

    it("Is Visible When Styled Hidden", async() => {
        await browser.open(configUrls.index);
        assert(browser.assert.visible);
        await utils.assertThrowsAssertionAsync(async () => {
            await browser.assert.visible(".hidden-text2");
        }, `Expected element ".hidden-text2" to be visible`);
    });

    it("Is Visible When Element Not Exists", async() => {
        await browser.open(configUrls.index);
        assert(browser.assert.visible);
        await utils.assertThrowsAssertionAsync(async () => {
            await browser.assert.visible(".not-exists");
        }, `Expected element ".not-exists" to be visible`);
    });

    it("Is Visible Throws With Custom Message", async() => {
        await browser.open(configUrls.index);
        assert(browser.assert.visible);
        await utils.assertThrowsAssertionAsync(async () => {
            await browser.assert.visible(".hidden-text", "visible test failed");
        }, `visible test failed`);
    });

    it("Is Visible From Node", async() => {
        assert(browser.assert.visible);
        await browser.open(configUrls.index);
        const node = await browser.query("h1");
        await browser.assert.visible(node);
    });


});
