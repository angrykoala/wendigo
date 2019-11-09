"use strict";

const assert = require('assert');
const sinon = require('sinon');
const Wendigo = require('../..');
const configUrls = require('../config.json').urls;

async function generateTestLogs(browser) {
    await browser.open(configUrls.console);
    await browser.click(".log");
    await browser.click(".log");
    await browser.close();
}

describe("Log Option", function() {
    this.timeout(5000);
    let browser;
    const stubs = {};


    beforeEach(() => {
        stubs.log = sinon.stub(console, "log");
        stubs.info = sinon.stub(console, "info");
        stubs.error = sinon.stub(console, "error");
    });

    afterEach(() => {
        sinon.restore();
    });


    it("Output Log To Stdout", async() => {
        browser = await Wendigo.createBrowser({
            log: true
        });
        await generateTestLogs(browser);

        assert.ok(stubs.log.calledOnce);
        assert.ok(stubs.info.calledTwice);
        assert.ok(stubs.info.alwaysCalledWith("Info Log"));
        assert.ok(stubs.error.notCalled);
    });

    it("No Log To Stdout", async() => {
        browser = await Wendigo.createBrowser();
        await generateTestLogs(browser);

        assert.ok(stubs.log.notCalled);
        assert.ok(stubs.info.notCalled);
        assert.ok(stubs.error.notCalled);
    });
});
