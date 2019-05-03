"use strict";

const Wendigo = require('../..');
const configUrls = require('../config.json').urls;
const utils = require('../test_utils');

describe("Focus", function() {
    this.timeout(5000);
    let browser;

    before(async() => {
        browser = await Wendigo.createBrowser();
    });

    beforeEach(async() => {
        await browser.open(configUrls.click);
    });

    after(async() => {
        await browser.close();
    });

    it("Focus", async() => {
        await browser.assert.not.focus(".btn2");
        await browser.focus(".btn2");
        await browser.assert.focus(".btn2");
    });

    it("Focus Not Existing Element", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.focus(".btn10");
        }, `QueryError: [focus] Element ".btn10" not found.`);
    });

    it("Focus DomElement Selector", async() => {
        const element = await browser.query(".btn2");
        await browser.assert.not.focus(".btn2");
        await browser.focus(element);
        await browser.assert.focus(".btn2");
    });

    it("Focus DomElement", async() => {
        const element = await browser.query(".btn2");
        await browser.assert.not.focus(".btn2");
        await element.focus();
        await browser.assert.focus(".btn2");
    });

    it("Focus XPath", async() => {
        await browser.assert.not.focus(".btn2");
        await browser.focus("//*[contains(@class,'btn2')]");
        await browser.assert.focus(".btn2");
    });

    it("Focus Non Existing XPath", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.focus("//*[contains(@class,'btn10')]");
        }, `QueryError: [focus] Element "//*[contains(@class,'btn10')]" not found.`);
    });
});
