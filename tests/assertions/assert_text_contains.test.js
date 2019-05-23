"use strict";

const Wendigo = require('../..');
const utils = require('../test_utils');
const configUrls = require('../config.json').urls;

describe("Assert Text Contains", function() {
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


    it("Text Contains", async() => {
        await browser.assert.textContains(".container p", "My first paragraph");
        await browser.assert.textContains(".container p", "My first");
    });

    it("Text Contains Multiple Elements", async() => {
        await browser.assert.textContains("p", "My first paragraph");
        await browser.assert.textContains("p", "My second paragraph");
        await browser.assert.textContains("p", "My second");
        await browser.assert.textContains("p", "My first");
    });

    it("Text Contains From DomElement", async() => {
        const node = await browser.query(".container p");
        await browser.assert.textContains(node, "My first");
    });

    it("Text Contains Throws", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.textContains(".container p", "My second");
        }, `[assert.textContains] Expected element ".container p" to contain text "My second", "My first paragraph" found.`);
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.textContains("p", "My paragraph");
        }, `[assert.textContains] Expected element "p" to contain text "My paragraph", "My first paragraph My second paragraph" found.`);
    });

    it("Text Contains Throws With Custom Message", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.textContains(".container p", "My second", "text contains fails");
        }, `[assert.textContains] text contains fails`);
    });

    it("Text Not Contains", async() => {
        await browser.assert.not.textContains(".container p", "not my text");
    });

    it("Text Not Contains Multiple Elements", async() => {
        await browser.assert.not.textContains("p", "Not a text");
    });

    it("Text Not Contains From DomElement", async() => {
        const node = await browser.query(".container p");
        await browser.assert.not.textContains(node, "not a text");
    });

    it("Text Not Contains Throws", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.not.textContains(".container p", "first");
        }, `[assert.not.textContains] Expected element ".container p" to not contain text "first".`);
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.not.textContains(".container p", "My first paragraph");
        }, `[assert.not.textContains] Expected element ".container p" to not contain text "My first paragraph".`);
    });

    it("Text Not Contains Throws With Multiple Elements", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.not.textContains("p", "My second paragraph");
        }, `[assert.not.textContains] Expected element "p" to not contain text "My second paragraph".`);
    });

    it("Text Not Contains Throws With Custom Message", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.not.textContains(".container p", "first", "not textcontains fails");
        }, `[assert.not.textContains] not textcontains fails`);
    });

    it("Multiple Texts in Array With Regex", async() => {
        await browser.assert.textContains("p", ["My first", "My second"]);
        await browser.assert.textContains("p", ["My first"]);
    });

    it("Multiple Texts in Array Throws", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.textContains("p", ["My first paragraph", "My pa2ragraph"]);
        }, `[assert.textContains] Expected element "p" to contain text "My pa2ragraph", "My first paragraph My second paragraph" found.`);
    });

    it("Not Multiple Texts in Array", async() => {
        await browser.assert.not.textContains("p", ["not a correct text", "another incorrect text"]);
    });

    it("Not Multiple Texts in Array Throws", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.not.textContains("p", ["incorrect", "My first", "not a correct text"]);
        }, `[assert.not.textContains] Expected element "p" to not contain text "My first".`);
    });

    it("Text With Empty Parameter Array Throws", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.assert.textContains("h1", []);
        }, `Error: [assert.textContains] Missing expected text for assertion.`);
    });

    it("Not Text With Empty Parameter Array Throws", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.assert.not.textContains("h1", []);
        }, `Error: [assert.not.textContains] Missing expected text for assertion.`);
    });

    it("Text Contains Throws", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.textContains(".container p", "My second");
        }, `[assert.textContains] Expected element ".container p" to contain text "My second", "My first paragraph" found.`);
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.textContains("p", "My paragraph");
        }, `[assert.textContains] Expected element "p" to contain text "My paragraph", "My first paragraph My second paragraph" found.`);
    });
});
