"use strict";

const Wendigo = require('../..');
const configUrls = require('../config.json').urls;
const utils = require('../test_utils');

describe("Drag And Drop", function() {
    this.timeout(5000);
    let browser;

    before(async() => {
        browser = await Wendigo.createBrowser({log: true});
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

    it("Drag And Drop Fails If Element Does Not Exists", async() => {
        await browser.assert.text("#result", "NOT");
        await utils.assertThrowsAsync(async() => {
            await browser.dragAndDrop("#not-element", "#target");
        }, `QueryError: [dragAndDrop] Element not found.`);
        await browser.assert.text("#result", "NOT");
    });
});
