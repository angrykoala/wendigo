"use strict";

// const assert = require('assert');
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
        console.log((await browser.page.browser().pages()).length);
        await browser.click(".btn-popup");
        await browser.wait(100);
        console.log((await browser.page.browser().pages()).length);
        await browser.wait(100000);
    });
});
