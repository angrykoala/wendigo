"use strict";

const assert = require('assert');
const Wendigo = require('../..');
const configUrls = require('../config.json').urls;
const utils = require('../test_utils');

describe("Element Html", function() {
    this.timeout(5000);
    let browser;

    before(async() => {
        browser = await Wendigo.createBrowser();
    });

    after(async() => {
        await browser.close();
    });

    it("Element Html", async() => {
        await browser.open(configUrls.index);
        const elementHtml = await browser.elementHtml(".container");
        assert.strictEqual(elementHtml.length, 1);
        assert.strictEqual(elementHtml[0],
            `<div class="container extra-class">
        <p>My first paragraph</p>
    </div>`);
    });

    it("Element Html Multiple Elements", async() => {
        await browser.open(configUrls.index);
        const elementHtml = await browser.elementHtml("b");
        assert.strictEqual(elementHtml.length, 2);
        assert.strictEqual(elementHtml[0], '<b class="hidden-text2">Hidden text</b>');
        assert.strictEqual(elementHtml[1], '<b class="second-element" title="title"></b>');
    });

    it("ElementHtml Fails Before Loading", async() => {
        const browser2 = await Wendigo.createBrowser();
        await utils.assertThrowsAsync(async() => {
            await browser2.elementHtml("b");
        }, `FatalError: [elementHtml] Cannot perform action before opening a page.`);
    });
});
