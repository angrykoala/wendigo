"use strict";

const Wendigo = require('../../lib/wendigo');
const configUrls = require('../config.json').urls;
const utils = require('../test_utils');

describe("Type", function() {
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

    it("Type", async() => {
        await browser.type("input.input1", "firstText");
        await browser.assert.value("input.input1", "firstText");
    });
    it("Type With Existing Text", async() => {
        await browser.type("input.input2", "secondText");
        await browser.assert.value("input.input2", "secondTextdefault value");
    });

    it("Type Multiple Elements", async() => {
        await browser.type("input", "firstText");
        await browser.assert.value("input.input1", "firstText");
        await browser.assert.value("input.input2", "default value");
    });

    it("Type Node", async() => {
        const node = await browser.query("input.input1");

        await browser.type(node, "firstText");
        await browser.assert.value("input.input1", "firstText");
    });

    it("Type Invalid Selector", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.type({}, "firstText");
        }, `FatalError: Invalid selector on "browser.type".`);
    });

    it("Type With Keypress Event", async() => {
        await browser.type(".input1", "dontpanic");
        await browser.assert.text("#value-input", "c");
    });

    it("KeyPress", async() => {
        await browser.click(".input1");
        await browser.keyPress("KeyA");
        await browser.assert.value(".input1", "a");
        await browser.assert.text("#value-input", "a");
    });

    it("KeyPress Multiple Keys", async() => {
        await browser.click(".input1");
        await browser.keyPress(["KeyA", "KeyB", "KeyC"]);
        await browser.assert.value(".input1", "abc");
        await browser.assert.text("#value-input", "c");
    });

    it("KeyPress Invalud Input", async() => {
        await browser.click(".input1");
        await utils.assertThrowsAsync(async() => {
            await browser.keyPress("NotAKey");
        }, `Error: Could not press keys "NotAKey"`);
    });

    it("KeyPress Count", async() => {
        await browser.click(".input1");
        await browser.keyPress("KeyA", 5);
        await browser.assert.value(".input1", "aaaaa");
        await browser.assert.text("#value-input", "a");
    });

    it("KeyPress Multiple Keys Count", async() => {
        await browser.click(".input1");
        await browser.keyPress(["KeyA", "KeyB", "KeyC"], 2);
        await browser.assert.value(".input1", "abcabc");
        await browser.assert.text("#value-input", "c");
    });

    it("KeyPress Count Zero", async() => {
        await browser.click(".input1");
        await browser.keyPress("KeyA", 0);
        await browser.assert.value(".input1", "");
    });
});
