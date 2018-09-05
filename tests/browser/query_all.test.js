"use strict";

const Wendigo = require('../../lib/wendigo');
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

    it("QueryAll Sub Element Not Valid Parent", async() => {
        utils.assertThrowsAsync(async() => {
            await browser.queryAll(".container", "b");
        }, "Error: Invalid parent element for queryAll");
    });
});
