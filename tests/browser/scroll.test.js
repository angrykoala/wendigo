"use strict";

const Wendigo = require('../../lib/wendigo');
const assert = require('assert');
const configUrls = require('../config.json').urls;
const utils = require('../test_utils');


describe("Scroll", function() {
    this.timeout(5000);

    let browser;
    function getScrollValue() {
        return browser.evaluate(() => {
            return [window.scrollY, window.scrollX];
        });
    }

    before(async() => {
        browser = await Wendigo.createBrowser();
    });

    beforeEach(async() => {
        await browser.open(configUrls.scroll);
    });

    after(async() => {
        await browser.close();
    });

    it("Scroll By Pixels", async() => {
        await browser.scroll(80);
        const value = await getScrollValue();
        assert.strictEqual(value[0], 80);
        assert.strictEqual(value[1], 0);
    });

    it("Scroll By Too Many Pixels", async() => {
        await browser.scroll(2000);
        const value = await getScrollValue();
        assert(value[0] > 80);
        assert(value[0] < 1800);
    });

    it("Scroll By Y and X", async() => {
        await browser.scroll(80, 80);
        const value = await getScrollValue();
        assert.strictEqual(value[0], 80);
        assert.strictEqual(value[0], 80);
    });

    it("Scroll By Selector", async() => {
        await browser.scroll("p");
        const value = await getScrollValue();
        assert(value[0] > 10);
        assert(value[1] > 10);
    });

    it("Scroll By Dom Element", async() => {
        const element = await browser.query("p");
        await browser.scroll(element);
        const value = await getScrollValue();
        assert(value[0] > 10);
    });

    it("Scroll By Invalid Dom Element", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.scroll(".not-exists");
        }, `QueryError: Selector ".not-exists" doesn't match any element to scroll.`);
    });
});
