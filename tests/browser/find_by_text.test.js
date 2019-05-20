"use strict";

const assert = require('assert');
const Wendigo = require('../..');
const configUrls = require('../config.json').urls;
const utils = require('../test_utils');

describe("Find By Text", function() {
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

    it("Find By Text", async() => {
        const headerElement = await browser.findByText("Main Title");
        assert.strictEqual(headerElement.length, 1);
    });

    it("Find By Text Empty", async() => {
        const headerElement = await browser.findByText("Not title");
        assert.strictEqual(headerElement.length, 0);
    });

    it("Find By Text SubQuery", async() => {
        const paragraphElement = await browser.findByText(".container", "My first paragraph");
        assert.strictEqual(paragraphElement.length, 1);
        const titleElement = await browser.findByText(".container", "Main Title");
        assert.strictEqual(titleElement.length, 0);
    });

    it("Find By Text SubQuery With Nested Elements", async() => {
        const titleElements = await browser.findByText("body", "My first paragraph");
        assert.strictEqual(titleElements.length, 1);
    });

    it("Find By Text Containing", async() => {
        const elements = await browser.findByTextContaining("paragraph");
        assert.strictEqual(elements.length, 2);
    });

    it("Find By Text Containing SubQuery", async() => {
        const paragraphElements = await browser.findByTextContaining(".container", "paragraph");
        assert.strictEqual(paragraphElements.length, 1);
        const titleElements = await browser.findByTextContaining(".container", "Title");
        assert.strictEqual(titleElements.length, 0);
    });

    it("Find By Text Containing SubQuery With Nested Elements", async() => {
        const titleElements = await browser.findByTextContaining("body", "paragraph");
        assert.strictEqual(titleElements.length, 2);
    });

    it("Find By Text Containing SubQuery With Nested Elements", async() => {
        const paragraphElements = await browser.findByTextContaining("body", "first");
        assert.strictEqual(paragraphElements.length, 1);
    });

    it("Find By Text Containing And Click", async() => {
        await browser.open(configUrls.click);
        const elements = await browser.findByTextContaining("click");
        const clicked = await browser.click(elements);
        await browser.assert.text("#switch", "Off");
        assert.strictEqual(clicked, 3);
    });

    it("Find By Text With Invalid Selector", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.findByText({}, "first");
        }, "Error: [findByText] Invalid selector.");
    });

    it("Find By Text Containing With Invalid Selector", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.findByTextContaining({}, "first");
        }, "Error: [findByTextContaining] Invalid selector.");
    });

    it("Find By Text With Quotes Character", async() => {
        await browser.open(configUrls.weirdText);
        const elems = await browser.findByText("\"quotes'");
        assert.strictEqual(elems.length, 1);
    });

    it("Find By Text With Multiple Quotes Character Fail", async() => {
        await browser.open(configUrls.weirdText);
        const elems = await browser.findByText("\"quo'tes''");
        assert.strictEqual(elems.length, 0);
    });

    it("Find By Text With Quotes Character Fails", async() => {
        await browser.open(configUrls.weirdText);
        const elems = await browser.findByText("\"quo");
        assert.strictEqual(elems.length, 0);
    });

    it("Find By Text Containing With Quotes Character", async() => {
        await browser.open(configUrls.weirdText);
        const elems = await browser.findByTextContaining("\"quo");
        assert.strictEqual(elems.length, 1);
    });

    it("Find By Text Containing With Simple Quote Character", async() => {
        await browser.open(configUrls.weirdText);
        const elems = await browser.findByTextContaining("es'");
        assert.strictEqual(elems.length, 1);
    });

    it("Find By Text With Colon Character", async() => {
        await browser.open(configUrls.weirdText);
        const elems = await browser.findByText("colon:");
        assert.strictEqual(elems.length, 1);
    });

    it("Find By Text Containing With Colon Character", async() => {
        await browser.open(configUrls.weirdText);
        const elems = await browser.findByTextContaining("on:");
        assert.strictEqual(elems.length, 1);
    });
});
