"use strict";

const Wendigo = require('../..');
const assert = require('assert');
const configUrls = require('../config.json').urls;

describe("Find By Attribute", function() {
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

    it("Find Attribute Title", async() => {
        const elements = await browser.findByAttribute("title", "title");
        assert.strictEqual(elements.length, 1);
        await browser.assert.class(elements[0], "second-element");
    });

    it("Find Attribute Without Value", async() => {
        const elements = await browser.findByAttribute("title");
        assert.strictEqual(elements.length, 1);
        await browser.assert.class(elements[0], "second-element");
    });

    it("Find Attribute With Multiple Elements", async() => {
        const elements = await browser.findByAttribute("class");
        assert.strictEqual(elements.length, 4);
    });

    it("Find Zero Elements With Given Attribute", async() => {
        const elements = await browser.findByAttribute("not-my-attribute");
        assert.strictEqual(elements.length, 0);
    });

    it("Find Zero Elements With Given Value", async() => {
        const elements = await browser.findByAttribute("title", "different-title");
        assert.strictEqual(elements.length, 0);
    });

    it("Find By Null Attribute", async() => {
        const elements = await browser.findByAttribute("hidden", "");
        assert.strictEqual(elements.length, 1);
    });

    it("Find By Null Attribute Without Results", async() => {
        const elements = await browser.findByAttribute("class", "");
        assert.strictEqual(elements.length, 0);
    });
});
