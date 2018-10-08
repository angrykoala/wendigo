"use strict";

const assert = require('assert');
const Wendigo = require('../../lib/wendigo'); // Load from package.json
const configUrls = require('../config.json').urls;

describe("Wendigo Main", function() {
    this.timeout(5000);

    it("Wendigo Load", () => {
        assert(Wendigo);
        assert(Wendigo.createBrowser);
        assert(Wendigo.stop);
    });

    it("Wendigo Create Browser", async() => {
        assert(Wendigo.createBrowser);
        const browser = await Wendigo.createBrowser();
        assert(browser);
        assert(browser.page);
        assert(browser.assert);
        assert(browser.localStorage);
        assert(Wendigo.instance);
        assert.strictEqual(browser._loaded, false);
        await browser.close();
        assert.strictEqual(browser._loaded, false);
    });

    it("Wendigo Stop", async() => {
        await Wendigo.stop();
        assert.equal(Wendigo.instance, null);
        await Wendigo.stop();
    });

    it("Wendigo Errors", () => {
        assert(Wendigo.Errors.AssertionError, "AssertionError not accesible.");
        assert(Wendigo.Errors.QueryError, "QueryError not accesible.");
        assert(Wendigo.Errors.FatalError, "FatalError not accesible.");
    });

    it("Change Browser Settings", async() => {
        const browser1 = await Wendigo.createBrowser();
        assert.strictEqual(browser1._settings.slowMo, 0);
        assert.strictEqual(Wendigo._lastSettings.slowMo, 0);
        await browser1.close();
        const browser2 = await Wendigo.createBrowser({slowMo: 1});
        assert.strictEqual(browser2._settings.slowMo, 1);
        assert.strictEqual(Wendigo._lastSettings.slowMo, 1);
        await browser2.close();
    });

    it("Multiple Browsers", async() => {
        const browser1 = await Wendigo.createBrowser();
        await browser1.open(configUrls.index);
        const browser2 = await Wendigo.createBrowser();
        await browser2.open(configUrls.simple);
        await browser1.assert.text("h1", "Main Title");
        await browser2.assert.text("p", "html_test");
        await browser1.assert.not.text("p", "html_test");
        await browser2.assert.not.exists("h1");
        await browser1.close();
        await browser2.close();
    });
});
