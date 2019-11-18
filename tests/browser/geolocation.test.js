"use strict";

const assert = require('assert');
const Wendigo = require('../..');
const configUrls = require('../config.json').urls;

describe.only("Geolocation", function() {
    this.timeout(5000);
    let browser;

    before(async() => {
        browser = await Wendigo.createBrowser({log: true});
    });

    after(async() => {
        await browser.close();
    });

    it.only("Set Geolocation Method", async() => {
        await browser.open(configUrls.index);
        await browser.setGeolocation({
            latitude: 80,
            longitude: -30
        });

        const correctLocation = await browser.evaluate(() => {
            return new Promise((resolve, reject) => {
                console.log("In evaluate");
                navigator.geolocation.getCurrentPosition((res) => {
                    console.log("after fet current");
                    resolve(!(res.latitude !== 80 || res.longitude !== -30));
                }, (err) => {
                    console.log("MY ERR", err);
                    reject(err);
                });
            });
        });
        console.log(correctLocation);
        assert.strictEqual(correctLocation, true);
    });

    it("Geolocation setting", async() => {
        await browser.open(configUrls.index, {
            geolocation: {
                latitude: 180,
                longitude: -60
            }
        });

        const correctLocation = await browser.evaluate(() => {
            return new Promise((resolve) => {
                navigator.geolocation.getCurrentPosition((res) => {
                    resolve(!(res.latitude !== 180 || res.longitude !== -60));
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

        const location = await browser.getGeolocation();
        assert.strictEqual(location.latitude, 2);
        assert.strictEqual(location.longitude, -6);
    });
});
