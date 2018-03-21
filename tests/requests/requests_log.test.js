"use strict";

const Wendigo = require('../../lib/wendigo');
const assert = require('assert');
const configUrls = require('../config.json').urls;

describe("Requests Log", function() {
    this.timeout(5000);
    let browser;

    before(async () => {
        browser = await Wendigo.createBrowser();
    });

    after(async() => {
        await browser.close();
    });

    it("Requests Are Intercepted", async () => {
        await browser.open(configUrls.requests);
        assert.strictEqual(await browser.requests.all.length, 2);
        await browser.clickText("click me");
        await browser.wait(10);
        assert.strictEqual(await browser.requests.all.length, 3);
        await browser.clickText("click me");
        await browser.wait(10);
        assert.strictEqual(await browser.requests.all.length, 4);
    });
});
