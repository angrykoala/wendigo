"use strict";

const Wendigo = require('../..');
const assert = require('assert');
const configUrls = require('../config.json').urls;

describe.skip("Find By Label", function() {
    this.timeout(5000);

    let browser;
    before(async() => {
        browser = await Wendigo.createBrowser();
    });

    beforeEach(async() => {
        await browser.open(configUrls.forms);
    });

    after(async() => {
        await browser.close();
    });

    it("Find Input By Label", async() => {
        const input = await browser.findByLabel("My Label");
        assert.strictEqual(input.length, 1);
        await browser.assert.class(input[0], "input1");
    });
});
