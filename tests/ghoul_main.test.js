"use strict";

const assert = require('assert');
const Ghoul = require('../lib/ghoul'); // Load from package.json


describe("Ghoul Main", () => {

    it("Ghoul Load", () => {
        assert(Ghoul);
        assert(Ghoul.createBrowser);
        assert(Ghoul.stop);
    });
    it("Ghoul Create Browser", async () => {
        assert(Ghoul.createBrowser);
        const browser = await Ghoul.createBrowser();
        assert(browser);
        assert(browser.page);
        assert(browser.assert);
        assert(Ghoul.instance);
    });
    it("Ghoul Stop", async () => {
        await Ghoul.stop();
        assert.strictEqual(Ghoul.instance, null);
        await Ghoul.stop();
    });

});
