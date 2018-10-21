
"use strict";

const Wendigo = require('../..');
const configUrls = require('../config.json').urls;
const utils = require('../test_utils');

describe("Wait For Navigation", function() {
    this.timeout(5000);
    let browser;

    before(async() => {
        browser = await Wendigo.createBrowser();
    });

    after(async() => {
        await browser.close();
    });

    it("Wait For Navigation", async() => {
        await browser.open(configUrls.index);
        await browser.click("a");
        await browser.waitForNavigation();
        await browser.assert.not.title("Index Test");
        await browser.assert.url(configUrls.simple);
    });

    it("Wait For Navigation Timeout", async() => {
        await browser.open(configUrls.index);
        await utils.assertThrowsAsync(async() => {
            await browser.waitForNavigation(1);
        }, "TimeoutError: Wait for navigation, timeout of 1ms exceeded.");
    });
});
