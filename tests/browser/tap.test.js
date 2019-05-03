"use strict";

const assert = require('assert');
const Wendigo = require('../..');
const utils = require('../test_utils');
const configUrls = require('../config.json').urls;

describe("Tap", function() {
    this.timeout(5000);
    let browser;

    before(async() => {
        browser = await Wendigo.createBrowser();
    });

    beforeEach(async() => {
        await browser.open(configUrls.click);
    });

    after(async() => {
        await browser.close();
    });

    it("Tap", async() => {
        await browser.assert.text("#switch", "On");
        const tappedElements = await browser.tap(".btn");
        await browser.assert.text("#switch", "Off");
        assert.strictEqual(tappedElements, 1);
    });

    it("Tap Multiple Elements", async() => {
        await browser.assert.text("#switch", "On");
        const tappedElements = await browser.tap("button");
        assert.strictEqual(tappedElements, 2);
        await browser.assert.text("#switch", "Off");
        await browser.waitFor("#switch.on", 600);
    });

    it("Tap With Index", async() => {
        await browser.assert.text("#switch", "On");
        const tappedElements = await browser.tap("button", 1);
        assert.strictEqual(tappedElements, 1);
        await browser.assert.text("#switch", "On");
        await browser.waitFor("#switch.off", 600);
    });

    it("Tap From Node", async() => {
        const node = await browser.query(".btn");
        const tappedElements = await browser.tap(node);
        assert.strictEqual(tappedElements, 1);
        await browser.assert.text("#switch", "Off");
    });

    it("Tap With Invalid Index", async() => {
        await browser.assert.text("#switch", "On");
        await utils.assertThrowsAsync(async() => {
            await browser.tap("button", 10);
        }, `Error: [tap] invalid index "10" for selector "button", 2 elements found.`);
        await browser.assert.text("#switch", "On");
    });

    it("Tap Invalid Element", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.tap("#not-an-element");
        }, `QueryError: [tap] No element "#not-an-element" found.`);
    });

    it("Tap Label", async() => {
        await browser.open(configUrls.forms);
        await browser.tap("label");
        await browser.assert.text("#value-input", "Label");
    });

    it('Tap XY coordinates', async() => {
        await browser.open(configUrls.difficultClick);
        await browser.tap(10, 10);
        await browser.assert.text("#clicker", "click me");
        await browser.tap(100, 100);
        await browser.assert.text("#clicker", "Clicked!");
    });

    it('Tap XY coordinates Throws', async() => {
        await browser.open(configUrls.difficultClick);
        await browser.tap(4000, 4000);
    });

    it("Tap With XPath Selector", async() => {
        await browser.assert.text("#switch", "On");
        const tappedElements = await browser.tap("//*[@class='btn']");
        await browser.assert.text("#switch", "Off");
        assert.strictEqual(tappedElements, 1);
    });
});
