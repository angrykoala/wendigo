"use strict";

const Wendigo = require('../lib/wendigo');
const assert = require('assert');
const configUrls = require('./config.json').urls;
const utils = require('./utils');


describe("Browser Forms", function() {
    this.timeout(5000);

    let browser;
    before(async () => {
        browser = await Wendigo.createBrowser();
    });

    after(async() => {
        await browser.close();
    });

    it("Get Value", async() => {
        await browser.open(configUrls.forms);
        const value1 = await browser.value("input.input1");
        const value2 = await browser.value("input.input2");
        assert.strictEqual(value1, "");
        assert.strictEqual(value2, "default value");
    });

    it("Get Value Element Doesn't Exist", async() => {
        await browser.open(configUrls.forms);
        const value = await browser.value("input.not-exists");
        assert.strictEqual(value, null);
    });

    it("Get Value Element Not Input", async() => {
        await browser.open(configUrls.forms);
        await browser.assert.exists("h1");
        const value = await browser.value("h1");
        assert.strictEqual(value, null);
    });

    it("Get Value From Node", async() => {
        await browser.open(configUrls.forms);
        const node = await browser.query("input.input2");
        const value = await browser.value(node);
        assert.strictEqual(value, "default value");
    });

    it("Assert Value", async() => {
        await browser.open(configUrls.forms);
        await browser.assert.value("input.input1", "");
        await browser.assert.value("input.input2", "default value");
    });

    it("Assert Value With Node", async() => {
        await browser.open(configUrls.forms);
        const node = await browser.query("input.input2");
        await browser.assert.value(node, "default value");
    });

    it("Assert Null Value", async() => {
        await browser.open(configUrls.forms);
        await browser.assert.value("h1", null);
        await browser.assert.value("input.not-exists", null);
    });

    it("Assert Value Throws", async() => {
        await browser.open(configUrls.forms);
        await utils.assertThrowsAsync(async () => {
            await browser.assert.value("input.input1", "False Text");
        }, `Expected element "input.input1" to have value "False Text", "" found`);

        await utils.assertThrowsAsync(async () => {
            await browser.assert.value("input.input2", "False Text");
        }, `Expected element "input.input2" to have value "False Text", "default value" found`);

        await utils.assertThrowsAsync(async () => {
            await browser.assert.value("input.not-exists", "False Text");
        }, `Expected element "input.not-exists" to have value "False Text", no value found`);
    });

    it("Assert Value Throws Custom Message", async() => {
        await browser.open(configUrls.forms);
        await utils.assertThrowsAsync(async () => {
            await browser.assert.value("input.input1", "False Text", "value failed");
        }, `value failed`);
    });

    it("Assert Not Value", async() => {
        await browser.open(configUrls.forms);
        await browser.assert.not.value("input.input1", "a value");
        await browser.assert.not.value("input.input1", "default value 2");
        await browser.assert.not.value("h1", "");
    });

    it("Assert Not Value From Node", async() => {
        await browser.open(configUrls.forms);
        const node = await browser.query("input.input1");
        await browser.assert.not.value(node, "a value");
    });

    it("Assert Not Value Throws", async() => {
        await browser.open(configUrls.forms);
        await utils.assertThrowsAsync(async () => {
            await browser.assert.not.value("input.input1", "");
        }, `Expected element "input.input1" not to have value ""`);

        await utils.assertThrowsAsync(async () => {
            await browser.assert.not.value("input.input2", "default value");
        }, `Expected element "input.input2" not to have value "default value"`);

        await utils.assertThrowsAsync(async () => {
            await browser.assert.not.value("h1", null);
        }, `Expected element "h1" not to have value "null"`);
    });

    it("Assert Not Value Throws", async() => {
        await browser.open(configUrls.forms);
        await utils.assertThrowsAsync(async () => {
            await browser.assert.not.value("input.input1", "", "not value failed");
        }, `not value failed`);
    });

    it("Type", async () => {
        await browser.open(configUrls.forms);
        await browser.type("input.input1", "firstText");
        await browser.type("input.input2", "secondText");
        await browser.assert.value("input.input1", "firstText");
        await browser.assert.value("input.input2", "secondTextdefault value");
    });

    it("Type Node", async () => {
        await browser.open(configUrls.forms);
        const node = await browser.query("input.input1");

        await browser.type(node, "firstText");
        await browser.assert.value("input.input1", "firstText");
    });

    it("Clear Input", async() => {
        await browser.open(configUrls.forms);
        await browser.clearValue("input.input1");
        await browser.clearValue("input.input2");
        await browser.assert.value("input.input1", "");
        await browser.assert.value("input.input2", "");
    });

    it("Clear Input From Node", async() => {
        await browser.open(configUrls.forms);
        const node = await browser.query("input.input2");
        await browser.clearValue(node);
        await browser.assert.value("input.input2", "");
    });
});
