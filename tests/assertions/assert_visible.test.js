"use strict";

const assert = require('assert');
const Wendigo = require('../../lib/wendigo');
const utils = require('../test_utils');
const configUrls = require('../config.json').urls;

describe("Assert Visible", function() {
    this.timeout(5000);
    let browser;

    before(async() => {
        browser = await Wendigo.createBrowser();
    });

    beforeEach(async() => {
        await browser.open(configUrls.index);
    });

    after(async() => {
        await browser.close();
    });

    it("Is Visible", async() => {
        assert(browser.assert.visible);
        await browser.assert.visible("h1");
        await browser.assert.visible(".container p");
        await browser.assert.visible("p");
    });

    it("Is Visible Throws", async() => {
        assert(browser.assert.visible);
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.visible(".hidden-text");
        }, `Expected element ".hidden-text" to be visible.`);
    });

    it("Is Visible When Styled Hidden", async() => {
        assert(browser.assert.visible);
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.visible(".hidden-text2");
        }, `Expected element ".hidden-text2" to be visible.`);
    });

    it("Is Visible When Element Not Exists", async() => {
        assert(browser.assert.visible);
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.visible(".not-exists");
        }, `Selector ".not-exists" doesn't match any elements.`);
    });

    it("Is Visible Throws With Custom Message", async() => {
        assert(browser.assert.visible);
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.visible(".hidden-text", "visible test failed");
        }, `visible test failed`);
    });

    it("Is Visible From Node", async() => {
        assert(browser.assert.visible);
        const node = await browser.query("h1");
        await browser.assert.visible(node);
    });

    it("Not Visible", async() => {
        assert(browser.assert.not.visible);
        await browser.assert.not.visible(".hidden-text");
        await browser.assert.not.visible(".hidden-text2");
    });

    it("Not Visible Not Exists", async() => {
        assert(browser.assert.not.visible);
        await browser.assert.not.visible(".imaginary-text");
    });

    it("Not Visible Throws", async() => {
        assert(browser.assert.not.visible);
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.not.visible("p");
        }, `Expected element "p" to not be visible.`);
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.not.visible("h1");
        }, `Expected element "h1" to not be visible.`);
    });

    it("Not Visible Throws With Custom Message", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.not.visible("p", "not visible failed");
        }, `not visible failed`);
    });

    it("Not Visible Child", async() => {
        await browser.open(configUrls.hiddenChild);
        await browser.assert.not.visible(".hidden-div");
        await browser.assert.not.visible(".child");
    });
});
