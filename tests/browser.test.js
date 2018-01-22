"use strict";

const assert = require('assert');
const Wendigo = require('../lib/wendigo');

describe("Browser", () => {
    let browser;

    beforeEach(async () => {
        browser = await Wendigo.createBrowser();
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

    it("Find By Text", async() => {
        await browser.open("http://localhost:3456/index.html");
        const headerElement = await browser.findByText("Main Title");
        assert.strictEqual(headerElement.length, 1);
        assert.strictEqual(headerElement[0].textContent, "Main Title");
        assert.strictEqual(headerElement[0].tagName, "h1");
    });
    it("Find By Text Empty", async() => {
        await browser.open("http://localhost:3456/index.html");
        const headerElement = await browser.findByText("Not title");
        assert.strictEqual(headerElement.length, 0);

    });
    it("Find By Text Containing", async() => {
        await browser.open("http://localhost:3456/index.html");
        const elements = await browser.findByTextContaining("paragraph");
        assert.strictEqual(elements.length, 2);
        assert.strictEqual(elements[0].textContent, "My first paragraph");
        assert.strictEqual(elements[0].tagName, "p");
        assert.strictEqual(elements[1].textContent, "My second paragraph");
        assert.strictEqual(elements[1].tagName, "p");
    });
});
