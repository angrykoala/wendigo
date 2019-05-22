"use strict";

const Wendigo = require('../..');
const configUrls = require('../config.json').urls;
const utils = require('../test_utils');

describe("Edit Class", function() {
    this.timeout(5000);

    let browser;
    before(async() => {
        browser = await Wendigo.createBrowser();
    });

    beforeEach(async() => {
        await browser.open(configUrls.index);
    });

    after(async() => {
        await browser.close();
    });

    it("Add Class", async() => {
        await browser.assert.class(".container", "extra-class");
        await browser.assert.not.class(".container", "new-class");
        await browser.addClass(".container", "new-class");
        await browser.assert.class(".container", "extra-class");
        await browser.assert.class(".container", "new-class");
    });

    it("Add Repeated Class", async() => {
        await browser.assert.class(".container", "extra-class");
        await browser.assert.not.class(".container", "new-class");
        await browser.addClass(".container", "extra-class");
        await browser.assert.class(".container", "extra-class");
        await browser.assert.not.class(".container", "new-class");
    });

    it("Add Class DOMElement", async() => {
        const element = await browser.query(".container");
        await browser.assert.class(".container", "extra-class");
        await browser.assert.not.class(".container", "new-class");
        await browser.addClass(element, "new-class");
        await browser.assert.class(".container", "extra-class");
        await browser.assert.class(".container", "new-class");
    });

    it("Add Class XPath", async() => {
        await browser.assert.class(".container", "extra-class");
        await browser.assert.not.class(".container", "new-class");
        await browser.addClass("//*[contains(@class, 'container')]", "new-class");
        await browser.assert.class(".container", "extra-class");
        await browser.assert.class(".container", "new-class");
    });

    it("Add Class Invalid Element", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.addClass(".not-an-element", "extra-class");
        }, `QueryError: [addClass] Element ".not-an-element" not found.`);
    });

    it("Remove Class", async() => {
        await browser.assert.class(".container", "extra-class");
        await browser.removeClass(".container", "extra-class");
        await browser.assert.not.class(".container", "extra-class");
    });

    it("Remove Non Existing Class", async() => {
        await browser.assert.not.class(".container", "new-class");
        await browser.removeClass(".container", "new-class");
        await browser.assert.not.class(".container", "new-class");
    });

    it("Remove Class DOMElement", async() => {
        const element = await browser.query(".container");
        await browser.assert.class(".container", "extra-class");
        await browser.removeClass(element, "extra-class");
        await browser.assert.not.class(".container", "extra-class");
    });

    it("Remove Class XPath", async() => {
        await browser.assert.class(".container", "extra-class");
        await browser.removeClass("//*[contains(@class, 'container')]", "extra-class");
        await browser.assert.not.class(".container", "extra-class");
    });

    it("Remove Class Invalid Element", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.removeClass(".not-an-element", "extra-class");
        }, `QueryError: [removeClass] Selector ".not-an-element" doesn't match any elements.`);
    });
});
