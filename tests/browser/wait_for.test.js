"use strict";

const Wendigo = require('../..');
const configUrls = require('../config.json').urls;
const utils = require('../test_utils');

describe("Wait For", function() {
    this.timeout(5000);
    let browser;

    before(async() => {
        browser = await Wendigo.createBrowser();
    });

    after(async() => {
        await browser.close();
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

    it("Wait For", async() => {
        await browser.open(configUrls.click);
        await browser.assert.not.exists("#switch.off");
        await browser.assert.exists("#switch.on");
        await browser.click(".btn2");
        await browser.waitFor("#switch.off", 600);
        await browser.assert.exists("#switch.off");
        await browser.assert.text("#switch", "Off");
        await browser.assert.not.exists("#switch.on");
    });

    it("Wait For XPath", async() => {
        await browser.open(configUrls.click);
        await browser.click(".btn2");
        await browser.waitFor("//*[@id='switch' and @class='off']", 600);
        await browser.assert.exists("#switch.off");
        await browser.assert.text("#switch", "Off");
        await browser.assert.not.exists("#switch.on");
    });

    it("Wait For Timeout", async() => {
        await browser.open(configUrls.click);
        await browser.assert.exists("#switch.on");
        await browser.click(".btn2");
        await utils.assertThrowsAsync(async() => {
            await browser.waitFor("#switch.off", 10);
        }, `TimeoutError: Waiting for element "#switch.off", timeout of 10ms exceeded.`);
        await browser.assert.not.exists("#switch.off");
        await browser.assert.exists("#switch.on");
        await browser.assert.text("#switch", "On");
    });

    it("Wait For With Existent Element", async() => {
        await browser.open(configUrls.click);
        await browser.assert.not.exists("#switch.off");
        await browser.assert.exists("#switch.on");
        await browser.waitFor("#switch.on");
        await browser.assert.exists("#switch.on");
    });

    it("Wait For Fails With Invisible Element", async() => {
        await browser.open(configUrls.index);
        await browser.assert.exists(".hidden-text2");
        await utils.assertThrowsAsync(async() => {
            await browser.waitFor(".hidden-text2", 10);
        });
    });

    it("Wait For With Function", async() => {
        await browser.open(configUrls.click);
        await browser.assert.not.exists("#switch.off");
        await browser.assert.exists("#switch.on");
        await browser.click(".btn2");
        await browser.waitFor((s) => {
            const docs = document.querySelectorAll(s);
            return docs.length > 0;
        }, 600, "#switch.off");
        await browser.assert.exists("#switch.off");
        await browser.assert.text("#switch", "Off");
        await browser.assert.not.exists("#switch.on");
    });

    it("Wait For With Function Timeout", async() => {
        await browser.open(configUrls.click);
        await utils.assertThrowsAsync(async() => {
            await browser.waitFor((s) => {
                const docs = document.querySelectorAll(s);
                return docs.length > 0;
            }, 10, "#switch.off");
        }, "TimeoutError: Waiting for function to return true, timeout of 10ms exceeded.");
    });

    it("Wait For Url", async() => {
        await browser.open(configUrls.index);
        await browser.click("a");
        await browser.waitForUrl(configUrls.simple);
        await browser.assert.not.title("Index Test");
        await browser.assert.url(configUrls.simple);
    });

    it("Wait For Url Throws", async() => {
        await browser.open(configUrls.index);
        await browser.click("a");
        await utils.assertThrowsAsync(async() => {
            await browser.waitForUrl(configUrls.click, 10);
        }, `TimeoutError: Waiting for url "${configUrls.click}", timeout of 10ms exceeded.`);
    });
});
