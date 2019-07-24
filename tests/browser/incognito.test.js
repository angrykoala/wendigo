"use strict";

const assert = require('assert');
const Wendigo = require('../..');
const configUrls = require('../config.json').urls;

// This test does not explicitly check if the browser is in incognito mode as it cannot be realiably detected on a web
describe("Incognito", function() {
    this.timeout(5000);

    it("Incognito Browser", async() => {
        const browser = await Wendigo.createBrowser({incognito: true});
        await browser.open(configUrls.simple);
        await browser.assert.text("p", "html_test");
        assert.strictEqual(browser._settings.incognito, true);
        assert.strictEqual(browser.incognito, true);
        await browser.close();
    });

    it("Not Incognito Browser", async() => {
        const browser = await Wendigo.createBrowser();
        await browser.open(configUrls.simple);
        await browser.assert.text("p", "html_test");
        assert.strictEqual(browser._settings.incognito, false);
        assert.strictEqual(browser.incognito, false);
        await browser.close();
    });
});
