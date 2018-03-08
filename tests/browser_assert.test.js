"use strict";

const Wendigo = require('../lib/wendigo');
const utils = require('./utils');
const configUrls = require('./config.json').urls;

describe("Assertions", function() {
    this.timeout(5000);
    let browser;

    before(async () => {
        browser = await Wendigo.createBrowser();
    });

    after(async () => {
        await browser.close();
    });

    it("Multiple Assertions From Same Node", async () => {
        await browser.open(configUrls.index);
        const node = await browser.query("h1");
        await browser.assert.text(node, "Main Title");
        await browser.assert.visible(node);
    });

    it("Elements", async () => {
        await browser.open(configUrls.index);
        await browser.assert.elements("p", 2);
        await browser.assert.elements("p", {equal: 2});
        await browser.assert.elements("p.not-exists", 0);
        await browser.assert.elements("p", {atLeast: 1});
        await browser.assert.elements("p", {atLeast: 2});
        await browser.assert.elements("p", {atMost: 3});
        await browser.assert.elements("p", {atMost: 2});
        await browser.assert.elements("p", {atLeast: 1, atMost: 3});
        await browser.assert.elements("p", {atLeast: 1, equal: 2, atMost: 3});
    });

    it("Elements Throws", async () => {
        await browser.open(configUrls.index);
        await utils.assertThrowsAssertionAsync (async () => {
            await browser.assert.elements("p", 3);
        }, `Expected selector "p" to find exactly 3 elements, 2 found`);
        await utils.assertThrowsAssertionAsync (async () => {
            await browser.assert.elements("p", {atLeast: 3});
        }, `Expected selector "p" to find at least 3 elements, 2 found`);
        await utils.assertThrowsAssertionAsync (async () => {
            await browser.assert.elements("p", {atMost: 1});
        }, `Expected selector "p" to find up to 1 elements, 2 found`);
        await utils.assertThrowsAssertionAsync (async () => {
            await browser.assert.elements("p", {atMost: 4, atLeast: 3});
        }, `Expected selector "p" to find between 3 and 4 elements, 2 found`);
        await utils.assertThrowsAssertionAsync (async () => {
            await browser.assert.elements("p", {atMost: 1, atLeast: 0});
        }, `Expected selector "p" to find between 0 and 1 elements, 2 found`);
    });

    it("Elements Throws With Custom Message", async () => {
        await browser.open(configUrls.index);
        await utils.assertThrowsAssertionAsync (async () => {
            await browser.assert.elements("p", 3, "elements failed");
        }, `elements failed`);
    });

    it("Element", async () => {
        await browser.open(configUrls.index);
        await browser.assert.element("h1");
    });

    it("Element Throws", async () => {
        await browser.open(configUrls.index);
        await utils.assertThrowsAssertionAsync (async () => {
            await browser.assert.element("p.not-exist");
        }, `Expected selector "p.not-exist" to find exactly 1 elements, 0 found`);
        await utils.assertThrowsAssertionAsync (async () => {
            await browser.assert.element("p");
        }, `Expected selector "p" to find exactly 1 elements, 2 found`);
    });

    it("Element Throws With Custom Message", async () => {
        await browser.open(configUrls.index);
        await utils.assertThrowsAssertionAsync (async () => {
            await browser.assert.element("p", "element failed");
        }, `element failed`);
    });

    it("Text Contains", async () => {
        await browser.open(configUrls.index);
        await browser.assert.textContains(".container p", "My first paragraph");
        await browser.assert.textContains(".container p", "My first");
    });

    it("Text Contains Multiple Elements", async () => {
        await browser.open(configUrls.index);
        await browser.assert.textContains("p", "My first paragraph");
        await browser.assert.textContains("p", "My second paragraph");
        await browser.assert.textContains("p", "My second");
        await browser.assert.textContains("p", "My first");
    });

    it("Text Contains From Node", async () => {
        await browser.open(configUrls.index);
        const node = await browser.query(".container p");
        await browser.assert.textContains(node, "My first");
    });

    it("Text Contains Throws", async () => {
        await browser.open(configUrls.index);
        await utils.assertThrowsAssertionAsync (async () => {
            await browser.assert.textContains(".container p", "My second");
        }, `Expected element ".container p" to contain text "My second", "My first paragraph" found`);
        await utils.assertThrowsAssertionAsync (async () => {
            await browser.assert.textContains("p", "My paragraph");
        }, `Expected element "p" to contain text "My paragraph", "My first paragraph My second paragraph" found`);
    });

    it("Text Contains Throws With Custom Message", async () => {
        await browser.open(configUrls.index);
        await utils.assertThrowsAssertionAsync (async () => {
            await browser.assert.textContains(".container p", "My second", "text contains fails");
        }, `text contains fails`);
    });
});
