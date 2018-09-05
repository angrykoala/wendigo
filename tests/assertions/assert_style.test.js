"use strict";

const assert = require('assert');
const Wendigo = require('../../lib/wendigo');
const utils = require('../test_utils');
const configUrls = require('../config.json').urls;

describe("Assert Style", function() {
    this.timeout(5000);
    let browser;

    before(async() => {
        browser = await Wendigo.createBrowser();
        await browser.open(configUrls.index);
    });

    after(async() => {
        await browser.close();
    });

    it("Style", async() => {
        await browser.assert.style("h1", "color", "rgb(255, 0, 0)");
        await browser.assert.style("p", "color", "rgb(0, 0, 0)");
    });

    it("Style Multiple Elements", async() => {
        await browser.assert.style("b", "visibility", "hidden");
    });

    it("Style From Node", async() => {
        const node = await browser.query("h1");
        await browser.assert.style(node, "color", "rgb(255, 0, 0)");
    });

    it("Style Throws", async() => {
        assert(browser.assert.style);
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.style("h1", "color", "rgb(0, 0, 0)");
        }, `Expected element "h1" to have style "color" with value "rgb(0, 0, 0)", "rgb(255, 0, 0)" found.`);
    });
    it("Style Not Found Throws", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.style("h1", "not-style", "0");
        }, `Expected element "h1" to have style "not-style" with value "0", style not found.`);
    });
    it("Style Element Not Found", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.assert.style(".not-element", "color", "rgb(0, 0, 0)");
        }, `QueryError: Element ".not-element" not found when trying to assert style.`);
    });
    it("Style Throws Custom Message", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.style("h1", "color", "rgb(0, 0, 0)", "style fails");
        }, `style fails`);
    });

    it("Not Style", async() => {
        await browser.assert.not.style("h1", "color", "rgb(0, 0, 0)");
        await browser.assert.not.style("p", "color", "not-color");
    });

    it("Not Style Multiple Elements", async() => {
        await browser.assert.not.style("b", "visibility", "visible");
    });

    it("Not Style From Node", async() => {
        const node = await browser.query("h1");
        await browser.assert.not.style(node, "color", "rgb(0, 0, 0)");
    });
    it("Not Style Throws", async() => {
        assert(browser.assert.not.style);
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.not.style("h1", "color", "rgb(255, 0, 0)");
        }, `Expected element "h1" not to have style "color" with value "rgb(255, 0, 0)".`);
    });

    it("Not Style Element Not Found", async() => {
        assert(browser.assert.not.style);
        await utils.assertThrowsAsync(async() => {
            await browser.assert.not.style(".not-element", "color", "rgb(0, 0, 0)");
        }, `QueryError: Element ".not-element" not found when trying to assert style.`);
    });

    it("Not Style Throws Custom Message", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.not.style("h1", "color", "rgb(255, 0, 0)", "not style fails");
        }, `not style fails`);
    });
});
