"use strict";

const Wendigo = require('../..');
const configUrls = require('../config.json').urls;

describe.skip("Drag And Drop", function() {
    this.timeout(5000);
    let browser;

    before(async() => {
        browser = await Wendigo.createBrowser();
    });

    beforeEach(async() => {
        await browser.open(configUrls.drag);
    });

    after(async() => {
        await browser.close();
    });

    it("Drag And Drop Element", async() => {
        await browser.assert.text("#result", "NOT");
        await browser.dragAndDrop("#draggable-text", "#target");
        await browser.assert.text("#result", "DROPPED");
    });
});
