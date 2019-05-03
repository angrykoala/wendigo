"use strict";

const Wendigo = require('../..');
const utils = require('../test_utils');
const configUrls = require('../config.json').urls;

describe("Assert Attribute", function() {
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

    it("Attribute", async() => {
        await browser.assert.attribute(".hidden-text", "class", "hidden-text");
        await browser.assert.attribute(".hidden-text", "hidden", "");
    });

    it("Attribute With Multiple Elements", async() => {
        await browser.assert.attribute("b", "title", "title");
        await browser.assert.attribute("b", "title");
    });

    it("Attribute Without Expected", async() => {
        await browser.assert.attribute(".hidden-text", "class");
        await browser.assert.attribute(".hidden-text", "hidden");
    });

    it("Attribute From Node", async() => {
        const element = await browser.query(".hidden-text");
        await browser.assert.attribute(element, "class", "hidden-text");
        await browser.assert.attribute(element, "hidden", "");
    });

    it("Attribute Throws", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.attribute(".hidden-text", "class", "hidden");
        }, `[assert.attribute] Expected element ".hidden-text" to have attribute "class" with value "hidden", ["hidden-text"] found.`);
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.attribute(".second-element", "hidden");
        }, `[assert.attribute] Expected element ".second-element" to have attribute "hidden".`);
    });

    it("Attribute Throws With No Element Found", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.attribute(".not-an-element", "class", "hidden");
        }, `[assert.attribute] Expected element ".not-an-element" to have attribute "class" with value "hidden", no element found.`);
    });

    it("Attribute Throws With Custom Message", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.attribute(".hidden-text", "class", "hidden", "attribute error");
        }, `[assert.attribute] attribute error`);
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.attribute(".hidden-text", "href", undefined, "attribute error 2");
        }, `[assert.attribute] attribute error 2`);
    });

    it("Attribute Equals Null", async() => {
        await browser.assert.attribute(".hidden-text", "href", null);
    });

    it("Attribute Equals Null Throws", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.attribute(".hidden-text", "hidden", null);
        }, `[assert.attribute] Expected element ".hidden-text" not to have attribute "hidden".`);
    });

    it("Not Attribute", async() => {
        await browser.assert.not.attribute(".hidden-text", "class", "not-hidden-text");
    });

    it("Not Attribute Without Value", async() => {
        await browser.assert.not.attribute(".hidden-text", "href");
    });

    it("Not Attribute Throws", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.not.attribute(".hidden-text", "class", "hidden-text");
        }, `[assert.not.attribute] Expected element ".hidden-text" not to have attribute "class" with value "hidden-text".`);
    });

    it("Not Attribute With Multiple Elements Throws", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.not.attribute("b", "title", "title");
        }, `[assert.not.attribute] Expected element "b" not to have attribute "title" with value "title".`);
    });

    it("Not Attribute Without Value Throws", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.not.attribute(".hidden-text", "hidden");
        }, `[assert.not.attribute] Expected element ".hidden-text" not to have attribute "hidden".`);
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.not.attribute(".hidden-text", "class");
        }, `[assert.not.attribute] Expected element ".hidden-text" not to have attribute "class".`);
    });

    it("Not Attribute With No Element Found Throws", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.not.attribute(".not-element", "hidden");
        }, `[assert.not.attribute] Expected element ".not-element" not to have attribute "hidden", no element found.`);
    });

    it("Not Attribute From Node", async() => {
        await browser.open(configUrls.index);
        const node = await browser.query(".hidden-text");
        await browser.assert.not.attribute(node, "class", "not-hidden-text");
    });

    it("Not Attribute Throws Custom Message", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.not.attribute(".hidden-text", "class", "hidden-text", "custom msg");
        }, `[assert.not.attribute] custom msg`);
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.not.attribute(".hidden-text", "hidden", undefined, "custom msg 2");
        }, `[assert.not.attribute] custom msg 2`);
    });

    it("Attribute With Regex", async() => {
        await browser.assert.attribute(".hidden-text", "class", /hidden-te/);
    });

    it("Attribute With Regex Throws", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.attribute(".hidden-text", "class", /not-hidden-te/);
        }, `[assert.attribute] Expected element ".hidden-text" to have attribute "class" with value "/not-hidden-te/", ["hidden-text"] found.`);
    });
});
