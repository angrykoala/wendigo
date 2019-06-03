"use strict";

const Wendigo = require('../..');
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
        await browser.assert.visible("h1");
        await browser.assert.visible(".container p");
        await browser.assert.visible("p");
    });

    it("Is Visible Throws", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.visible(".hidden-text");
        }, `[assert.visible] Expected element ".hidden-text" to be visible.`);
    });

    it("Is Visible When Styled Hidden", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.visible(".hidden-text2");
        }, `[assert.visible] Expected element ".hidden-text2" to be visible.`);
    });

    it("Is Visible When Element Not Exists", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.visible(".not-exists");
        }, `[assert.visible] Selector ".not-exists" doesn't match any elements.`);
    });

    it("Is Visible Throws With Custom Message", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.visible(".hidden-text", "visible test failed");
        }, `[assert.visible] visible test failed`);
    });

    it("Is Visible From Node", async() => {
        const node = await browser.query("h1");
        await browser.assert.visible(node);
    });

    it("Is Visible Multiple Elements", async() => {
        await browser.assert.visible("b");
    });

    it("Not Visible", async() => {
        await browser.assert.not.visible(".hidden-text");
        await browser.assert.not.visible(".hidden-text2");
    });

    it("Not Visible Not Exists", async() => {
        await browser.assert.not.visible(".imaginary-text");
    });

    it("Not Visible Throws", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.not.visible("p");
        }, `[assert.not.visible] Expected element "p" to not be visible.`);
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.not.visible("h1");
        }, `[assert.not.visible] Expected element "h1" to not be visible.`);
    });

    it("Not Visible Throws With Custom Message", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.not.visible("p", "not visible failed");
        }, `[assert.not.visible] not visible failed`);
    });

    it("Not Visible Child", async() => {
        await browser.open(configUrls.hidden);
        await browser.assert.not.visible(".hidden-div");
        await browser.assert.not.visible(".child");
    });

    it("Is Not Visible With Opacity 0", async() => {
        await browser.open(configUrls.hidden);
        await browser.assert.not.visible(".hidden-opacity");

        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.visible(".hidden-opacity");
        }, `[assert.visible] Expected element ".hidden-opacity" to be visible.`);
    });
});
