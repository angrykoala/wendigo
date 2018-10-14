"use strict";

const Wendigo = require('../..');
const assert = require('assert');
const configUrls = require('../config.json').urls;

describe("Evaluate", function() {
    this.timeout(5000);

    let browser;
    before(async() => {
        browser = await Wendigo.createBrowser();
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
});
