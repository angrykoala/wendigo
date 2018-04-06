"use strict";

const assert = require('assert');
const Wendigo = require('../../lib/wendigo');
const configUrls = require('../config.json').urls;

describe("Find By Text", function() {
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

    it("Find By Text", async () => {
        const headerElement = await browser.findByText("Main Title");
        assert.strictEqual(headerElement.length, 1);
    });

    it("Find By Text Empty", async () => {
        const headerElement = await browser.findByText("Not title");
        assert.strictEqual(headerElement.length, 0);
    });

    it("Find By Text SubQuery", async () => {
        const paragraphElement = await browser.findByText(".container", "My first paragraph");
        assert.strictEqual(paragraphElement.length, 1);
        const titleElement = await browser.findByText(".container", "Main Title");
        assert.strictEqual(titleElement.length, 0);
    });

    it("Find By Text SubQuery With Nested Elements", async () => {
        const titleElements = await browser.findByTextContaining("body", "My first paragraph");
        assert.strictEqual(titleElements.length, 1);
    });

    it("Find By Text Containing", async () => {
        const elements = await browser.findByTextContaining("paragraph");
        assert.strictEqual(elements.length, 2);
    });

    it("Find By Text Containing SubQuery", async () => {
        const paragraphElements = await browser.findByTextContaining(".container", "first paragraph");
        assert.strictEqual(paragraphElements.length, 1);
        const titleElements = await browser.findByTextContaining(".container", "Title");
        assert.strictEqual(titleElements.length, 0);
    });

    it("Find By Text Containing SubQuery With Nested Elements", async () => {
        const paragraphElements = await browser.findByTextContaining("body", "first");
        assert.strictEqual(paragraphElements.length, 1);
    });

    it("Find By Text Containing And Click", async () => {
        await browser.open(configUrls.click);
        const elements = await browser.findByTextContaining("click");
        await browser.click(elements);
        await browser.assert.text("#switch", "Off");
        await browser.waitFor("#switch.on", 600);
    });
});
