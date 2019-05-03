"use strict";

const assert = require('assert');
const Wendigo = require('../..');
const utils = require('../test_utils');
const configUrls = require('../config.json').urls;

describe("Click", function() {
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

    it("Click", async() => {
        await browser.assert.text("#switch", "On");
        const clickedElements = await browser.click(".btn");
        await browser.assert.text("#switch", "Off");
        assert.strictEqual(clickedElements, 1);
    });

    it("Click Multiple Elements", async() => {
        await browser.assert.text("#switch", "On");
        const clickedElements = await browser.click("button");
        assert.strictEqual(clickedElements, 2);
        await browser.assert.text("#switch", "Off");
        await browser.waitFor("#switch.on", 600);
    });

    it("Click With Index", async() => {
        await browser.assert.text("#switch", "On");
        const clickedElements = await browser.click("button", 1);
        assert.strictEqual(clickedElements, 1);
        await browser.assert.text("#switch", "On");
        await browser.waitFor("#switch.off", 600);
    });

    it("Click From Node", async() => {
        const node = await browser.query(".btn");
        const clickedElements = await browser.click(node);
        assert.strictEqual(clickedElements, 1);
        await browser.assert.text("#switch", "Off");
    });

    it("Click With Invalid Index", async() => {
        await browser.assert.text("#switch", "On");
        await utils.assertThrowsAsync(async() => {
            await browser.click("button", 10);
        }, `Error: [click] Invalid index "10" for selector "button", 2 elements found.`);
        await browser.assert.text("#switch", "On");
    });

    it("Click Text", async() => {
        const clickedElements = await browser.clickText("click me");
        assert.strictEqual(clickedElements, 1);
        await browser.assert.text("#switch", "Off");
        await browser.clickText("click me");
        await browser.assert.text("#switch", "On");
    });

    it("Click Text Invalid Text", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.clickText("not click me");
        }, `QueryError: [clickText] No element with text "not click me" found.`);
        await browser.assert.text("#switch", "On");
    });

    it("Click Text SubQuery", async() => {
        const clickedElements = await browser.clickText("body", "click me");
        assert.strictEqual(clickedElements, 1);
        await browser.assert.text("#switch", "Off");
    });

    it("Click Text SubQuery Fails", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.clickText("#switch", "click me");
        }, `QueryError: [clickText] No element with text "click me" found.`);
        await browser.assert.text("#switch", "On");
    });

    it("Click Invalid Element", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.click("#not-an-element");
        }, `QueryError: [click] No element "#not-an-element" found.`);
    });

    it("Click Text With Index", async() => {
        const clickedElements = await browser.clickText("click me delay", 0);
        assert.strictEqual(clickedElements, 1);
    });

    it("Click Text Multiple", async() => {
        const clickedElements = await browser.clickText("click me delay");
        assert.strictEqual(clickedElements, 2);
    });

    it("Click Text With Index Out Of Bounds", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.clickText("click me delay", 10);
        }, `Error: [clickText] Invalid index "10" for text "click me delay", 2 elements found.`);
    });

    it("Click Text With Index And Selector", async() => {
        const clickedElements = await browser.clickText("body", "click me delay", 0);
        assert.strictEqual(clickedElements, 1);
    });

    it("Click Label", async() => {
        await browser.open(configUrls.forms);
        await browser.click("label");
        await browser.assert.text("#value-input", "Label");
    });

    it('Clicks XY coordinates', async() => {
        await browser.open(configUrls.difficultClick);
        await browser.click(10, 10);
        await browser.assert.text("#clicker", "click me");
        await browser.click(100, 100);
        await browser.assert.text("#clicker", "Clicked!");
    });

    it('Clicks XY coordinates Throws', async() => {
        await browser.open(configUrls.difficultClick);
        await browser.click(4000, 4000);
    });

    it("Click Text Containing", async() => {
        await browser.assert.text("#switch", "On");
        const clickedElements = await browser.clickTextContaining("weird");
        assert.strictEqual(clickedElements, 1);
        await browser.assert.text("#switch", "Off");
    });

    it("Click Text Containing Throws", async() => {
        await browser.assert.text("#switch", "On");
        await utils.assertThrowsAsync(async() => {
            await browser.clickTextContaining("badText");
        }, `QueryError: [clickTextContaining] No element with text containing "badText" found.`);
    });

    it("Click Text Containing With Index", async() => {
        const clickedElements = await browser.clickTextContaining("weird", 0);
        assert.strictEqual(clickedElements, 1);
    });

    it("Click Text Containing With Index And Selector", async() => {
        const clickedElements = await browser.clickTextContaining("body", "weird", 0);
        assert.strictEqual(clickedElements, 1);
    });

    it("Click Text Containing With Index Out Of Bounds", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.clickTextContaining("weird", 10);
        }, `Error: [clickTextContaining] Invalid index "10" for text containing "weird", 1 elements found.`);
    });

    it("Click Text With Invalid Selector", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.clickText({}, "dsa");
        }, `Error: [clickText] Invalid selector.`);
    });

    it("Click Text Containing With Invalid Selector", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.clickTextContaining({}, "dsa");
        }, `Error: [clickTextContaining] Invalid selector.`);
    });
});
