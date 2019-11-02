"use strict";

const assert = require('assert');
const sinon = require('sinon');
const Wendigo = require('../..');
const configUrls = require('../config.json').urls;


describe("Log Requests Option", function() {
    this.timeout(5000);
    let browser;

    afterEach(() => {
        sinon.restore();
    });


    it("Output Requests To Stdout", async() => {
        browser = await Wendigo.createBrowser({
            logRequests: true
        });

        const logStub = sinon.stub(console, "log");
        await browser.open(configUrls.simple);
        await browser.close();

        const stubCalls = logStub.getCalls();
        logStub.restore();
        assert.ok(/\[.+\] GET http:\/\/localhost:3456\/html_simple\.html 200/.test(stubCalls[0].args[0]));
        assert.ok(logStub.calledOnce);
    });

    it("No Log To Stdout", async() => {
        browser = await Wendigo.createBrowser({
            logRequests: false
        });

        const logStub = sinon.stub(console, "log");
        await browser.open(configUrls.simple);
        await browser.close();

        assert.ok(logStub.notCalled);
    });
});
