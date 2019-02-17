"use strict";

const Wendigo = require('../..');
const utils = require('../test_utils');
const configUrls = require('../config.json').urls;

describe("Assert Disabled", function() {
    this.timeout(5000);
    let browser;

    before(async() => {
        browser = await Wendigo.createBrowser();
    });

    beforeEach(async() => {
        await browser.open(configUrls.disabledItems);
    });

    after(async() => {
        await browser.close();
    });


    it("Assert Disabled Items", async() => {
        await browser.assert.disabled("button.dis");
        await browser.assert.disabled("input.dis");
        await browser.assert.disabled("select.dis");
    });

    it("Assert Disabled Multiple Items", async() => {
        await browser.assert.disabled(".dis");
        await browser.assert.disabled("select");
    });

    it("Assert Disabled Items Throws", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.disabled("button.en");
        }, `[assert.disabled] Expected element "button.en" to be disabled.`);
    });

    it("Assert Disabled Items Throws Custom Message", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.disabled("button.en", "disabled failed");
        }, `[assert.disabled] disabled failed`);
    });

    it("Assert Not Disabled Items", async() => {
        await browser.assert.not.disabled("button.en");
        await browser.assert.not.disabled("input.en");
        await browser.assert.not.disabled("select.en");
    });

    it("Assert Not Disabled Items Throws", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.not.disabled("button.dis");
        }, `[assert.not.disabled] Expected element "button.dis" not to be disabled.`);
    });


    it("Assert Not Disabled Items Throws Custom Message", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.not.disabled("button.dis", "not disabled fails");
        }, `[assert.not.disabled] not disabled fails`);
    });

    it("Assert Disabled Element Not Exist", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.assert.disabled(".not-exist");
        }, `QueryError: [assert.disabled] Element ".not-exist" not found.`);
    });

    it("Assert Not Disabled Element Not Exist", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.assert.not.disabled(".not-exist");
        }, `QueryError: [assert.not.disabled] Element ".not-exist" not found.`);
    });

    it("Assert Enabled Items", async() => {
        await browser.assert.enabled("button.en");
        await browser.assert.enabled("input.en");
        await browser.assert.enabled("select.en");
    });

    it("Assert Enabled Items Throws", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.enabled("button.dis");
        }, `[assert.enabled] Expected element "button.dis" to be enabled.`);
    });

    it("Assert Enabled Items Throws Custom Message", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.enabled("button.dis", "enabled failed");
        }, `[assert.enabled] enabled failed`);
    });

    it("Assert Not Enabled Items", async() => {
        await browser.assert.not.enabled("button.dis");
        await browser.assert.not.enabled("input.dis");
        await browser.assert.not.enabled("select.dis");
    });

    it("Assert Not Enabled Items Throws", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.not.enabled("button.en");
        }, `[assert.not.enabled] Expected element "button.en" not to be enabled.`);
    });

    it("Assert Not Enabled Items Throws Custom Message", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.not.enabled("button.en", "not enabled fails");
        }, `[assert.not.enabled] not enabled fails`);
    });

    it("Assert Enabled Multiple Items", async() => {
        await browser.assert.enabled("button");
        await browser.assert.enabled(".en");
    });

    it("Assert Enabled Element Not Exist", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.assert.enabled(".not-exist");
        }, `QueryError: [assert.enabled] Element ".not-exist" not found.`);
    });

    it("Assert Not Enabled Element Not Exist", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.assert.not.enabled(".not-exist");
        }, `QueryError: [assert.not.enabled] Element ".not-exist" not found.`);
    });
});
