"use strict";

const Wendigo = require('../..');
const assert = require('assert');
// const DomElement = require('../../lib/models/dom_element');
const configUrls = require('../config.json').urls;
// const utils = require('../test_utils');

describe.only("Path Finder", function() {
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

    it("Find cssPath", async() => {
        const element = await browser.query(".hidden-text");
        const path = await browser.findCssPath(element);
        assert.strictEqual(path, 'body > i');
    });
    it("Find xPathPath", async() => {
        const element = await browser.query(".hidden-text");
        const path = await browser.findXPath(element);
        assert.strictEqual(path, '/html/body/i');
    });
});
