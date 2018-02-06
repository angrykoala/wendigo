"use strict";

const Wendigo = require('../lib/wendigo');
const utils = require('./utils');
const configUrls = require('./config.json').urls;

describe("Browser Interactions", function() {
    this.timeout(5000);
    let browser;

    before(async () => {
        browser = await Wendigo.createBrowser();
    });

    after(async() => {
        await browser.close();
    });

    it("Click", async() => {
        await browser.open(configUrls.click);
        await browser.assert.text("#switch", "On");
        await browser.click(".btn");
        await browser.assert.text("#switch", "Off");
    });

    it("Click Multiple Elements", async() => {
        await browser.open(configUrls.click);
        await browser.assert.text("#switch", "On");
        await browser.click("button");
        await browser.assert.text("#switch", "Off");
        await browser.waitFor("#switch.on", 600);
    });

    it("Click With Index", async() => {
        await browser.open(configUrls.click);
        await browser.assert.text("#switch", "On");
        await browser.click("button", 1);
        await browser.assert.text("#switch", "On");
        await browser.waitFor("#switch.off", 600);
    });

    it("Click With Invalid Index", async() => {
        await browser.open(configUrls.click);
        await browser.assert.text("#switch", "On");
        await utils.assertThrowsAsync(async () => {
            await browser.click("button", 10);
        }); // TODO: check text
        await browser.assert.text("#switch", "On");
    });

    it("Button Text", async() => {
        await browser.open(configUrls.click);
        await browser.assert.text(".btn", "click me");
    });

    it("Wait", async() => {
        await browser.open(configUrls.click);
        await browser.click(".btn2");
        await browser.assert.text("#switch", "On");
        await browser.wait(10);
        await browser.assert.text("#switch", "On");
        await browser.wait();
        await browser.wait();
        await browser.assert.text("#switch", "Off");
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
        });
        await browser.assert.not.exists("#switch.off");
        await browser.assert.exists("#switch.on");
        await browser.assert.text("#switch", "On");
    });
});
