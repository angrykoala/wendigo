
"use strict";

const assert = require('assert');
const Wendigo = require('../../lib/wendigo');
const utils = require('.././utils');
const configUrls = require('.././config.json').urls;

describe("Click", function() {
    this.timeout(5000);
    let browser;

    before(async () => {
        browser = await Wendigo.createBrowser();
    });

    beforeEach(async () => {
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
        await utils.assertThrowsAsync(async () => {
            await browser.click("button", 10);
        }, `Error: browser.click, invalid index "10" for selector "button", 2 elements found.`);
        await browser.assert.text("#switch", "On");
    });

    it("Click Text", async() => {
        const clickedElements = await browser.clickText("click me");
        assert.strictEqual(clickedElements, 1);
        await browser.assert.text("#switch", "Off");
        await browser.clickText("click me");
        await browser.assert.text("#switch", "On");
    });

    it("Click Invalid Text", async() => {
        await utils.assertThrowsAsync(async () => {
            await browser.clickText("not click me");
        }, `Error: No element with text "not click me" found when trying to click.`);
        await browser.assert.text("#switch", "On");
    });

    it("Click Invalid Element", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.click("#not-an-element");
        }, `Error: No element "#not-an-element" found when trying to click.`);
    });

});
