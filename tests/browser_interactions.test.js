"use strict";

const Wendigo = require('../lib/wendigo');
const utils = require('./utils');

describe("Browser Interactions", () => {
    let browser;

    beforeEach(async () => {
        browser = await Wendigo.createBrowser();
    });

    it("Click", async() => {
        await browser.open("http://localhost:3456/click.html");
        await browser.assert.text("#switch", "On");
        await browser.click(".btn");
        await browser.assert.text("#switch", "Off");
    });

    it("Button Text", async() => {
        await browser.open("http://localhost:3456/click.html");
        await browser.assert.text(".btn", "click me");
    });

    it("Wait", async() => {
        await browser.open("http://localhost:3456/click.html");
        await browser.click(".btn2");
        await browser.assert.text("#switch", "On");
        await browser.wait(10);
        await browser.assert.text("#switch", "On");
        await browser.wait();
        await browser.wait();
        await browser.assert.text("#switch", "Off");
    });

    it("Wait For", async () => {
        await browser.open("http://localhost:3456/click.html");
        await browser.assert.not.exists("#switch.off");
        await browser.assert.exists("#switch.on");
        await browser.click(".btn2");
        await browser.waitFor("#switch.off", 600);
        await browser.assert.exists("#switch.off");
        await browser.assert.text("#switch", "Off");
        await browser.assert.not.exists("#switch.on");
    });

    it("Wait For Timeout", async() => {
        await browser.open("http://localhost:3456/click.html");
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
