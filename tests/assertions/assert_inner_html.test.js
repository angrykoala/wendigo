"use strict";

const Wendigo = require('../../lib/wendigo');
const configUrls = require('../config.json').urls;
const utils = require('../utils');

describe("Assert Inner Html", function() {
    this.timeout(5000);
    let browser;

    before(async () => {
        browser = await Wendigo.createBrowser();
    });

    after(async () => {
        await browser.close();
    });

    it("InnerHtml", async () => {
        await browser.open(configUrls.index);
        await browser.assert.innerHtml(".container", "\n        <p>My first paragraph</p>\n    ");
    });

    it("InnerHtml With Node", async () => {
        await browser.open(configUrls.index);
        const node = await browser.query(".container");
        await browser.assert.innerHtml(node, "\n        <p>My first paragraph</p>\n    ");
    });

    it("InnerHtml XPath", async () => {
        await browser.open(configUrls.index);
        await browser.assert.innerHtml("//*[contains(@class, 'container')]", "\n        <p>My first paragraph</p>\n    ");
    });

    it("Multiple InnerHtml", async () => {
        await browser.open(configUrls.index);
        await browser.assert.innerHtml("b", "Hidden text");
        await browser.assert.innerHtml("b", "");
    });

    it("InnerHtml With Regex", async () => {
        await browser.open(configUrls.index);
        await browser.assert.innerHtml("b", /Hidden\stext/);
    });

    it("InnerHtml Throws", async () => {
        await browser.open(configUrls.index);
        await utils.assertThrowsAssertionAsync (async () => {
            await browser.assert.innerHtml("b", "not-text");
        }, `Expected element "b" to have inner html "not-text", "Hidden text " found.`, "Hidden text,", "not-text");
    });

    it("InnerHtml Throws With Custom Message", async () => {
        await browser.open(configUrls.index);
        await utils.assertThrowsAssertionAsync (async () => {
            await browser.assert.innerHtml("b", "not-text", "html fails");
        }, "html fails", "Hidden text,", "not-text");
    });

    it("InnerHtml Throws Element Not Found", async () => {
        await browser.open(configUrls.index);
        await utils.assertThrowsAsync (async () => {
            await browser.assert.innerHtml(".not-element", "some-html");
        }, `QueryError: Element ".not-element" not found.`);
    });

    it("InnerHtml Throws Invalid Expect", async () => {
        await browser.open(configUrls.index);
        await utils.assertThrowsAsync (async () => {
            await browser.assert.innerHtml("b");
        }, `Error: Missing expected html for assertion.`);
        await utils.assertThrowsAsync (async () => {
            await browser.assert.innerHtml("b", null);
        }, `Error: Missing expected html for assertion.`);
    });

    it("Not InnerHtml", async () => {
        await browser.open(configUrls.index);
        await browser.assert.not.innerHtml(".container", "rst paragraph");
    });

    it("Not InnerHtml With Node", async () => {
        await browser.open(configUrls.index);
        const node = await browser.query(".container");
        await browser.assert.not.innerHtml(node, "rst paragraph");
    });

    it("Not InnerHtml XPath", async () => {
        await browser.open(configUrls.index);
        await browser.assert.not.innerHtml("//*[contains(@class, 'container')]", "rst paragraph");
    });

    it("Not InnerHtml Throws", async () => {
        await browser.open(configUrls.index);
        await utils.assertThrowsAssertionAsync (async () => {
            await browser.assert.not.innerHtml("b", "Hidden text");
        }, `Expected element "b" not to have inner html "Hidden text".`);
    });

    it("Not InnerHtml Throws With Custom Message", async () => {
        await browser.open(configUrls.index);
        await utils.assertThrowsAssertionAsync (async () => {
            await browser.assert.not.innerHtml("b", "Hidden text", "not html fails");
        }, "not html fails");
    });

    it("Not InnerHtml Throws Element Not Found", async () => {
        await browser.open(configUrls.index);
        await utils.assertThrowsAsync (async () => {
            await browser.assert.not.innerHtml(".not-element", "some-html");
        }, `QueryError: Element ".not-element" not found.`);
    });

    it("Not InnerHtml Throws Invalid Expect", async () => {
        await browser.open(configUrls.index);
        await utils.assertThrowsAsync (async () => {
            await browser.assert.not.innerHtml("b");
        }, `Error: Missing expected html for assertion.`);
        await utils.assertThrowsAsync (async () => {
            await browser.assert.not.innerHtml("b", null);
        }, `Error: Missing expected html for assertion.`);
    });
});
