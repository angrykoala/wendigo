"use strict";

const Wendigo = require('../../lib/wendigo');
const configUrls = require('../config.json').urls;


describe("Incognito", function() {
    this.timeout(5000);

    it("Not Incognito", async () => {
        const browser = await Wendigo.createBrowser();
        await browser.open(configUrls.incognito);
        await browser.assert.text("#check-text", "Not Incognito");
        await browser.close();
    });

    it("Incognito", async () => {
        const browser = await Wendigo.createBrowser({incognito: true});
        await browser.open(configUrls.incognito);
        await browser.assert.text("#check-text", "Incognito");
        await browser.close();
    });


});
