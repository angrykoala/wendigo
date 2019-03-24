"use strict";

const assert = require('assert');
const Wendigo = require('../..');
const configUrls = require('../config.json').urls;

describe("Tag", function() {
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

    it("Get Tag", async() => {
        const tag = await browser.tag(".hidden-text");
        assert.strictEqual(tag, "i");
    });

    it("Get Tag From DOMElement", async() => {
        const headerElement = await browser.findByText("Main Title");
        assert.strictEqual(headerElement.length, 1);
        const tag = await browser.tag(headerElement[0]);
        assert.strictEqual(tag, "h1");
    });

    it("Get Tag From Non Existent Element", async() => {
        const tag = await browser.tag(".not-a-class");
        assert.strictEqual(tag, null);
    });

    it("Get Tag From Multiple Elements", async() => {
        const tag = await browser.tag("p");
        assert.strictEqual(tag, "p");
    });
});
