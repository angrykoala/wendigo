"use strict";

const Wendigo = require('../..');
const configUrls = require('../config.json').urls;
const utils = require('../test_utils');

describe("Wait Until Enabled", function() {
    this.timeout(5000);
    let browser;

    before(async() => {
        browser = await Wendigo.createBrowser();
    });

    after(async() => {
        await browser.close();
    });

    it("Wait Until Button Enabled", async() => {
        await browser.open(configUrls.forms);
        await browser.assert.disabled(".disabled-button");
        const p = browser.waitUntilEnabled(".disabled-button", 1000);
        await browser.click(".enable-button");
        await p;
        await browser.assert.enabled(".disabled-button");
        await browser.assert.text(".enabled-status", "enabled");
    });

    it("Wait Until Button Enabled Timeout", async() => {
        await browser.open(configUrls.forms);
        await utils.assertThrowsAsync(async() => {
            await browser.waitUntilEnabled(".disabled-button", 10);
        }, `TimeoutError: [waitUntilEnabled] Waiting for element ".disabled-button" to be enabled, timeout of 10ms exceeded.`);
    });

    it("Wait Until Already Enabled Button", async() => {
        await browser.open(configUrls.forms);
        await browser.assert.enabled(".enable-button");
        await browser.waitUntilEnabled(".enable-button", 20);
        await browser.assert.enabled(".enable-button");
    });

    it("Wait Until Button Enabled With DOM Selector", async() => {
        await browser.open(configUrls.forms);
        const elem = await browser.query(".disabled-button");
        const p = browser.waitUntilEnabled(elem);
        await browser.click(".enable-button");
        await p;
        await browser.assert.enabled(".disabled-button");
        await browser.assert.text(".enabled-status", "enabled");
    });
});
