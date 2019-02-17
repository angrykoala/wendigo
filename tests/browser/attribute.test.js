"use strict";

const Wendigo = require('../..');
const assert = require('assert');
const configUrls = require('../config.json').urls;
const utils = require('../test_utils');

describe("Browser Attribute", function() {
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

    it("Attribute", async() => {
        const classAttribute = await browser.attribute(".container", "class");
        assert.strictEqual(classAttribute, "container extra-class");
    });

    it("Attribute With Multiple Elements", async() => {
        const classAttribute = await browser.attribute("b", "class");
        assert.strictEqual(classAttribute, "hidden-text2");
    });

    it("Empty Attribute", async() => {
        await browser.open(configUrls.index);
        const hiddenAttribute = await browser.attribute(".hidden-text", "hidden");
        assert.strictEqual(hiddenAttribute, "");
    });

    it("Non Existing Attribute", async() => {
        const hiddenAttribute = await browser.attribute(".container", "hidden");
        assert.strictEqual(hiddenAttribute, null);
    });

    it("Attribute With Non Existing Element", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.attribute(".not-element", "class");
        }, `QueryError: [attribute] Element ".not-element" not found.`);
    });

    it("Attribute From Node", async() => {
        const node = await browser.query('.container');
        const classAttribute = await browser.attribute(node, "class");
        assert.strictEqual(classAttribute, "container extra-class");
    });
});
