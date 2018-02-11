"use strict";

const Wendigo = require('../../lib/wendigo');
const utils = require('../utils');
const configUrls = require('../config.json').urls;

describe.skip("Assert Attribute", function() {
    this.timeout(5000);
    let browser;

    before(async () => {
        browser = await Wendigo.createBrowser();
    });

    after(async() => {
        await browser.close();
    });

    it("Attribute", async() => {
        await browser.open(configUrls.index);
        await browser.assert.attribute(".hidden-text", "class", "hidden-text");
        await browser.assert.attribute(".hidden-text", "hidden", "");
        await browser.assert.attribute(".hidden-text", "hidden");
    });

    it("Attribute From Node", async() => {
        await browser.open(configUrls.index);
        const element = await browser.query(".hidden-text");
        await browser.assert.attribute(element, "class", "hidden-text");
        await browser.assert.attribute(element, "hidden", "");
    });

    it("Attribute Throws", async() => {
        await browser.open(configUrls.index);
        await utils.assertThrowsAssertionAsync(async () => {
            await browser.assert.attribute(".hidden-text", "class", "hidden");
        }, `Expected element ".hidden-text" to have attribute "class" with value "hidden". "hidden-text" found`);

        await utils.assertThrowsAssertionAsync(async () => {
            await browser.assert.attribute(".second-element", "hidden");
        }, `Expected element ".second-element" to have attribute "hidden".`);
    });

    it("Attribute Throws With No Element Found", async() => {
        await browser.open(configUrls.index);

        await utils.assertThrowsAssertionAsync(async () => {
            await browser.assert.attribute(".not-and-element", "class", "hidden");
        }, `Expected element ".not-and-element" to have attribute "class" with value "hidden". No element found`);
    });

    it("Attribute Throws With Custom Message", async() => {
        await browser.open(configUrls.index);

        await utils.assertThrowsAssertionAsync(async () => {
            await browser.assert.attribute(".hidden-text", "class", "hidden", "attribute error");
        }, `attribute error`);
    });

});
