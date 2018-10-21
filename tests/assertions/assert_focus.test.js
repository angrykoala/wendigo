"use strict";

const Wendigo = require('../..');
const configUrls = require('../config.json').urls;
const utils = require('../test_utils');

describe("Assert Focus", function() {
    this.timeout(5000);
    let browser;

    before(async() => {
        browser = await Wendigo.createBrowser();
    });

    beforeEach(async() => {
        await browser.open(configUrls.click);
    });

    after(async() => {
        browser.close();
    });

    it("Assert Focus", async() => {
        await browser.click(".btn");
        await browser.assert.focus(".btn");
    });

    it("Assert Focus Multiple Elements", async() => {
        await browser.click(".btn");
        await browser.assert.focus("button");
    });

    it("Assert Focus Throws", async() => {
        await browser.click(".btn2");
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.focus(".btn");
        }, `Expected element ".btn" to be focused.`);
    });

    it("Assert Focus Throws Custom Message", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.focus(".btn", "focus fails");
        }, `focus fails`);
    });

    it("Assert Focus Element Not Exist", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.assert.focus(".btn10");
        }, `QueryError: Element ".btn10" not found when trying to assert focus.`);
    });

    it("Assert Not Focus", async() => {
        await browser.assert.not.focus(".btn");
    });

    it("Assert Not Focus Throws", async() => {
        await browser.click(".btn");
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.not.focus(".btn");
        }, `Expected element ".btn" to be unfocused.`);
    });

    it("Assert Not Focus Throws Multiple Elements", async() => {
        await browser.click(".btn");
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.not.focus("button");
        }, `Expected element "button" to be unfocused.`);
    });

    it("Assert Not Focus Throws Custom Message", async() => {
        await browser.click(".btn");
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.not.focus(".btn", "focus fails");
        }, `focus fails`);
    });

    it("Assert Not Focus Element Not Exist", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.assert.not.focus(".btn10");
        }, `QueryError: Element ".btn10" not found when trying to assert focus.`);
    });
});
