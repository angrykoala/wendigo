"use strict";

const Wendigo = require('../../lib/wendigo');
const configUrls = require('../config.json').urls;
const utils = require('../utils');

describe("Wait For", function() {
    this.timeout(5000);
    let browser;

    before(async () => {
        browser = await Wendigo.createBrowser();
    });

    after(async() => {
        await browser.close();
    });

    it("Wait For", async () => {
        await browser.open(configUrls.click);
        await browser.assert.not.exists("#switch.off");
        await browser.assert.exists("#switch.on");
        await browser.click(".btn2");
        await browser.waitFor("#switch.off", 600);
        await browser.assert.exists("#switch.off");
        await browser.assert.text("#switch", "Off");
        await browser.assert.not.exists("#switch.on");
    });

    it("Wait For Timeout", async() => {
        await browser.open(configUrls.click);
        await browser.assert.exists("#switch.on");
        await browser.click(".btn2");
        await utils.assertThrowsAsync(async () => {
            await browser.waitFor("#switch.off", 10);
        }, `Error: Waiting for element "#switch.off" failed, timeout of 10ms exceeded`);
        await browser.assert.not.exists("#switch.off");
        await browser.assert.exists("#switch.on");
        await browser.assert.text("#switch", "On");
    });

    it("Wait For With Existent Element", async () => {
        await browser.open(configUrls.click);
        await browser.assert.not.exists("#switch.off");
        await browser.assert.exists("#switch.on");
        await browser.waitFor("#switch.on");
        await browser.assert.exists("#switch.on");
    });

    it("Wait For Fails With Invisible Element", async() => {
        await browser.open(configUrls.index);
        await browser.assert.exists(".hidden-text2");
        await utils.assertThrowsAsync(async () => {
            await browser.waitFor(".hidden-text2", 10);
        });
    });
});
