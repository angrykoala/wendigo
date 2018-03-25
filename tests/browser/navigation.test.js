"use strict";

const Wendigo = require('../../lib/wendigo');
const configUrls = require('../config.json').urls;

describe("Navigation", function() {
    this.timeout(5000);
    let browser;

    before(async () => {
        browser = await Wendigo.createBrowser();
    });

    beforeEach(async () => {
        await browser.open(configUrls.index);
    });

    after(async () => {
        await browser.close();
    });

    it("Go Back", async () => {
        await browser.click("a");
        await browser.wait();
        await browser.assert.not.title("Index Test");
        await browser.assert.url(configUrls.simple);
        // TODO: fix page link
        // await browser.assert.text("p", "html_test");
        await browser.back();
        await browser.assert.url(configUrls.index);
        await browser.assert.title("Index Test");
    });

    it("Go Forward", async() => {
        await browser.click("a");
        await browser.wait();
        await browser.back();
        await browser.forward();
        await browser.assert.text("p", "html_test");
        await browser.assert.url(configUrls.simple);
    });

    it("Refresh", async () => {
        await browser.open(configUrls.click);
        await browser.click(".btn");
        await browser.assert.text("#switch", "Off");
        await browser.refresh();
        await browser.assert.text("#switch", "On");
    });
});
