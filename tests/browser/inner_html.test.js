"use strict";

const assert = require('assert');
const Wendigo = require('../..');
const configUrls = require('../config.json').urls;

describe("Inner Html", function() {
    this.timeout(5000);
    let browser;

    before(async() => {
        browser = await Wendigo.createBrowser();
    });

    after(async() => {
        await browser.close();
    });

    it("InnerHtml", async() => {
        await browser.open(configUrls.index);
        const innerHtml = await browser.innerHtml(".container");
        assert.strictEqual(innerHtml.length, 1);
        assert.strictEqual(innerHtml[0], "\n        <p>My first paragraph</p>\n    ");
    });

    it("InnerHtml Multiple Elements", async() => {
        await browser.open(configUrls.index);
        const innerHtml = await browser.innerHtml("b");
        assert.strictEqual(innerHtml.length, 2);
        assert.strictEqual(innerHtml[0], "Hidden text");
        assert.strictEqual(innerHtml[1], "");
    });
});
