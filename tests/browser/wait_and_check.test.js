"use strict";

const Wendigo = require('../../dist/main');
const utils = require('../test_utils');
const configUrls = require('../config.json').urls;

describe("Wait and Check", function() {
    this.timeout(5000);
    let browser;

    before(async() => {
        browser = await Wendigo.createBrowser();
    });

    beforeEach(async() => {
        await browser.open(configUrls.waitAndCheck);
    });

    after(async() => {
        await browser.close();
    });

    it("Wait For CheckBox and Check", async() => {
        await browser.assert.not.element(".checkbox");
        await browser.click(".btn");
        await browser.waitAndCheck(".checkbox", 800);
        await browser.assert.value(".checkbox", "on");
    });

    it("Wait For XPath And Check", async() => {
        await browser.assert.not.element(".checkbox");
        await browser.click(".btn");
        await browser.waitAndCheck("//*[contains(@class,'checkbox')]", 800);
        await browser.assert.value(".checkbox", "on");
    });

    it("Wait For CheckBox Check Timeout", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.waitAndCheck(".checkbox", 1);
        }, 'TimeoutError: [waitAndCheck] Waiting for element ".checkbox", timeout of 1ms exceeded.');
    });
});
