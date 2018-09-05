"use strict";

const Wendigo = require('../../lib/wendigo');
const assert = require('assert');
const DomElement = require('../../lib/models/dom_element');
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
    });

    it("Query Not Element Found", async() => {
        const element = await browser.query("div.not-exists");
        assert.strictEqual(element, null);
    });

    it("Query Node", async() => {
        const element = await browser.query("h1");
        const element2 = await browser.query(element);
        assert(element2);
    });

    it("Query Sub Element", async() => {
        const container = await browser.query(".container");
        const element = await browser.query(container, "p");
        assert(element);
    });

    it("Query Sub Element Not Found", async() => {
        const container = await browser.query(".container");
        const element = await browser.query(container, "b");
        assert.strictEqual(element, null);
    });

    it("Query Sub Element Not Valid Parent", async() => {
        utils.assertThrowsAsync(async() => {
            await browser.query(".container", "b");
        }, "Error: Invalid parent element for query");
    });

    it("XPath Query", async() => {
        const elements = await browser.queryXPath('//p[contains(text(),"My first paragraph")]');
        assert.strictEqual(elements.length, 1);
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
        }, "FatalError: Invalid Selector on browser.query.");
    });
});
