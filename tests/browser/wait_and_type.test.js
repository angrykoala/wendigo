"use strict";

const assert = require('assert');
const Wendigo = require('../..');
const utils = require('../test_utils');
const configUrls = require('../config.json').urls;

describe("Wait and Type", function() {
    this.timeout(5000);
    let browser

    before(async() => {
        browser = await Wendigo.createBrowser();
    });

    beforeEach(async() => {
        await browser.open(configUrls.waitAndType);
    });

    after(async() => {
        await browser.close();
    });

    it("Wait For Text Input And Type", async() => {
        await browser.assert.not.element(".input")
        await browser.click(".btn");
        
        await browser.waitAndType(".input","text", 800);
        
        await browser.assert.value(".input", "text");
    });

    it("Wait For XPath And Type", async() => {
        await browser.assert.not.element(".input");
        await browser.click(".btn");

        await browser.waitAndType("//*[contains(@class,'input')]","text", 800);
        
        await browser.assert.value(".input", "text");
        
    });

    it("Wait For text input Timeout", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.waitAndType(".input","test", 1);
        }, "TimeoutError: [waitAndType] Timeout of 1ms exceeded.");
    });
});
