"use strict";

const assert = require('assert');
const Wendigo = require('../..');
const utils = require('../test_utils');
const configUrls = require('../config.json').urls;
const DomElement = require('../../dist/lib/models/dom_element');

describe("Element From Point", function() {
    this.timeout(5000);
    let browser;

    before(async() => {
        browser = await Wendigo.createBrowser();
    });

    beforeEach(async() => {
        await browser.open(configUrls.click);
    });

    after(async() => {
        await browser.close();
    });


    it('Element From Point', async() => {
        await browser.open(configUrls.difficultClick);
        const element = await browser.elementFromPoint(100, 100);
        await browser.assert.text(element, "click me");
        assert.ok(element instanceof DomElement);
    });

    it('No Element Found', async() => {
        await browser.open(configUrls.difficultClick);
        const element = await browser.elementFromPoint(4000, 4000);
        assert.strictEqual(element, null);
    });

    it('Element From Point Throws', async() => {
        await browser.open(configUrls.difficultClick);
        await utils.assertThrowsAsync(async() => {
            await browser.elementFromPoint();
        }, `FatalError: [elementFromPoint] Invalid coordinates [undefined,undefined].`);
        await utils.assertThrowsAsync(async() => {
            await browser.elementFromPoint("dsa", "dsa2");
        }, `FatalError: [elementFromPoint] Invalid coordinates [dsa,dsa2].`);
    });
});
