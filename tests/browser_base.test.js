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

    after(async() => {
        await browser.close();
    });

    it("Query", async () => {
        await browser.open(configUrls.index);
        const element = await browser.query("h1");
        assert(element);
    });

    it("Query Multiple Elements", async () => {
        await browser.open(configUrls.index);
        const element = await browser.query("p");
        assert(element);
    });

    it("Query Not Element Found", async() => {
        await browser.open(configUrls.index);
        const element = await browser.query("div.not-exists");
        assert.strictEqual(element, null);
    });

    it("Query Node", async () => {
        await browser.open(configUrls.index);
        const element = await browser.query("h1");
        const element2 = await browser.query(element);
        assert(element2);
    });

    it("QueryAll", async () => {
        await browser.open(configUrls.index);
        const elements = await browser.queryAll("p");
        assert.strictEqual(elements.length, 2);
    });

    it("QueryAll One Element", async () => {
        await browser.open(configUrls.index);
        const elements = await browser.queryAll(".container p");
        assert.strictEqual(elements.length, 1);
    });

    it("XPath Query", async() => {
        await browser.open(configUrls.index);
        const elements = await browser.queryXPath('//p[contains(text(),"My first paragraph")]');
        assert.strictEqual(elements.length, 1);
    });

    it("Class", async() => {
        await browser.open(configUrls.index);
        const elements = await browser.class('div');
        assert.strictEqual(elements.length, 2);
        assert.strictEqual(elements[0], "container");
        assert.strictEqual(elements[1], "extra-class");
    });

    it("Class With Multiple Elements", async() => {
        await browser.open(configUrls.index);
        const elements = await browser.class('b');
        assert.strictEqual(elements.length, 1);
        assert.strictEqual(elements[0], "hidden-text2");
    });

    it("Class Element Doesn't Exists", async() => {
        await browser.open(configUrls.index);
        const elements = await browser.class('div.not-exists');
        assert.strictEqual(elements.length, 0);
    });

    it("Class From Node", async() => {
        await browser.open(configUrls.index);
        const node = await browser.query('div');
        const classes = await browser.class(node);
        assert.strictEqual(classes.length, 2);
        assert.strictEqual(classes[0], "container");
        assert.strictEqual(classes[1], "extra-class");
    });

    it("Attribute", async() => {
        await browser.open(configUrls.index);
        const classAttribute = await browser.attribute(".container", "class");
        assert.strictEqual(classAttribute, "container extra-class");
    });

    it("Attribute With Multiple Elements", async() => {
        await browser.open(configUrls.index);
        const classAttribute = await browser.attribute("b", "class");
        assert.strictEqual(classAttribute, "hidden-text2");
    });

    it("Empty Attribute", async() => {
        await browser.open(configUrls.index);
        const hiddenAttribute = await browser.attribute(".hidden-text", "hidden");
        assert.strictEqual(hiddenAttribute, "");
    });

    it("Non Existing Attribute", async() => {
        await browser.open(configUrls.index);
        const hiddenAttribute = await browser.attribute(".container", "hidden");
        assert.strictEqual(hiddenAttribute, null);
    });

    it("Attribute With Non Existing Element", async() => {
        await browser.open(configUrls.index);
        await utils.assertThrowsAsync(async () => {
            await browser.attribute(".not-element", "class");
        }, `Error: Element ".not-element" not found when trying to get attribute "class".`);
    });

    it("Attribute From Node", async() => {
        await browser.open(configUrls.index);
        const node = await browser.query('.container');
        const classAttribute = await browser.attribute(node, "class");
        assert.strictEqual(classAttribute, "container extra-class");
    });
});
