"use strict";

const assert = require('assert');
const Wendigo = require('../..');
const configUrls = require('../config.json').urls;

describe("Geolocation", function() {
    this.timeout(5000);
    let browser;

    before(async() => {
        browser = await Wendigo.createBrowser({log: true});
    });

    after(async() => {
        await browser.close();
    });

    it("Set Geolocation Method", async() => {
        await browser.open(configUrls.index);
        await browser.setGeolocation({
            latitude: 80,
            longitude: -30
        });
        await browser.overridePermissions(configUrls.index, "geolocation");

        const correctLocation = await browser.evaluate(() => {
            return new Promise((resolve) => {
                navigator.geolocation.getCurrentPosition((res) => {
                    resolve(res.coords.latitude === 80 && res.coords.longitude === -30);
                });
            });
        });
        assert.strictEqual(correctLocation, true);
    });

    it("Geolocation setting", async() => {
        await browser.open(configUrls.index, {
            geolocation: {
                latitude: 89,
                longitude: -60
            }
        });

        await browser.overridePermissions(configUrls.index, "geolocation");
        const correctLocation = await browser.evaluate(() => {
            return new Promise((resolve) => {
                navigator.geolocation.getCurrentPosition((res) => {
                    resolve(res.coords.latitude === 89 && res.coords.longitude === -60);
                });
            });
        });
        assert.strictEqual(correctLocation, true);
    });

    it("Get Geolocation", async() => {
        await browser.open(configUrls.index, {
            geolocation: {
                latitude: 2,
                longitude: -6
            }
        });

        await browser.overridePermissions(configUrls.index, "geolocation");
        const location = await browser.geolocation();
        assert.strictEqual(location.latitude, 2);
        assert.strictEqual(location.longitude, -6);
    });
});
