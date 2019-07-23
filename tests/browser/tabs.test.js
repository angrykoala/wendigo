"use strict";

const assert = require('assert');
const Wendigo = require('../..');
const configUrls = require('../config.json').urls;
const utils = require('../test_utils');

describe("Multiple Pages", function() {
    this.timeout(5000);
    let browser;

    beforeEach(async() => {
        browser = await Wendigo.createBrowser();
        await browser.open(configUrls.tabsAndPopups);
    });

    afterEach(async() => {
        await browser.close();
    });

    it("Get Browser Pages And Puppeteer Native Browser", async() => {
        const pages = await browser.pages();
        assert.strictEqual(pages.length, 1);
        assert.strictEqual(pages[0], browser.page);
        assert.ok(browser.context);
        assert.strictEqual(browser.context, browser.page.browser().defaultBrowserContext());
    });

    it("Opening Normal Link Wont Create New Tabs", async() => {
        await browser.click(".btn-link");
        await browser.waitForNavigation();
        const pagesAfter = await browser.pages();
        assert.strictEqual(pagesAfter.length, 1);
        await browser.assert.text("p", "html_test");
        await browser.assert.global("WendigoUtils");
    });

    describe("Tabs", () => {
        it("Open Tab", async() => {
            const pagesBefore = await browser.pages();
            assert.strictEqual(pagesBefore.length, 1);
            await browser.click(".btn-tab");
            await browser.wait(50);
            const pagesAfter = await browser.pages();
            assert.strictEqual(pagesAfter.length, 2);
        });

        it("Switch To Tab", async() => {
            await browser.click(".btn-tab");
            await browser.assert.not.text("p", "html_test");
            await browser.wait(50);
            await browser.selectPage(1);
            const pagesAfter = await browser.pages();
            assert.strictEqual(pagesAfter.length, 2);
            await browser.assert.text("p", "html_test");
            await browser.assert.global("WendigoUtils");
        });

        it("Close Tab", async() => {
            await browser.click(".btn-tab");
            await browser.assert.not.text("p", "html_test");
            await browser.wait(50);
            await browser.selectPage(1);
            const pagesAfter = await browser.pages();
            assert.strictEqual(pagesAfter.length, 2);
            await browser.closePage(0);
            const pagesAfterClose = await browser.pages();
            assert.strictEqual(pagesAfterClose.length, 1);
        });

        it("Close Current Tab", async() => {
            await browser.click(".btn-tab");
            await browser.assert.not.text("p", "html_test");
            await browser.wait(100);
            const pagesAfter = await browser.pages();
            assert.strictEqual(pagesAfter.length, 2);
            await browser.closePage(0);
            const pagesAfterClose = await browser.pages();
            assert.strictEqual(pagesAfterClose.length, 1);
            await browser.assert.text("p", "html_test");
        });

        it("Close Only Tab", async() => {
            const pagesAfter = await browser.pages();
            assert.strictEqual(pagesAfter.length, 1);
            await browser.closePage(0);
            const pagesAfterClose = await browser.pages();
            assert.strictEqual(pagesAfterClose.length, 0);
        });

        it("Switch To Invalid Tab", async() => {
            await utils.assertThrowsAsync(async() => {
                await browser.selectPage(10);
            }, `FatalError: [selectPage] Invalid page index "10".`);
        });

        it("Close Invalid Tab", async() => {
            await utils.assertThrowsAsync(async() => {
                await browser.closePage(10);
            }, `FatalError: [closePage] Invalid page index "10".`);
        });
    });

    describe("Popups", () => {
        it("Open Popup", async() => {
            const pagesBefore = await browser.pages();
            assert.strictEqual(pagesBefore.length, 1);
            await browser.click(".btn-popup");
            await browser.wait(50);
            const pagesAfter = await browser.pages();
            assert.strictEqual(pagesAfter.length, 2);
        });

        it("Switch To Popup", async() => {
            await browser.click(".btn-popup");
            await browser.assert.not.text("p", "html_test");
            await browser.wait(50);
            await browser.selectPage(1);
            const pagesAfter = await browser.pages();
            assert.strictEqual(pagesAfter.length, 2);
            await browser.assert.text("p", "html_test");
            await browser.assert.global("WendigoUtils");
        });

        it("Close Popup", async() => {
            await browser.click(".btn-popup");
            await browser.assert.not.text("p", "html_test");
            await browser.wait(50);
            await browser.selectPage(1);
            const pagesAfter = await browser.pages();
            assert.strictEqual(pagesAfter.length, 2);
            await browser.closePage(0);
            const pagesAfterClose = await browser.pages();
            assert.strictEqual(pagesAfterClose.length, 1);
        });
    });
});
