"use strict";

const Wendigo = require('../../lib/wendigo');
const assert = require('assert');
const configUrls = require('../config.json').urls;
const utils = require('../utils');

describe("Browser Class", function() {
    this.timeout(5000);

    let browser;
    before(async () => {
        browser = await Wendigo.createBrowser();
    });

    beforeEach(async () => {
        await browser.open(configUrls.index);
    });

    after(async () => {
        await browser.close();
    });

    it("Class", async () => {
        const elements = await browser.class('div');
        assert.strictEqual(elements.length, 2);
        assert.strictEqual(elements[0], "container");
        assert.strictEqual(elements[1], "extra-class");
    });

    it("Class With Multiple Elements", async () => {
        const elements = await browser.class('b');
        assert.strictEqual(elements.length, 1);
        assert.strictEqual(elements[0], "hidden-text2");
    });

    it("Class Element Doesn't Exists", async () => {
        await utils.assertThrowsAsync (async () => {
            await browser.class('div.not-exists');
        }, `Error: Selector "div.not-exists" doesn't match any elements.`);
    });

    it("Class From Node", async () => {
        const node = await browser.query('div');
        const classes = await browser.class(node);
        assert.strictEqual(classes.length, 2);
        assert.strictEqual(classes[0], "container");
        assert.strictEqual(classes[1], "extra-class");
    });

    it("Class From Xpath", async () => {
        const elements = await browser.class('//div');
        assert.strictEqual(elements.length, 2);
        assert.strictEqual(elements[0], "container");
        assert.strictEqual(elements[1], "extra-class");
    });
});
