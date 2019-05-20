"use strict";

const assert = require('assert');
const Wendigo = require('../..');
const utils = require('../test_utils');
const configUrls = require('../config.json').urls;

describe("Wait And Click", function() {
    this.timeout(5000);
    let browser;

    before(async() => {
        browser = await Wendigo.createBrowser();
    });

    beforeEach(async() => {
        await browser.open(configUrls.waitAndClick);
    });

    after(async() => {
        await browser.close();
    });

    it("Wait For Button And Click", async() => {
        await browser.assert.not.text(".text", "text");
        await browser.assert.not.element(".btn2");
        await browser.click(".btn");
        const clickedElements = await browser.waitAndClick(".btn2", 800);
        assert.strictEqual(clickedElements, 1);
        await browser.assert.text(".text", "text");
    });

    it("Wait For XPath And Click", async() => {
        await browser.assert.not.text(".text", "text");
        await browser.assert.not.element(".btn2");
        await browser.click(".btn");
        const clickedElements = await browser.waitAndClick("//*[contains(@class,'btn2')]", 800);
        assert.strictEqual(clickedElements, 1);
        await browser.assert.text(".text", "text");
    });

    it("Wait For Button Timeout", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.waitAndClick(".btn2", 1);
        }, "TimeoutError: [waitAndClick] Timeout of 1ms exceeded.");
    });
});
