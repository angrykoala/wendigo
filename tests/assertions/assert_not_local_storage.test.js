"use strict";

const Wendigo = require('../../lib/wendigo');
const configUrls = require('../config.json').urls;
const utils = require('../utils');


describe("Assert Not Local Storage", function() {
    this.timeout(5000);
    let browser;

    before(async () => {
        browser = await Wendigo.createBrowser();
    });

    beforeEach(async () => {
        await browser.open(configUrls.localStorage);
    });

    afterEach(async() => {
        await browser.localStorage.clear();
    });

    after(async () => {
        await browser.close();
    });

    it("Item Not Exists", async () => {
        await browser.assert.localStorage.not.exist("marvin");
        await browser.localStorage.clear();
        await browser.assert.localStorage.not.exist("arthur");
    });

    it("Multiple Item Not Exists", async () => {
        await browser.assert.localStorage.not.exist(["marvin", "item2"]);
    });

    it("Item Not Exists Throws", async () => {
        await utils.assertThrowsAssertionAsync(async () => {
            await browser.assert.localStorage.not.exist("arthur");
        }, `Expected item "arthur" not to exist in localStorage.`);
    });

    it("Multiple Items Not Exists Throws", async () => {
        await browser.localStorage.setItem("item2", "val2");
        await utils.assertThrowsAssertionAsync(async () => {
            await browser.assert.localStorage.not.exist(["arthur", "item2"]);
        }, `Expected items "arthur item2" not to exist in localStorage.`);
    });

    it("Item Not Exists Throws Custom Message", async () => {
        await utils.assertThrowsAssertionAsync(async () => {
            await browser.assert.localStorage.not.exist("arthur", "not exists error");
        }, `not exists error`);
    });

    it("Item Not Value", async () => {
        await browser.assert.localStorage.not.value("arthur", "panic");
        await browser.localStorage.setItem("item2", "val2");
        await browser.assert.localStorage.not.value("item2", "val27");
    });

    it("Item Not Value Throws", async () => {
        await utils.assertThrowsAssertionAsync(async () => {
            await browser.assert.localStorage.not.value("arthur", "dontpanic");
        }, `Expected item "arthur" not to have value "dontpanic" in localStorage.`);
    });

    it("Item Not Value Throws Custom Message", async () => {
        await utils.assertThrowsAssertionAsync(async () => {
            await browser.assert.localStorage.not.value("arthur", "dontpanic", "not value fail");
        }, `not value fail`);
    });

    it("Multiple Items Not Value", async() => {
        await browser.localStorage.setItem("item2", "val2");
        await browser.assert.localStorage.not.value({arthur: "panic", item2: "val26", item3: "aval"});
    });

    it("Multiple Items Not Value Throws", async() => {
        await browser.localStorage.setItem("item2", "val2");
        await utils.assertThrowsAssertionAsync(async () => {
            await browser.assert.localStorage.not.value({arthur: "dontpanic", item2: "val2"});
        }, `Expected items "arthur item2" not to have values "dontpanic val2" in localStorage.`);
    });

    it("Storage Not Length", async() => {
        await browser.assert.localStorage.not.length(2);
        await browser.localStorage.setItem("test", "val");
        await browser.assert.localStorage.not.length(3);
    });

    it("Storage Not Length Throws", async() => {
        await utils.assertThrowsAssertionAsync(async () => {
            await browser.assert.localStorage.not.length(1);
        }, `Expected localStorage not to have 1 item.`);
    });

    it("Storage Not Length Throws Custom Message", async() => {
        await utils.assertThrowsAssertionAsync(async () => {
            await browser.assert.localStorage.not.length(1, "not length fails");
        }, "not length fails");
    });

    it("Storage Not Empty", async() => {
        await browser.assert.localStorage.not.empty();
    });

    it("Storage Not Empty Throws", async() => {
        await utils.assertThrowsAssertionAsync(async () => {
            await browser.localStorage.clear();
            await browser.assert.localStorage.not.empty();
        }, `Expected localStorage not to be empty.`);
    });

    it("Storage Not Empty Throws Custom Message", async() => {
        await utils.assertThrowsAssertionAsync(async () => {
            await browser.localStorage.clear();
            await browser.assert.localStorage.not.empty("not empty fails");
        }, `not empty fails`);
    });
});
