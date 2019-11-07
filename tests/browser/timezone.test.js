"use strict";

const assert = require('assert');
const Wendigo = require('../..');
const configUrls = require('../config.json').urls;

describe("Timezone", function() {
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

    it("Change Timezone To Tokyo", async() => {
        browser = await Wendigo.createBrowser({
            timezone: "Asia/Tokyo"
        });
        await browser.open(configUrls.simple);
        const tz = await getTimezone();
        assert.strictEqual(tz, "Asia/Tokyo");
    });

    it("Change Timezone To Japan", async() => {
        browser = await Wendigo.createBrowser({
            timezone: "Japan"
        });
        await browser.open(configUrls.simple);
        const tz = await getTimezone();
        assert.strictEqual(tz, "Asia/Tokyo");
    });

    describe("SetTimezone", () => {
        it("Set Timezone To UTC", async() => {
            browser = await Wendigo.createBrowser();
            await browser.open(configUrls.simple);
            await browser.setTimezone("UTC");
            const tz = await getTimezone();
            assert.strictEqual(tz, "UTC");
        });

        it("Set Timezone To Tokyo", async() => {
            browser = await Wendigo.createBrowser();
            await browser.open(configUrls.simple);
            await browser.setTimezone("Asia/Tokyo");
            const tz = await getTimezone();
            assert.strictEqual(tz, "Asia/Tokyo");
        });

        it("Set Timezone To Japan", async() => {
            browser = await Wendigo.createBrowser({
                timezone: "UTC"
            });
            await browser.open(configUrls.simple);
            await browser.setTimezone("Japan");
            const tz = await getTimezone();
            assert.strictEqual(tz, "Asia/Tokyo");
        });
    });
});
