"use strict";

const Wendigo = require('../..');
const assert = require('assert');
const DomElement = require('../../dist/lib/models/dom_element').default;
const configUrls = require('../config.json').urls;
const utils = require('../test_utils');

describe("Query", function() {
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

    it("Query", async() => {
        const element = await browser.query("h1");
        assert(element);
        assert(element instanceof DomElement);
    });

    it("Query Multiple Elements", async() => {
        const element = await browser.query("p");
        assert(element);
        assert(element instanceof DomElement);
    });

    it("Query Not Element Found", async() => {
        const element = await browser.query("div.not-exists");
        assert.strictEqual(element, null);
    });

    it("Query Node", async() => {
        const element = await browser.query("h1");
        const element2 = await browser.query(element);
        assert(element2);
        assert(element instanceof DomElement);
    });

    it("Query Sub Element", async() => {
        const container = await browser.query(".container");
        const element = await browser.query(container, "p");
        assert(element);
        assert(element instanceof DomElement);
    });

    it("Query Sub Element Not Found", async() => {
        const container = await browser.query(".container");
        const element = await browser.query(container, "b");
        assert.strictEqual(element, null);
    });

    it("Query Sub Element With String", async() => {
        const container = await browser.query(".container");
        const element = await browser.query(container, "p");
        assert(element);
        assert(element instanceof DomElement);
    });

    it("XPath Query", async() => {
        const element = await browser.query('//p[contains(text(),"My first paragraph")]');
        assert(element);
        assert(element instanceof DomElement);
    });

    it("XPath SubQuery", async() => {
        const container = await browser.query(".container");
        const element = await browser.query(container, "/p");
        assert(element);
        assert(element instanceof DomElement);
    });

    it("XPath SubQuery With Global Path", async() => {
        const container = await browser.query(".container");
        const element = await browser.query(container, "//p");
        assert(element);
        assert(element instanceof DomElement);
    });

    it("Query Dom Selector", async() => {
        const element = await browser.query("p");
        const element2 = await browser.query(element);
        assert(element2);
        assert(element === element2);
    });

    it("Query Invalid Selector", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.query({});
        }, "Error: [query] Invalid selector.");
    });

    it("XPath SubsQuery Not Found", async() => {
        const container = await browser.query(".container");
        const element = await browser.query(container, "/b");
        assert.strictEqual(element, null);
    });

    it("XPath SubsQuery Not Found With Global Path", async() => {
        const container = await browser.query(".container");
        const element = await browser.query(container, "//b");
        assert.strictEqual(element, null);
    });

    it("Query XPath Axis", async() => {
        const element = await browser.query('ancestor::p[contains(text(),"My first paragraph")]');
        assert(!element);
    });
});
