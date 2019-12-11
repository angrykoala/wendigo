"use strict";

const Wendigo = require('../..');
const assert = require('assert');
const configUrls = require('../config.json').urls;

describe("Set Media", function() {
    this.timeout(5000);

    let browser;
    before(async() => {
        browser = await Wendigo.createBrowser();
    });

    beforeEach(async() => {
        await browser.open(configUrls.simple);
    });

    after(async() => {
        await browser.close();
    });

    it("Set Media Type To Print", async() => {
        await browser.setMedia('print');
        assert.strictEqual(await browser.evaluate(() => matchMedia('screen').matches), false);
        assert.strictEqual(await browser.evaluate(() => matchMedia('print').matches), true);
    });

    it("Set Media Type To Screen", async() => {
        await browser.setMedia('screen');
        assert.strictEqual(await browser.evaluate(() => matchMedia('screen').matches), true);
        assert.strictEqual(await browser.evaluate(() => matchMedia('print').matches), false);
    });

    it("Set Media Type To Null", async() => {
        await browser.setMedia(null);
        assert.strictEqual(await browser.evaluate(() => matchMedia('screen').matches), true);
        assert.strictEqual(await browser.evaluate(() => matchMedia('print').matches), false);
    });
    it("Set Media Type To Null In Object", async() => {
        await browser.setMedia({
            type: null
        });
        assert.strictEqual(await browser.evaluate(() => matchMedia('screen').matches), true);
        assert.strictEqual(await browser.evaluate(() => matchMedia('print').matches), false);
    });

    it("Set Media Type As Object", async() => {
        await browser.setMedia({
            type: 'print'
        });
        assert.strictEqual(await browser.evaluate(() => matchMedia('screen').matches), false);
        assert.strictEqual(await browser.evaluate(() => matchMedia('print').matches), true);
    });

    it("Set Media Features", async() => {
        await browser.setMedia({
            features: [
                {name: 'prefers-color-scheme',
                    value: 'dark'},
                {name: 'prefers-reduced-motion',
                    value: 'reduce'}
            ]});

        assert.strictEqual(await browser.evaluate(() => matchMedia('(prefers-color-scheme: dark)').matches), true);
        assert.strictEqual(await browser.evaluate(() => matchMedia('(prefers-color-scheme: light)').matches), false);
        assert.strictEqual(await browser.evaluate(() => matchMedia('(prefers-color-scheme: no-preference)').matches), false);
        assert.strictEqual(await browser.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches), true);
    });
});
