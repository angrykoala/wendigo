"use strict";

const Wendigo = require('../lib/wendigo');
const assert = require('assert');
const configUrls = require('./config.json').urls;
const utils = require('./utils');

describe("Browser Base", function() {
    this.timeout(5000);

    let browser;
    before(async () => {
        browser = await Wendigo.createBrowser();
    });

    after(async () => {
        await browser.close();
    });

    it("XPath Query", async () => {
        await browser.open(configUrls.index);
        const elements = await browser.queryXPath('//p[contains(text(),"My first paragraph")]');
        assert.strictEqual(elements.length, 1);
    });

    it("Attribute", async () => {
        await browser.open(configUrls.index);
        const classAttribute = await browser.attribute(".container", "class");
        assert.strictEqual(classAttribute, "container extra-class");
    });

    it("Attribute With Multiple Elements", async () => {
        await browser.open(configUrls.index);
        const classAttribute = await browser.attribute("b", "class");
        assert.strictEqual(classAttribute, "hidden-text2");
    });

    it("Empty Attribute", async () => {
        await browser.open(configUrls.index);
        const hiddenAttribute = await browser.attribute(".hidden-text", "hidden");
        assert.strictEqual(hiddenAttribute, "");
    });

    it("Non Existing Attribute", async () => {
        await browser.open(configUrls.index);
        const hiddenAttribute = await browser.attribute(".container", "hidden");
        assert.strictEqual(hiddenAttribute, null);
    });

    it("Attribute With Non Existing Element", async () => {
        await browser.open(configUrls.index);
        await utils.assertThrowsAsync (async () => {
            await browser.attribute(".not-element", "class");
        }, `Error: Element ".not-element" not found when trying to get attribute "class".`);
    });

    it("Attribute From Node", async () => {
        await browser.open(configUrls.index);
        const node = await browser.query('.container');
        const classAttribute = await browser.attribute(node, "class");
        assert.strictEqual(classAttribute, "container extra-class");
    });
});
