"use strict";

// const assert = require('assert');

const Ghoul = require('../lib/ghoul');
const utils = require('./utils');

describe("Assert", () => {
    let browser;
    beforeEach(async () => {
        browser = await Ghoul.createBrowser();
    });

    it("Exists", async () => {
        await browser.open("http://localhost:3456/index.html");
        await browser.assert.exists("h1");
        await browser.assert.exists(".container");
    });

    it("Exists Throws", async () => {
        await browser.open("http://localhost:3456/index.html");
        await utils.assertThrowsAsync(async () => {
            await browser.assert.exists("h2");
        });
        await utils.assertThrowsAsync(async () => {
            await browser.assert.exists(".not_container");
        });
    });

});
