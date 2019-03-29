"use strict";

const Wendigo = require('../..');
const assert = require('assert');
const configUrls = require('../config.json').urls;

describe("Evaluate", function() {
    this.timeout(5000);

    let browser;
    before(async() => {
        browser = await Wendigo.createBrowser({log: true});
    });

    beforeEach(async() => {
        await browser.open(configUrls.index);
    });

    after(async() => {
        await browser.close();
    });

    it("Evaluate", async() => {
        const selector = "h1";
        const elementText = await browser.evaluate((s) => {
            return document.querySelector(s).textContent;
        }, selector);
        assert.strictEqual(elementText, "Main Title");
    });

    it("Evaluate With DOMElement Argument", async() => {
        const element = await browser.query("h1");
        const elementText = await browser.evaluate((elem) => {
            return elem.textContent;
        }, element);
        assert.strictEqual(elementText, "Main Title");
    });

    it.skip("Evaluate With Regexp Argument", async() => { // Not yet supported
        const regex = /a.a/;
        const match = await browser.evaluate((r) => {
            r.test("aba");
        }, regex);
        assert.strictEqual(match, true);
        const match2 = await browser.evaluate((r) => {
            r.test("bba");
        }, regex);
        assert.strictEqual(match2, false);
    });
});
