"use strict";

const Wendigo = require('../..');
const configUrls = require('../config.json').urls;
const utils = require('../test_utils');

describe("Assert Element Html", function() {
    this.timeout(5000);
    let browser;

    before(async() => {
        browser = await Wendigo.createBrowser();
    });

    after(async() => {
        await browser.close();
    });

    it("ElementHtml", async() => {
        await browser.open(configUrls.index);
        await browser.assert.elementHtml(".container",
            `<div class="container extra-class">
        <p>My first paragraph</p>
    </div>`);
    });

    it("ElementHtml With Node", async() => {
        await browser.open(configUrls.index);
        const node = await browser.query(".container");
        await browser.assert.elementHtml(node,
            `<div class="container extra-class">
        <p>My first paragraph</p>
    </div>`);
    });

    it("ElementHtml XPath", async() => {
        await browser.open(configUrls.index);
        await browser.assert.elementHtml("//*[contains(@class, 'container')]",
            `<div class="container extra-class">
        <p>My first paragraph</p>
    </div>`);
    });

    it("Multiple ElementHtml", async() => {
        await browser.open(configUrls.index);
        await browser.assert.elementHtml("b", '<b class="hidden-text2">Hidden text</b>');
        await browser.assert.elementHtml("b", '<b class="second-element" title="title"></b>');
    });

    it("ElementHtml With Regex", async() => {
        await browser.open(configUrls.index);
        await browser.assert.elementHtml("b", /Hidden\stext/);
    });

    it("ElementHtml Throws", async() => {
        await browser.open(configUrls.index);
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.elementHtml("b", "not-text");
        }, `[assert.elementHtml] Expected element "b" to have html "not-text".`);
    });

    it("ElementHtml Throws With Custom Message", async() => {
        await browser.open(configUrls.index);
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.elementHtml("b", "not-text", "html fails");
        }, "[assert.elementHtml] html fails");
    });

    it("ElementHtml Throws Element Not Found", async() => {
        await browser.open(configUrls.index);
        await utils.assertThrowsAsync(async() => {
            await browser.assert.elementHtml(".not-element", "some-html");
        }, `QueryError: [assert.elementHtml] Element ".not-element" not found.`);
    });

    it("ElementHtml Throws Invalid Expect", async() => {
        await browser.open(configUrls.index);
        await utils.assertThrowsAsync(async() => {
            await browser.assert.elementHtml("b");
        }, `Error: [assert.elementHtml] Missing expected html for assertion.`);
        await utils.assertThrowsAsync(async() => {
            await browser.assert.elementHtml("b", null);
        }, `Error: [assert.elementHtml] Missing expected html for assertion.`);
    });

    it("Not ElementHtml", async() => {
        await browser.open(configUrls.index);
        await browser.assert.not.elementHtml(".container", "rst paragraph");
    });

    it("Not ElementHtml With Node", async() => {
        await browser.open(configUrls.index);
        const node = await browser.query(".container");
        await browser.assert.not.elementHtml(node, "rst paragraph");
    });

    it("Not ElementHtml XPath", async() => {
        await browser.open(configUrls.index);
        await browser.assert.not.elementHtml("//*[contains(@class, 'container')]", "rst paragraph");
    });

    it("Not ElementHtml Throws", async() => {
        await browser.open(configUrls.index);
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.not.elementHtml("b", '<b class="hidden-text2">Hidden text</b>');
        }, `[assert.not.elementHtml] Expected element "b" not to have html "<b class="hidden-text2">Hidden text</b>".`);
    });

    it("Not ElementHtml Throws With Custom Message", async() => {
        await browser.open(configUrls.index);
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.not.elementHtml("b", '<b class="hidden-text2">Hidden text</b>', "not html fails");
        }, "[assert.not.elementHtml] not html fails");
    });

    it("Not ElementHtml Throws Element Not Found", async() => {
        await browser.open(configUrls.index);
        await utils.assertThrowsAsync(async() => {
            await browser.assert.not.elementHtml(".not-element", "some-html");
        }, `QueryError: [assert.not.elementHtml] Element ".not-element" not found.`);
    });

    it("Not ElementHtml Throws Invalid Expect", async() => {
        await browser.open(configUrls.index);
        await utils.assertThrowsAsync(async() => {
            await browser.assert.not.elementHtml("b");
        }, `Error: [assert.not.elementHtml] Missing expected html for assertion.`);
        await utils.assertThrowsAsync(async() => {
            await browser.assert.not.elementHtml("b", null);
        }, `Error: [assert.not.elementHtml] Missing expected html for assertion.`);
    });
});
