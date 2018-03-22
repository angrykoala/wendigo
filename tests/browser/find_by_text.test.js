"use strict";

const assert = require('assert');
const Wendigo = require('../../lib/wendigo');
const configUrls = require('../config.json').urls;

describe("FInd By Text", function() {
    this.timeout(5000);
    let browser;

    before(async () => {
        browser = await Wendigo.createBrowser();
    });

    beforeEach(async () => {
        await browser.open(configUrls.index);

    });

    after(async () => {
        await browser.close();
    });

    it("Find By Text", async () => {
        const headerElement = await browser.findByText("Main Title");
        assert.strictEqual(headerElement.length, 1);
    });
    it("Find By Text Empty", async () => {
        const headerElement = await browser.findByText("Not title");
        assert.strictEqual(headerElement.length, 0);
    });

    it("Find By Text Containing", async () => {
        const elements = await browser.findByTextContaining("paragraph");
        assert.strictEqual(elements.length, 2);
    });

    it("Find By Text Containing And Click", async () => {
        await browser.open(configUrls.click);
        const elements = await browser.findByTextContaining("click");
        await browser.click(elements);
        await browser.assert.text("#switch", "Off");
        await browser.waitFor("#switch.on", 600);
    });
});
