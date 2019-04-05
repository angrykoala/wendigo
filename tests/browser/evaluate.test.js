"use strict";

const Wendigo = require('../..');
const DomElement = require('../../dist/lib/models/dom_element');
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

    // Tests #392
    it.skip("Evaluate With Regexp Argument", async() => {
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

    it.skip("Evaluate Returning RegExp Element", async() => {
        const result = await browser.evaluate(() => {
            return /aba/g;
        });
        assert.ok(result instanceof RegExp);
        assert.strictEqual(result.source, "aba");
        assert.strictEqual(result.flags, "g");
    });

    it("Evaluate Returns String", async() => {
        const result = await browser.evaluate(() => {
            return "Test";
        });
        assert.strictEqual(result, "Test");
    });

    it("Evaluate Returns Number", async() => {
        const result = await browser.evaluate(() => {
            return 5;
        });
        assert.strictEqual(result, 5);
    });

    it("Evaluate Returns Object", async() => {
        const result = await browser.evaluate(() => {
            return {
                name: "arthur",
                surname: "dent"
            };
        });
        assert.strictEqual(result.name, "arthur");
        assert.strictEqual(result.surname, "dent");
    });

    it("Evaluate Returns Array", async() => {
        const result = await browser.evaluate(() => {
            return [1, "b", {
                name: "arthur"
            }];
        });
        assert.strictEqual(result.length, 3);
        assert.strictEqual(result[0], 1);
        assert.strictEqual(result[1], "b");
        assert.strictEqual(result[2].name, "arthur");
    });

    // Tests #286
    it("Evaluate Returning DOM Element", async() => {
        const result = await browser.evaluate(() => {
            return document.querySelector("h1");
        });
        assert.ok(result instanceof DomElement);
        await browser.assert.text(result, "Main Title");
    });
});
