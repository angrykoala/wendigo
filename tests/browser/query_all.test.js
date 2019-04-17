"use strict";

const Wendigo = require('../..');
const assert = require('assert');
const configUrls = require('../config.json').urls;
const utils = require('../test_utils');

describe("Query All", function() {
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

    it("QueryAll", async() => {
        const elements = await browser.queryAll("p");
        assert.strictEqual(elements.length, 2);
    });

    it("QueryAll One Element", async() => {
        const elements = await browser.queryAll(".container p");
        assert.strictEqual(elements.length, 1);
    });

    it("QueryAll Node", async() => {
        const element = await browser.query("h1");
        const element2 = await browser.queryAll(element);
        assert(element2.length === 1);
        assert(element2[0]);
    });

    it("QueryAll SubElement", async() => {
        const element = await browser.query(".container");
        const elements = await browser.queryAll(element, "p");
        assert(elements.length === 1);
        assert(elements[0]);
    });

    it("QueryAll Element Not Found", async() => {
        const elements = await browser.queryAll(".not-element");
        assert.strictEqual(elements.length, 0);
    });

    it("Query Invalid Selector", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.query(10);
        }, `Error: [query] Invalid selector.`);
    });

    it("QueryAll Invalid Selector", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.queryAll(10);
        }, `Error: [queryAll] Invalid selector.`);
    });

    it("Query Invalid Selector With Optional Selector", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.query(10, ".p");
        }, `Error: [query] Invalid selector.`);
    });

    it("QueryAll Invalid Selector With Optional Selector", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.queryAll(10, ".p");
        }, `Error: [queryAll] Invalid selector.`);
    });

    it("QueryAll With XPath", async() => {
        const elements = await browser.queryAll('//p[contains(text(),"paragraph")]');
        assert.strictEqual(elements.length, 2);
    });

    it("QueryAll With XPath Children", async() => {
        const elements = await browser.queryAll("body", '//p[contains(text(),"paragraph")]');
        assert.strictEqual(elements.length, 2);
    });

    it("QueryAll With XPath Children With One Element Only", async() => {
        const elements = await browser.queryAll(".container", '//p[contains(text(),"paragraph")]');
        assert.strictEqual(elements.length, 1);
    });

    it("QueryAll With Multiple Parents", async() => {
        await browser.open(configUrls.nestedElements);
        const elements = await browser.queryAll(".container", "p");
        assert.strictEqual(elements.length, 2);
        await browser.assert.text(elements[0], "My first paragraph");
        await browser.assert.text(elements[1], "My second paragraph");
    });
});
