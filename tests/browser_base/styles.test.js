"use strict";

const Wendigo = require('../../lib/wendigo');
const assert = require('assert');
const configUrls = require('../config.json').urls;
const utils = require('../utils');

describe("Browser Base", function() {
    this.timeout(5000);

    let browser;
    before(async () => {
        browser = await Wendigo.createBrowser();
    });

    after(async() => {
        await browser.close();
    });

    it("Get Styles", async() => {
        await browser.open(configUrls.index);
        const styles = await browser.styles("h1");
        assert.strictEqual(styles.color, "rgb(255, 0, 0)");
    });

    it("Get Dynamic Styles", async() => {
        await browser.open(configUrls.click);
        const styles = await browser.styles("#switch");
        assert.strictEqual(styles["background-color"], "rgb(0, 0, 255)");
        assert.strictEqual(styles["color"], "rgb(0, 0, 0)");
        await browser.click(".btn");
        const styles2 = await browser.styles("#switch");
        assert.strictEqual(styles2["background-color"], "rgb(255, 0, 0)");
        assert.strictEqual(styles2["color"], "rgb(0, 0, 0)");
        assert.strictEqual(styles["background-color"], "rgb(0, 0, 255)");
        assert.strictEqual(styles["color"], "rgb(0, 0, 0)");
    });

    it("Styles On Invalid Element", async() => {
        await browser.open(configUrls.index);
        await utils.assertThrowsAsync(async () => {
            await browser.styles("#not-an-element");
        }, `Error: Element "#not-an-element" not found when trying to get styles.`);
    });

    it("Styles From Node Element", async() => {
        await browser.open(configUrls.index);
        const node = await browser.query("h1");
        const styles = await browser.styles(node);
        assert.strictEqual(styles.color, "rgb(255, 0, 0)");
    });
    it("Styles With PseudoSelector");

});
