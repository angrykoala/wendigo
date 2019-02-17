"use strict";

const Wendigo = require('../..');
const configUrls = require('../config.json').urls;
const utils = require('../test_utils');

describe("Checkbox", function() {
    this.timeout(5000);
    let browser;

    before(async() => {
        browser = await Wendigo.createBrowser();
    });

    beforeEach(async() => {
        await browser.open(configUrls.forms);
    });

    after(async() => {
        await browser.close();
    });

    it("Assert Checked", async() => {
        const checkbox = await browser.queryAll("#checkbox input");
        await browser.check(checkbox[0]);
        await browser.assert.checked(checkbox[0]);
    });

    it("Assert Checked Throws", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.checked("#checkbox input");
        }, `[assert.checked] Expected element "#checkbox input" to be checked.`, "false", "true");
    });

    it("Assert Checked Throws Custom Message", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.checked("#checkbox input", "check fails");
        }, `[assert.checked] check fails`, "false", "true");
    });

    it("Assert Checked Throws On Undefined", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.checked("h1");
        }, `[assert.checked] Expected element "h1" to be checked.`);
    });

    it("Assert Checked Element Not Found", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.assert.checked(".not-element");
        }, `QueryError: [assert.checked] Element ".not-element" not found.`);
    });

    it("Assert Not Checked", async() => {
        const checkbox = await browser.queryAll("#checkbox input");
        await browser.assert.not.checked(checkbox[0]);
    });

    it("Assert Not Checked Throws", async() => {
        await browser.check("#checkbox input");
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.not.checked("#checkbox input");
        }, `[assert.not.checked] Expected element "#checkbox input" to not be checked.`, "true", "false");
    });

    it("Assert Not Checked Throws Custom Message", async() => {
        await browser.check("#checkbox input");
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.not.checked("#checkbox input", "not checked throws");
        }, `[assert.not.checked] not checked throws`, "true", "false");
    });

    it("Assert Checked Throws On Undefined", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.not.checked("h1");
        }, `[assert.not.checked] Expected element "h1" to not be checked.`);
    });

    it("Assert Checked Element Not Found", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.assert.not.checked(".not-element");
        }, `QueryError: [assert.not.checked] Element ".not-element" not found.`);
    });
});
