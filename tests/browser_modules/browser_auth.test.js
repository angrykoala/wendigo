"use strict";

// const assert = require('assert');
const Wendigo = require('../..');
const configUrls = require('../config.json').urls;
// const utils = require('../test_utils');

describe.only("Auth", function() {
    this.timeout(5000);
    let browser;

    before(async() => {
        browser = await Wendigo.createBrowser({log: true});
    });

    beforeEach(async() => {
        await browser.open(configUrls.auth);
        await browser.auth.clear();
    });


    after(async() => {
        await browser.close();
    });

    it("No Auth", async() => {
        await browser.click(".auth-btn");
        await browser.requests.waitForNextResponse("http://localhost:3456/auth");
        await browser.assert.text(".auth-res", JSON.stringify({
            httpAuth: null,
            authHeader: null
        }));
    });


    describe("Http Auth", () => {
        it("Set Http Auth", async() => {
            await browser.auth.http({
                user: "arthur",
                password: "dent"
            });
            await browser.click(".auth-btn");
            await browser.requests.waitForNextResponse("http://localhost:3456/auth");
            await browser.assert.text(".auth-res", JSON.stringify({
                httpAuth: {
                    name: "arthur",
                    pass: "dent"
                },
                authHeader: "Basic YXJ0aHVyOmRlbnQ="
            }));
        });
        it("Set Http Auth To Empty", async() => {
            await browser.auth.http({
                user: "arthur",
                password: "dent"
            });
            await browser.auth.http();
            await browser.click(".auth-btn");
            await browser.requests.waitForNextResponse("http://localhost:3456/auth");
            await browser.assert.text(".auth-res", JSON.stringify({
                httpAuth: null,
                authHeader: null
            }));
        });

        it("Open Does Not Clear Auth", async() => {
            await browser.auth.http({
                user: "arthur",
                password: "dent"
            });
            await browser.open(configUrls.auth);
            await browser.click(".auth-btn");
            await browser.requests.waitForNextResponse("http://localhost:3456/auth");
            await browser.assert.text(".auth-res", JSON.stringify({
                httpAuth: {
                    name: "arthur",
                    pass: "dent"
                },
                authHeader: "Basic YXJ0aHVyOmRlbnQ="
            }));
        });

        it("Clear Auth", async() => {
            await browser.auth.http({
                user: "arthur",
                password: "dent"
            });
            await browser.auth.clear();
            await browser.click(".auth-btn");
            await browser.requests.waitForNextResponse("http://localhost:3456/auth");
            await browser.assert.text(".auth-res", JSON.stringify({
                httpAuth: null,
                authHeader: null
            }));
        });
    });

    describe("Bearer Token", () => {
        it("Set Bearer Token", async() => {
            await browser.auth.bearer("my-token");
            await browser.click(".auth-btn");
            await browser.requests.waitForNextResponse("http://localhost:3456/auth");
            await browser.assert.text(".auth-res", JSON.stringify({
                httpAuth: null,
                authHeader: "Bearer my-token"
            }));
        });

        it("Set Bearer Token To Empty", async() => {
            await browser.auth.bearer("my-token");
            await browser.auth.bearer();
            await browser.click(".auth-btn");
            await browser.requests.waitForNextResponse("http://localhost:3456/auth");
            await browser.assert.text(".auth-res", JSON.stringify({
                httpAuth: null,
                authHeader: null
            }));
        });
    });

    describe("JWT Token", () => {
        it("Set JWT Token");
    });
    describe("Cookie Auth", () => {
        it("Set Cookie Auth");
    });
});
