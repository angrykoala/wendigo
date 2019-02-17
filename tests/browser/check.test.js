"use strict";

const assert = require('assert');
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

    it("Default Checked Value", async() => {
        const checkbox = await browser.queryAll("#checkbox input");
        assert.strictEqual(checkbox.length, 2);
        const checked1 = await browser.checked(checkbox[0]);
        const checked2 = await browser.checked(checkbox[1]);
        assert.strictEqual(checked1, false);
        assert.strictEqual(checked2, false);
    });

    it("Checked Value On Not Checkbox", async() => {
        const checked1 = await browser.checked("h1");
        assert.strictEqual(checked1, undefined);
    });

    it("Check Value", async() => {
        const checkbox = await browser.queryAll("#checkbox input");
        assert.strictEqual(checkbox.length, 2);
        await browser.check(checkbox[0]);
        const checked1 = await browser.checked(checkbox[0]);
        const checked2 = await browser.checked(checkbox[1]);
        assert.strictEqual(checked1, true);
        assert.strictEqual(checked2, false);
    });

    it("Check Value Twice", async() => {
        const checkbox = await browser.queryAll("#checkbox input");
        assert.strictEqual(checkbox.length, 2);
        await browser.check(checkbox[0]);
        await browser.check(checkbox[0]);
        const checked1 = await browser.checked(checkbox[0]);
        assert.strictEqual(checked1, true);
    });

    it("Uncheck Value", async() => {
        const checkbox = await browser.queryAll("#checkbox input");
        assert.strictEqual(checkbox.length, 2);
        await browser.check(checkbox[0]);
        await browser.uncheck(checkbox[0]);
        const checked1 = await browser.checked(checkbox[0]);
        const checked2 = await browser.checked(checkbox[1]);
        assert.strictEqual(checked1, false);
        assert.strictEqual(checked2, false);
    });

    it("Uncheck Value Twice", async() => {
        const checkbox = await browser.queryAll("#checkbox input");
        assert.strictEqual(checkbox.length, 2);
        await browser.check(checkbox[0]);
        await browser.uncheck(checkbox[0]);
        await browser.uncheck(checkbox[0]);
        const checked1 = await browser.checked(checkbox[0]);
        assert.strictEqual(checked1, false);
    });

    it("Checked Throws", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.checked(".not-element");
        }, `QueryError: [checked] Element ".not-element" not found.`);
    });

    it("Check Throws", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.check(".not-element");
        }, `QueryError: [check] Element ".not-element" not found.`);
    });
    it("Uncheck Throws", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.uncheck(".not-element");
        }, `QueryError: [uncheck] Element ".not-element" not found.`);
    });
});
