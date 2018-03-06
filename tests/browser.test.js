"use strict";

const assert = require('assert');
const Wendigo = require('../lib/wendigo');
const configUrls = require('./config.json').urls;

describe("Browser", function() {
    this.timeout(5000);
    let browser;

    before(async () => {
        browser = await Wendigo.createBrowser();
    });

    after(async() => {
        await browser.close();
    });

    it("Html", async () => {
        await browser.open(configUrls.simple);
        const expectedHtml = `<!DOCTYPE html><html><head></head><body>
<p>html_test</p>


</body></html>`;
        const html = await browser.html();
        assert.strictEqual(html, expectedHtml);
    });

    it("Title", async() => {
        await browser.open(configUrls.index);
        const title = await browser.title();
        assert.strictEqual(title, "Index Test");
    });

    it("Default Title", async() => {
        await browser.open(configUrls.simple);
        const title = await browser.title();
        assert.strictEqual(title, "");
    });

    it("Find By Text", async() => {
        await browser.open(configUrls.index);
        const headerElement = await browser.findByText("Main Title");
        assert.strictEqual(headerElement.length, 1);
    });
    it("Find By Text Empty", async() => {
        await browser.open(configUrls.index);
        const headerElement = await browser.findByText("Not title");
        assert.strictEqual(headerElement.length, 0);
    });

    it("Find By Text Containing", async() => {
        await browser.open(configUrls.index);
        const elements = await browser.findByTextContaining("paragraph");
        assert.strictEqual(elements.length, 2);
    });
});
