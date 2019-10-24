"use strict";

const assert = require('assert');
const Wendigo = require('../..');
const utils = require('../test_utils');
const configUrls = require('../config.json').urls;

describe("Wait And Tap", function() {
    this.timeout(5000);
    let browser;

    before(async() => {
        browser = await Wendigo.createBrowser();
    });

    beforeEach(async() => {
        await browser.open(configUrls.waitAndTap);
    });

    after(async() => {
        await browser.close();
    });

    it("Wait For Button And Tap", async() => {
        await browser.assert.not.text(".text", "text");
        await browser.assert.not.element(".btn2");
        await browser.click(".btn");
        
        const clickedElements = await browser.waitAndTap(".btn2", 800);

        assert.strictEqual(clickedElements, 1);
        await browser.assert.text(".text", "text");
    });

    it("Wait For XPath And Tap", async() => {
        await browser.assert.not.text(".text", "text");
        await browser.assert.not.element(".btn2");
        await browser.click(".btn");

        const clickedElements = await browser.waitAndTap("//*[contains(@class,'btn2')]", 800);

        assert.strictEqual(clickedElements, 1);
        await browser.assert.text(".text", "text");
    });

    it("Wait For Button Timeout", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.waitAndTap(".btn2", 1);
        }, 'Error: [waitAndTap] TimeoutError: [waitFor] Waiting for element ".btn2", timeout of 1ms exceeded.');
    });
});
