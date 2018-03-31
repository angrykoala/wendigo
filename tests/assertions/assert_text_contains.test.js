"use strict";

const Wendigo = require('../../lib/wendigo');
const utils = require('../test_utils');
const configUrls = require('../config.json').urls;

describe("Assert Text Contains", function() {
    this.timeout(5000);
    let browser;

    before(async () => {
        browser = await Wendigo.createBrowser();
    });

    beforeEach(async () => {
        await browser.open(configUrls.index);
    });

    after(async () => {
        await browser.close();
    });


    it("Text Contains", async () => {
        await browser.assert.textContains(".container p", "My first paragraph");
        await browser.assert.textContains(".container p", "My first");
    });

    it("Text Contains Multiple Elements", async () => {
        await browser.assert.textContains("p", "My first paragraph");
        await browser.assert.textContains("p", "My second paragraph");
        await browser.assert.textContains("p", "My second");
        await browser.assert.textContains("p", "My first");
    });

    it("Text Contains From Node", async () => {
        const node = await browser.query(".container p");
        await browser.assert.textContains(node, "My first");
    });

    it("Text Contains Throws", async () => {
        await utils.assertThrowsAssertionAsync (async () => {
            await browser.assert.textContains(".container p", "My second");
        }, `Expected element ".container p" to contain text "My second", "My first paragraph" found`);
        await utils.assertThrowsAssertionAsync (async () => {
            await browser.assert.textContains("p", "My paragraph");
        }, `Expected element "p" to contain text "My paragraph", "My first paragraph My second paragraph" found`);
    });

    it("Text Contains Throws With Custom Message", async () => {
        await utils.assertThrowsAssertionAsync (async () => {
            await browser.assert.textContains(".container p", "My second", "text contains fails");
        }, `text contains fails`);
    });
});
