"use strict";

const Wendigo = require('../..');
const assert = require('assert');
const configUrls = require('../config.json').urls;
const utils = require('../test_utils');

describe("Browser Styles", function() {
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

    it("Get Styles", async() => {
        const styles = await browser.styles("h1");
        assert.strictEqual(styles.color, "rgb(255, 0, 0)");
    });

    it("Get Dynamic Styles", async() => {
        await browser.open(configUrls.click);
        const styles = await browser.styles("#switch");
        assert.strictEqual(styles["background-color"], "rgb(0, 0, 255)");
        assert.strictEqual(styles.color, "rgb(0, 0, 0)");
        await browser.click(".btn");
        const styles2 = await browser.styles("#switch");
        assert.strictEqual(styles2["background-color"], "rgb(255, 0, 0)");
        assert.strictEqual(styles2.color, "rgb(0, 0, 0)");
        assert.strictEqual(styles["background-color"], "rgb(0, 0, 255)");
        assert.strictEqual(styles.color, "rgb(0, 0, 0)");
    });

    it("Styles On Invalid Element", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.styles("#not-an-element");
        }, `QueryError: Element "#not-an-element" not found when trying to get styles.`);
    });

    it("Styles From Node Element", async() => {
        const node = await browser.query("h1");
        const styles = await browser.styles(node);
        assert.strictEqual(styles.color, "rgb(255, 0, 0)");
    });

    it("Style Multiple Elements", async() => {
        const styles = await browser.styles("b");
        assert.strictEqual(styles.visibility, "hidden");
    });

    it("Get Style", async() => {
        const style = await browser.style("h1", "color");
        assert.strictEqual(style, "rgb(255, 0, 0)");
    });

    it("Get Style Null", async() => {
        const style = await browser.style("h1", "not-style");
        assert.strictEqual(style, undefined);
    });

    it("Style On Invalid Element", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.style("#not-an-element", "color");
        }, `QueryError: Element "#not-an-element" not found when trying to get style "color".`);
    });
});
