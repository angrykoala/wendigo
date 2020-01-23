"use strict";

const assert = require('assert');
const Wendigo = require('../..');
const configUrls = require('../config.json').urls;

describe("Text", function() {
    this.timeout(5000);
    let browser;

    before(async() => {
        browser = await Wendigo.createBrowser();
    });

    after(async() => {
        await browser.close();
    });

    it("Text", async() => {
        await browser.open(configUrls.index);
        const titleText = await browser.text("h1");
        assert.strictEqual(titleText[0], "Main Title");
    });

    it("Text From Node", async() => {
        await browser.open(configUrls.index);
        const node = await browser.query("h1");
        const titleText = await browser.text(node);
        assert.strictEqual(titleText[0], "Main Title");
    });

    it("Text From Xpath", async() => {
        await browser.open(configUrls.index);
        const titleText = await browser.text("//h1");
        assert.strictEqual(titleText[0], "Main Title");
    });

    it("Multiple Texts", async() => {
        await browser.open(configUrls.index);
        const texts = await browser.text("p");
        assert.strictEqual(texts.length, 2);
        assert.strictEqual(texts[0], "My first paragraph");
        assert.strictEqual(texts[1], "My second paragraph");
    });

    it("Button Text", async() => {
        await browser.open(configUrls.click);
        const text = await browser.text(".btn");
        assert.strictEqual(text[0], "click me");
    });

    it("Text With <br>", async() => {
        await browser.open(configUrls.weirdText);
        const text = await browser.text(".text-br");
        assert.strictEqual(text[0], "This isa text");
    });

    it("Text With Newlines Option");
});
