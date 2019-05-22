"use strict";

const Wendigo = require('../..');
const configUrls = require('../config.json').urls;
const utils = require('../test_utils');

describe("Set Attribute", function() {
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

    it("Set Attribute", async() => {
        await browser.assert.attribute(".second-element", "title", "title");
        await browser.setAttribute(".second-element", "title", "title2");
        await browser.assert.attribute(".second-element", "title", "title2");
    });

    it("Set Attribute DOMElement", async() => {
        const element = await browser.query(".second-element");
        await browser.assert.attribute(".second-element", "title", "title");
        await browser.setAttribute(element, "title", "title2");
        await browser.assert.attribute(".second-element", "title", "title2");
    });

    it("Set Attribute XPath", async() => {
        await browser.assert.attribute(".second-element", "title", "title");
        await browser.setAttribute("//*[contains(@class, 'second-element')]", "title", "title2");
        await browser.assert.attribute(".second-element", "title", "title2");
    });

    it("Set Attribute Invalid Element", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.setAttribute(".not-an-element", "extra-class", "value");
        }, `QueryError: [setAttribute] Element ".not-an-element" not found.`);
    });

    it("Set Attribute To Empty String", async() => {
        await browser.assert.attribute(".second-element", "title", "title");
        await browser.setAttribute(".second-element", "title", "");
        await browser.assert.attribute(".second-element", "title", "");
    });

    it("Remove Attribute", async() => {
        await browser.assert.attribute(".second-element", "title", "title");
        await browser.setAttribute(".second-element", "title", null);
        await browser.assert.attribute(".second-element", "title", null);
    });
});
