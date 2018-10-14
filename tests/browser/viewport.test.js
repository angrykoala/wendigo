"use strict";

const Wendigo = require('../..');
const configUrls = require('../config.json').urls;

describe("Viewport", function() {
    this.timeout(5000);
    let browser;

    before(async() => {
        browser = await Wendigo.createBrowser();
    });

    after(async() => {
        await browser.close();
    });


    it("Set Viewport", async() => {
        await browser.open(configUrls.viewport);
        await browser.assert.style(".my-element", "color", "rgb(0, 0, 0)");
        await browser.setViewport({width: 200});
        await browser.assert.style(".my-element", "color", "rgb(255, 0, 0)");
    });

    it("Set Viewport In Options", async() => {
        await browser.open(configUrls.viewport, {
            viewport: {
                width: 200
            }
        });
        await browser.assert.style(".my-element", "color", "rgb(255, 0, 0)");
    });

    it("Set Viewport No Options", async() => {
        await browser.open(configUrls.viewport);
        await browser.assert.style(".my-element", "color", "rgb(0, 0, 0)");
    });
});
