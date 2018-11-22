"use strict";

const Wendigo = require('../..');
const configUrls = require('../config.json').urls;
const utils = require('../test_utils');

describe("Wait Until Not Visible", function() {
    this.timeout(5000);
    let browser;

    before(async() => {
        browser = await Wendigo.createBrowser();
    });

    after(async() => {
        await browser.close();
    });

    it("Wait Until Not Visible", async() => {
        await browser.open(configUrls.click);
        await browser.click(".btn2");
        await browser.waitUntilNotVisible("#switch.on", 600);
        await browser.assert.not.exists("#switch.on");
        await browser.assert.exists("#switch.off");
    });

    it("Wait Until Not Visible With Non Existant Element", async() => {
        await browser.open(configUrls.click);
        await browser.waitUntilNotVisible(".not-exists");
        await browser.assert.not.exists(".not-exists");
    });

    it("Wait Until Not Visible Timeout", async() => {
        await browser.open(configUrls.click);
        await browser.click(".btn2");
        await utils.assertThrowsAsync(async() => {
            await browser.waitUntilNotVisible("#switch.on", 10);
        }, `TimeoutError: Waiting for element "#switch.on" to not be visible, timeout of 10ms exceeded.`);
        await browser.assert.not.exists("#switch.off");
        await browser.assert.exists("#switch.on");
    });
});
