"use strict";

const Wendigo = require('../../lib/wendigo');
const utils = require('../utils');
const configUrls = require('../config.json').urls;

describe("Assert Text", function() {
    this.timeout(5000);
    let browser;

    before(async () => {
        browser = await Wendigo.createBrowser();
    });

    beforeEach(async() => {
        await browser.open(configUrls.index);
    });

    after(async() => {
        await browser.close();
    });

    it("Text", async () => {
        await browser.assert.text("h1", "Main Title");
    });

    it("Text From Node", async () => {
        const node = await browser.query("h1");
        await browser.assert.text(node, "Main Title");
    });

    it("Multiple Texts", async () => {
        await browser.assert.text("p", "My first paragraph");
        await browser.assert.text("p", "My second paragraph");
    });

    it("Text Throws", async () => {
        await utils.assertThrowsAssertionAsync(async () => {
            await browser.assert.text("h1", "My first paragraph");
        }, `Expected element "h1" to have text "My first paragraph", "Main Title" found`);
        await utils.assertThrowsAssertionAsync(async () => {
            await browser.assert.text("h2", "My first paragraph");
        }, `Expected element "h2" to have text "My first paragraph", no text found`);
        await utils.assertThrowsAssertionAsync(async () => {
            await browser.assert.text(".container p", "My second paragraph");
        }, `Expected element ".container p" to have text "My second paragraph", "My first paragraph" found`);
    });

    it("Multiple Text Throws", async () => {
        await utils.assertThrowsAssertionAsync(async () => {
            await browser.assert.text("p", "My paragraph");
        }, `Expected element "p" to have text "My paragraph", "My first paragraph My second paragraph" found`);
    });

    it("Text Throws With Custom Message", async () => {
        await utils.assertThrowsAssertionAsync(async () => {
            await browser.assert.text("h1", "My first paragraph", "text failed");
        }, `text failed`);
    });

});
