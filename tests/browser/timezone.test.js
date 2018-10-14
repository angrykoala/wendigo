"use strict";

const assert = require('assert');
const Wendigo = require('../..');
const configUrls = require('../config.json').urls;


// Skipped until #204 fixed
describe.skip("Timezone", function() {
    this.timeout(5000);
    let browser;

    function getTimezone() {
        return browser.evaluate(() => {
            return Intl.DateTimeFormat().resolvedOptions().timeZone; // eslint-disable-line new-cap
        });
    }

    after(async() => {
        await browser.close();
    });

    it("Change Timezone To UTC", async() => {
        browser = await Wendigo.createBrowser({
            timezone: "UTC"
        });

        await browser.open(configUrls.simple);
        const tz = await getTimezone();
        assert.strictEqual(tz, "UTC");
    });

    it("Change Timezone To Japan", async() => {
        browser = await Wendigo.createBrowser({
            timezone: "Japan"
        });
        await browser.open(configUrls.simple, {
            timezone: "Japan"
        });
        const tz = await getTimezone();
        assert.strictEqual(tz, "Japan");
    });
});
