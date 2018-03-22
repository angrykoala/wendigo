"use strict";

const assert = require('assert');
const Wendigo = require('../../lib/wendigo');
const utils = require('../utils');
const configUrls = require('../config.json').urls;

describe("Assert Href", function() {
    this.timeout(5000);
    let browser;

    before(async () => {
        browser = await Wendigo.createBrowser();
        await browser.open(configUrls.index);
    });

    after(async () => {
        await browser.close();
    });

    it("Href", async () => {
        await browser.assert.href("a", "html_simple.html");
    });
    it("Href From Node", async () => {
        const node = await browser.query("a");
        await browser.assert.href(node, "html_simple.html");
    });

    it("Href Throws", async () => {
        assert(browser.assert.href);
        await utils.assertThrowsAssertionAsync (async () => {
            await browser.assert.href("a", "bad-link");
        }, `Expected element "a" to have attribute "href" with value "bad-link", "html_simple.html" found.`);
    });

    it("Href With Custom Message", async () => {
        assert(browser.assert.href);
        await utils.assertThrowsAssertionAsync (async () => {
            await browser.assert.href("a", "bad-link", "href fails");
        }, `href fails`);
    });

    it("Href On Css Link", async () => {
        await browser.assert.href("link", "styles.css");
    });

    it("Not Href", async () => {
        await browser.assert.not.href("a", "not-a-link.html");
    });
    it("Not Href From Node", async () => {
        const node = await browser.query("a");
        await browser.assert.not.href(node, "not-a-link.html");
    });
    it("Not Href Throws", async () => {
        assert(browser.assert.not.href);
        await utils.assertThrowsAssertionAsync (async () => {
            await browser.assert.not.href("a", "html_simple.html");
        }, `Expected element "a" not to have attribute "href" with value "html_simple.html".`);
    });
    it("Not Href With Custom Message", async () => {
        assert(browser.assert.not.href);
        await utils.assertThrowsAssertionAsync (async () => {
            await browser.assert.not.href("a", "html_simple.html", "not href fails");
        }, `not href fails`);
    });
});
