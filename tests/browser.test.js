"use strict";

const Ghoul = require('../lib/ghoul');
const assert = require('assert');

describe("Browser", () => {
    let browser;

    beforeEach(async () => {
        browser = await Ghoul.createBrowser();
    });

    it("Text", async() => {
        await browser.open("http://localhost:3456/index.html");
        const titleText = await browser.text("h1");
        assert.strictEqual(titleText[0], "Main Title");
    });

    it("Multiple Texts", async() => {
        await browser.open("http://localhost:3456/index.html");
        const texts = await browser.text("p");
        assert.strictEqual(texts.length, 2);
        assert.strictEqual(texts[0], "My first paragraph");
        assert.strictEqual(texts[1], "My second paragraph");
    });

    it("Html", async () => {
        await browser.open("http://localhost:3456/html_simple.html");
        const expectedHtml = `<!DOCTYPE html><html><head></head><body>
<p>html_test</p>


</body></html>`;
        const html = await browser.html();
        assert.strictEqual(html, expectedHtml);
    });

    it("Title", async() => {
        await browser.open("http://localhost:3456/index.html");
        const title = await browser.title();
        assert.strictEqual(title, "Index Test");
    });

    it("Default Title", async() => {
        await browser.open("http://localhost:3456/html_simple.html");
        const title = await browser.title();
        assert.strictEqual(title, "");
    });
});
