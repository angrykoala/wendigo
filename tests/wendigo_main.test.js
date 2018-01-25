"use strict";

const assert = require('assert');
const Wendigo = require('../lib/wendigo'); // Load from package.json


describe("Wendigo Main", () => {

    it("Wendigo Load", () => {
        assert(Wendigo);
        assert(Wendigo.createBrowser);
        assert(Wendigo.stop);
    });

    it("Wendigo Create Browser", async () => {
        assert(Wendigo.createBrowser);
        const browser = await Wendigo.createBrowser();
        assert(browser);
        assert(browser.page);
        assert(browser.assert);
        assert(Wendigo.instance);
    });

    it("Wendigo Stop", async () => {
        await Wendigo.stop();
        assert.strictEqual(Wendigo.instance, null);
        await Wendigo.stop();
    });

});
