"use strict";

const Wendigo = require('../..');
const utils = require('../test_utils');
const configUrls = require('../config.json').urls;


describe("Assert Select", function() {
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

    it("Assert Select Options", async() => {
        await browser.assert.options("#normal-select", ["value1", "value2", "value3", "Value 4"]);
    });

    it("Assert Select Options Throws", async() => {
        const errorMsg = `Expected element "#normal-select" to have options "value1, value3, Value 4", "value1, value2, value3, Value 4" found.`;
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.options("#normal-select", ["value1", "value3", "Value 4"]);
        }, errorMsg, "value1,value2,value3,Value 4", "value1,value3,Value 4");
    });

    it("Assert Select Options Throws Custom Message", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.options("#normal-select", ["value1", "value3", "Value 4"], "options fails");
        }, "options fails", "value1,value2,value3,Value 4", "value1,value3,Value 4");
    });

    it("Assert Selected Options", async() => {
        await browser.assert.selectedOptions("#normal-select", "value1");
    });

    it("Assert Selected Multiple Options", async() => {
        await browser.select("#multiple-select", ["value1", "value2"]);
        await browser.assert.selectedOptions("#multiple-select", ["value1", "value2"]);
    });

    it("Assert Selected Options Throws", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.selectedOptions("#normal-select", "value3");
        }, `Expected element "#normal-select" to have options "value3" selected, "value1" found.`, "value1", "value3");
        await browser.select("#multiple-select", ["value1", "value2"]);
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.selectedOptions("#multiple-select", ["value2"]);
        }, `Expected element "#multiple-select" to have options "value2" selected, "value1, value2" found.`, "value1,value2", "value2");
    });

    it("Assert Selected Options Throws Custom Message", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.selectedOptions("#normal-select", "value3", "selected fails");
        }, "selected fails", "value1", "value3");
    });

    it("Assert Not Selected Options", async() => {
        await browser.assert.not.selectedOptions("#normal-select", "value2");
        await browser.assert.not.selectedOptions("#normal-select", "not-value");
    });

    it("Assert Not Selected Options Throws", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.not.selectedOptions("#normal-select", "value1");
        }, `Expected element "#normal-select" not to have options "value1" selected.`);
    });

    it("Assert Not Selected Multiple Options Throws", async() => {
        await browser.select("#multiple-select", ["value1", "value2"]);
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.not.selectedOptions("#multiple-select", ["value1", "value2"]);
        }, `Expected element "#multiple-select" not to have options "value1, value2" selected.`);
    });

    it("Assert Not Selected Options Throws Custom Message", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.not.selectedOptions("#normal-select", "value1", "not selected fails");
        }, "not selected fails");
    });
});
