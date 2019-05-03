"use strict";

const Wendigo = require('../..');
const assert = require('assert');
// const DomElement = require('../../dist/lib/models/dom_element').default;
const configUrls = require('../config.json').urls;
// const utils = require('../test_utils');

describe("Dom Element", function() {
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

    it("XPath Query Ancestor", async() => {
        const element = await browser.query(".container p");
        assert.ok(element);
        const ancestor = await element.query("ancestor::div");
        assert.ok(ancestor);
        await browser.assert.class(ancestor, "extra-class");
    });

    it("XPath Query Ancestor Does Not Exists", async() => {
        const element = await browser.query(".container p");
        assert.ok(element);
        const ancestor = await element.query("ancestor::p");
        assert(!ancestor);
    });
});
