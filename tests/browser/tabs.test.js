"use strict";

const assert = require('assert');
const Wendigo = require('../..');
const configUrls = require('../config.json').urls;
const utils = require('../test_utils');

describe("Tabs", function() {
    this.timeout(5000000);
    let browser;

    beforeEach(async() => {
        browser = await Wendigo.createBrowser();
        await browser.open(configUrls.tabsAndPopups);
    });

    afterEach(async() => {
        await browser.close();
    });

    // TODO: check tabs interface with tabs and popups
    it("Open Tab", async() => {
        const pagesBefore = await browser.pages();
        assert.strictEqual(pagesBefore.length, 1);
        await browser.click(".btn-tab");
        await browser.wait(50);
        const pagesAfter = await browser.pages();
        assert.strictEqual(pagesAfter.length, 2);
    });

    it("Get Browser Pages And Puppeteer Native Browser", async() => {
        const pages = await browser.pages();
        assert.strictEqual(pages.length, 1);
        assert.strictEqual(pages[0], browser.page);
        assert.ok(browser.context);
        assert.strictEqual(browser.context, browser.page.browser().defaultBrowserContext());
    });

    it("Open Popup", async() => {
        const pagesBefore = await browser.pages();
        assert.strictEqual(pagesBefore.length, 1);
        await browser.click(".btn-popup");
        await browser.wait(10);
        const pagesAfter = await browser.pages();
        assert.strictEqual(pagesAfter.length, 2);
    });

    it.skip("Switch To Tab", async() => {
        await browser.click(".btn-tab");
        await browser.assert.not.text("p", "html_test");
        await browser.wait(10);
        console.log("Select page");
        await browser.selectPage(1);
        const pagesAfter = await browser.pages();
        assert.strictEqual(pagesAfter.length, 2);
        await browser.assert.text("p", "html_test");
        await browser.assert.global("WendigoUtils");
    });

    it.skip("Close Browser Should Close All Tabs", async() => {
        const pagesBefore = await browser.pages();
        assert.strictEqual(pagesBefore.length, 1);
        await browser.click(".btn-tab");
        await browser.click(".btn-tab");
        await browser.click(".btn-tab");
        await browser.wait(10);
        const pagesAfter = await browser.pages();
        assert.strictEqual(pagesAfter.length, 4);
        await browser.close();
        const pagesAfterClose = await browser.pages();
        assert.strictEqual(pagesAfterClose.length, 0);
    });

    it.skip("Close Tab", async() => {
        await browser.click(".btn-tab");
        await browser.assert.not.text("p", "html_test");
        await browser.wait(10);
        await browser.selectPage(1);
        const pagesAfter = await browser.pages();
        assert.strictEqual(pagesAfter.length, 2);
        await browser.closePage(0);
        const pagesAfterClose = await browser.pages();
        assert.strictEqual(pagesAfterClose.length, 1);
    });

    it("Close Current Tab");

    it("Switch To Invalid Tab", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.selectPage(10);
        }, `FatalError: [selectPage] Invalid page index "10".`);
    });
});
