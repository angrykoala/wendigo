"use strict";

const assert = require('assert');
const Wendigo = require('../../lib/wendigo');
const configUrls = require('../config.json').urls;
const utils = require('../utils');

describe("Value", function() {
    this.timeout(5000);
    let browser;

    before(async () => {
        browser = await Wendigo.createBrowser({log:true});
    });

    beforeEach(async () => {
        await browser.open(configUrls.forms);
    });

    after(async () => {
        await browser.close();
    });

    it("Get Value", async () => {
        const value1 = await browser.value("input.input1");
        const value2 = await browser.value("input.input2");
        assert.strictEqual(value1, "");
        assert.strictEqual(value2, "default value");
    });

    it("Get Value Element Doesn't Exist", async () => {
        const value = await browser.value("input.not-exists");
        assert.strictEqual(value, null);
    });

    it("Get Value Element Not Input", async () => {
        await browser.assert.exists("h1");
        const value = await browser.value("h1");
        assert.strictEqual(value, null);
    });

    it("Get Value From Node", async () => {
        const node = await browser.query("input.input2");
        const value = await browser.value(node);
        assert.strictEqual(value, "default value");
    });

    it("Set Value", async () => {
        const changed = await browser.setValue(".input1", "my-val");
        const value = await browser.value(".input1");
        assert.strictEqual(value, "my-val");
        assert.strictEqual(changed, 1);
    });

    it("Set Value From Node", async () => {
        const element = await browser.query(".input1");
        await browser.setValue(element, "my-val");
        const value = await browser.value(".input1");
        assert.strictEqual(value, "my-val");
    });

    it("Set Value Multiple Elements", async () => {
        const changed = await browser.setValue("form input", "my-val");
        const value1 = await browser.value(".input1");
        const value2 = await browser.value(".input2");
        assert.strictEqual(value1, "my-val");
        assert.strictEqual(value2, "my-val");
        assert.strictEqual(changed, 2);
    });

    it("Set Value From Non-existing Element", async () => {
        await utils.assertThrowsAsync(async () => {
            await browser.setValue(".not-element", "my-val");
        }, `Error: Element ".not-element" not found when trying to set value "my-val".`);
    });

    it("Clear Value", async () => {
        await browser.clearValue("input.input1");
        await browser.clearValue("input.input2");
        const v1 = await browser.value("input.input1");
        const v2 = await browser.value("input.input2");

        assert.strictEqual(v1, "");
        assert.strictEqual(v2, "");
    });

    it("Clear Value From Node", async () => {
        const node = await browser.query("input.input2");
        await browser.clearValue(node);
        const val = await browser.value("input.input2");
        assert.strictEqual(val, "");
    });
});
