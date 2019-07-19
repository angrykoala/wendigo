"use strict";

const assert = require('assert');
const Wendigo = require('../..');
// const utils = require('../test_utils');
const configUrls = require('../config.json').urls;

describe.only("Tabs", function() {
    this.timeout(5000000);
    let browser;

    before(async() => {
        browser = await Wendigo.createBrowser({headless: false});
    });

    beforeEach(async() => {
        await browser.open(configUrls.tabsAndPopups);
    });

    after(async() => {
        await browser.close();
    });

    // TODO: check tabs interface with tabs and popups
    // Check tabs have wendigoUtils
    it("Open Tab", async() => {
        const pagesBefore = await browser.pages();
        assert.strictEqual(pagesBefore.length, 1);
        await browser.click(".btn-tab");
        await browser.wait(10);
        const pagesAfter = await browser.pages();
        assert.strictEqual(pagesAfter.length, 2);
    });

    it("Get Browser Pages And Puppeteer Native Browser");
    it("Open Popup");
    it("Switch To Tab"); // Also check wendigo utils is ready
    it("Close Browser Should Close All Tabs");
    it("Close Tab");
});
