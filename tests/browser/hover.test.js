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
        }, `QueryError: Element ".btn10" not found when trying to hover.`);
    });
});
