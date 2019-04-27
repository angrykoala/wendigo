"use strict";

const Wendigo = require('../..');
const configUrls = require('../config.json').urls;
const utils = require('../test_utils');

describe("Hover", function() {
    this.timeout(5000);
    let browser;

    before(async() => {
        browser = await Wendigo.createBrowser();
    });

    beforeEach(async() => {
        await browser.open(configUrls.hover);
    });

    after(async() => {
        await browser.close();
    });

    it("Hover", async() => {
        await browser.assert.text("#hover", "not hover");
        await browser.hover(".hover-me");
        await browser.assert.text("#hover", "hover");
    });

    it("Hover Not Existing Element", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.hover(".btn10");
        }, `QueryError: [hover] Element ".btn10" not found.`);
    });

    it("Hover DomElement Selector", async() => {
        const element = await browser.query(".hover-me");
        await browser.assert.text("#hover", "not hover");
        await browser.hover(element);
        await browser.assert.text("#hover", "hover");
    });

    it("Hover DomElement", async() => {
        const element = await browser.query(".hover-me");
        await browser.assert.text("#hover", "not hover");
        await element.hover();
        await browser.assert.text("#hover", "hover");
    });

    it("Hover XPath", async() => {
        await browser.assert.text("#hover", "not hover");
        await browser.hover("//*[contains(@class,'hover-me')]");
        await browser.assert.text("#hover", "hover");
    });

    it("Hover XPath Not Existing Element", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.hover("//*[contains(@class,'not-hover')]");
        }, `QueryError: [hover] Element "//*[contains(@class,'not-hover')]" not found.`);
    });
});
