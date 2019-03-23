"use strict";

const Wendigo = require('../..');
const configUrls = require('../config.json').urls;
const utils = require('../test_utils');

describe("Element Blur", function() {
    this.timeout(5000);
    let browser;

    before(async() => {
        browser = await Wendigo.createBrowser();
    });

    beforeEach(async() => {
        await browser.open(configUrls.click);
    });

    after(async() => {
        browser.close();
    });

    it("Blur Element After Click", async() => {
        await browser.click(".btn");
        await browser.assert.focus(".btn");
        await browser.blur(".btn");
        await browser.assert.not.focus(".btn");
    });

    it("Blur Element Not Found", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.blur(".not-an-element");
        }, `QueryError: [blur] Element ".not-an-element" not found.`);
    });
});
