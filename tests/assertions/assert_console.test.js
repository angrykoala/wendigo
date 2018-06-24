"use strict";

const Wendigo = require('../../lib/wendigo');
const configUrls = require('../config.json').urls;
const utils = require('../test_utils');

describe("Assert Console", function() {
    this.timeout(5000);
    let browser;

    before(async () => {
        browser = await Wendigo.createBrowser();
    });

    beforeEach(async () => {
        await browser.open(configUrls.console);
    });

    afterEach(() => {
        browser.console.clear();
    });

    after(async () => {
        await browser.close();
    });

    it("Assert Log", async () => {
        await browser.assert.console();
        await browser.assert.console({
            type: browser.console.LogType.log
        });
        await browser.assert.console({
            text: "Normal Log"
        });
        await browser.assert.console({
            text: "Normal Log",
            type: browser.console.LogType.log
        });
    });

    it("Assert Log Count", async () => {
        await browser.click(".log");
        await browser.click(".log");
        await browser.click(".error");
        await browser.assert.console();
        await browser.assert.console({
            type: browser.console.LogType.info
        }, 2);
        await browser.assert.console({
            type: browser.console.LogType.error
        }, 1);
    });

    it("Assert Log Throws", async () => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.console({
                type: browser.console.LogType.log
            }, 2);
        }, `Expected 2 console events of type "log", 1 found.`);
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.console({
                type: browser.console.LogType.error
            });
        }, `Expected console events of type "error", 0 found.`);
    });

    it("Assert Log With Text Throws", async () => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.console({
                text: "Invalid Text"
            });
        }, `Expected console events with text "Invalid Text", 0 found.`);
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.console({
                text: "Invalid Text",
                type: browser.console.LogType.log
            });
        }, `Expected console events of type "log" with text "Invalid Text", 0 found.`);
    });


    it("Assert Log With Regex", async () => {
        await browser.assert.console({
            text: /Normal/
        });
    });

    it("Assert Log With Regex Throws", async () => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.console({
                text: /NotText/
            });
        }, `Expected console events with text "/NotText/", 0 found.`);
    });

    it("Assert Log Throws Custom Message", async () => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.console({
                type: browser.console.LogType.log
            }, 2, "console fails");
        }, `console fails`);
    });
});
