"use strict";

const Wendigo = require('../lib/wendigo');
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

    it("Find By Text Containing And Click", async() => {
        await browser.open(configUrls.click);
        const elements = await browser.findByTextContaining("click");
        await browser.click(elements);
        await browser.assert.text("#switch", "Off");
        await browser.waitFor("#switch.on", 600);
    });
});
