"use strict";

const assert = require('assert');
const Wendigo = require('../../lib/wendigo');
const configUrls = require('../config.json').urls;
const utils = require('../utils');

describe("Select", function() {
    this.timeout(5000);
    let browser;

    before(async () => {
        browser = await Wendigo.createBrowser();
    });

    beforeEach(async () => {
        await browser.open(configUrls.forms);
    });

    after(async () => {
        await browser.close();
    });

    it("Default Selected Options", async () => {
        const selectedOptions = await browser.selectedOptions("#normal-select");
        await browser.assert.value("#normal-select", "value1");
        assert.strictEqual(selectedOptions.length, 1);
        assert.strictEqual(selectedOptions[0], "value1");
    });

    it("Default Selected Xpath", async () => {
        const selectedOptions = await browser.selectedOptions('//*[@id="normal-select"]');
        assert.strictEqual(selectedOptions.length, 1);
        assert.strictEqual(selectedOptions[0], "value1");
    });

    it("Default Selected Node", async () => {
        const element = await browser.query("#normal-select");
        const selectedOptions = await browser.selectedOptions(element);
        await browser.assert.value("#normal-select", "value1");
        assert.strictEqual(selectedOptions.length, 1);
        assert.strictEqual(selectedOptions[0], "value1");
    });

    it("Select Option", async () => {
        const selectResult = await browser.select("#normal-select", "value2");
        await browser.assert.value("#normal-select", "value2");
        const selectedOptions = await browser.selectedOptions("#normal-select");
        assert.strictEqual(selectedOptions.length, 1);
        assert.strictEqual(selectedOptions[0], "value2");
        assert.strictEqual(selectResult.length, 1);
        assert.strictEqual(selectResult[0], "value2");
    });

    it("Select Option Without Value", async () => {
        const selectResult = await browser.select("#normal-select", "Value 4");
        await browser.assert.value("#normal-select", "Value 4");
        const selectedOptions = await browser.selectedOptions("#normal-select");
        assert.strictEqual(selectedOptions.length, 1);
        assert.strictEqual(selectedOptions[0], "Value 4");
        assert.strictEqual(selectResult.length, 1);
        assert.strictEqual(selectResult[0], "Value 4");
        assert.strictEqual(selectResult.length, 1);
        assert.strictEqual(selectResult[0], "Value 4");
    });

    it("Select Multiple Values On Single Select", async () => {
        const selectResult = await browser.select("#normal-select", ["Value 4", "value2"]);
        await browser.assert.value("#normal-select", "value2");
        assert.strictEqual(selectResult.length, 1);
        assert.strictEqual(selectResult[0], "value2");
    });

    it("Select Multiple Values On Multiple Select", async () => {
        const selectResult = await browser.select("#multiple-select", ["value4", "value2"]);
        const selectedOptions = await browser.selectedOptions("#multiple-select");
        assert.strictEqual(selectedOptions.length, 2);
        assert.strictEqual(selectedOptions[0], "value2");
        assert.strictEqual(selectedOptions[1], "value4");
        assert.strictEqual(selectResult.length, 2);
        assert.strictEqual(selectResult[0], "value2");
        assert.strictEqual(selectResult[1], "value4");
    });

    it("Select No Values On Multiple Select", async () => {
        await browser.select("#multiple-select", []);
        const selectedOptions = await browser.selectedOptions("#multiple-select");
        assert.strictEqual(selectedOptions.length, 0);
    });

    it("Select Non Existant Values", async () => {
        await browser.select("#normal-select", "value5");
        const selectedOptions = await browser.selectedOptions("#normal-select");
        assert.strictEqual(selectedOptions.length, 0);
    });

    it("Select Non Existant Element", async () => {
        await utils.assertThrowsAsync (async () => {
            await browser.select("#not-exists", "value1");
        }, `Error: Element "#not-exists" not found when trying to select value.`);
    });

    it("Selected Options With Not Element", async () => {
        await utils.assertThrowsAsync (async () => {
            await browser.selectedOptions("#not-exists");
        }, `Error: Element "#not-exists" not found when trying to get selected options.`);
    });
});
