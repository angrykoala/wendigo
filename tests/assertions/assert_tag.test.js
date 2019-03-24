"use strict";

const assert = require('assert');
const Wendigo = require('../..');
const utils = require('../test_utils');
const configUrls = require('../config.json').urls;

describe("Assert Tag", function() {
    this.timeout(5000);
    let browser;

    before(async() => {
        browser = await Wendigo.createBrowser();
        await browser.open(configUrls.index);
    });

    after(async() => {
        await browser.close();
    });

    it("Assert Tag", async() => {
        await browser.assert.tag(".hidden-text", "i");
    });

    it("Assert Tag From DOMElement", async() => {
        const headerElement = await browser.findByText("Main Title");
        assert.strictEqual(headerElement.length, 1);
        await browser.assert.tag(headerElement[0], "h1");
    });

    it("Assert Fails, No Element Found", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.tag(".not-a-class", "div");
        }, `[assert.tag] No element with tag "div" found.`);
    });

    it("Assert Fails, No Element With Given Tag Found", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.tag("p", "div");
        }, `[assert.tag] No element with tag "div" found.`);
    });

    it("Assert Fails With Custom Message", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.tag("p", "div", "tag-fails");
        }, `[assert.tag] tag-fails`);
    });

    it("Assert Fails Missing Expectation", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.assert.tag("p");
        }, `Error: [assert.tag] Missing expected tag for assertion.`);
    });

    it("Assert With Multiple Elements", async() => {
        await browser.assert.tag("p", "p");
    });

    it("Assert Not Tag", async() => {
        await browser.assert.not.tag(".hidden-text", "b");
    });

    it("Assert Not Tag From DOMElement", async() => {
        const headerElement = await browser.findByText("Main Title");
        assert.strictEqual(headerElement.length, 1);
        await browser.assert.not.tag(headerElement[0], "h3");
    });

    it("Assert Not Tag With No Element Found", async() => {
        await browser.assert.not.tag(".not-a-class", "div");
    });

    it("Not Assert Tag Fails", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.not.tag("p", "p");
        }, `[assert.not.tag] Expected element "p" to not have "p" tag.`);
    });

    it("Assert Fails With Custom Message", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.not.tag("p", "p", "not-tag-fails");
        }, `[assert.not.tag] not-tag-fails`);
    });

    it("Assert Fails Missing Expectation", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.assert.not.tag("p");
        }, `Error: [assert.not.tag] Missing expected tag for assertion.`);
    });

    it("Assert Not Tag With Multiple Elements", async() => {
        await browser.assert.not.tag("p", "b");
    });
});
