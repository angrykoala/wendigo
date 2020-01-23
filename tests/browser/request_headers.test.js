"use strict";

const Wendigo = require('../..');
const assert = require('assert');
const configUrls = require('../config.json').urls;

describe("Request Headers", function() {
    this.timeout(5000);

    let browser;
    beforeEach(async() => {
        browser = await Wendigo.createBrowser();
    });

    after(async() => {
        await browser.close();
    });

    it("Get Headers Without Setup", async() => {
        await browser.open(configUrls.headers);
        const headers = JSON.parse(await browser.text("p"));
        assert.strictEqual(headers.authorization, undefined);
        assert.strictEqual(headers.custom, undefined);
        assert.ok(headers.accept);
    });

    it("Get Headers Using Auth", async() => {
        await browser.auth.http({
            user: "arthur",
            password: "dent"
        });
        await browser.open(configUrls.headers);
        const headers = JSON.parse(await browser.text("p"));
        assert.strictEqual(headers.authorization, "Basic YXJ0aHVyOmRlbnQ=");
        assert.strictEqual(headers.custom, undefined);
        assert.ok(headers.accept);
    });

    it("SetHeaders Method", async() => {
        await browser.requests.setHeaders({
            custom: "dontpanic"
        });
        await browser.open(configUrls.headers);

        const headers = JSON.parse(await browser.text("p"));
        assert.strictEqual(headers.authorization, undefined);
        assert.strictEqual(headers.custom, "dontpanic");
        assert.ok(headers.accept);
    });

    it("RequestHeaders Option", async() => {
        await browser.open(configUrls.headers, {
            headers: {
                custom: "dontpanic"
            }
        });

        const headers = JSON.parse(await browser.text("p"));
        assert.strictEqual(headers.authorization, undefined);
        assert.strictEqual(headers.custom, "dontpanic");
        assert.ok(headers.accept);
    });

    it("SetRequestHeaders Method With Auth", async() => {
        await browser.requests.setHeaders({
            custom: "dontpanic"
        });

        await browser.auth.http({
            user: "arthur",
            password: "dent"
        });
        await browser.open(configUrls.headers);
        const headers = JSON.parse(await browser.text("p"));
        assert.strictEqual(headers.authorization, "Basic YXJ0aHVyOmRlbnQ=");
        assert.strictEqual(headers.custom, "dontpanic");
        assert.ok(headers.accept);
    });

    it("SetRequestHeaders Method With Auth Before", async() => {
        await browser.auth.http({
            user: "arthur",
            password: "dent"
        });

        await browser.requests.setHeaders({
            custom: "dontpanic"
        });
        await browser.open(configUrls.headers);
        const headers = JSON.parse(await browser.text("p"));
        assert.strictEqual(headers.authorization, "Basic YXJ0aHVyOmRlbnQ=");
        assert.strictEqual(headers.custom, "dontpanic");
        assert.ok(headers.accept);
    });

    it("Clear Extra Http Headers", async() => {
        await browser.requests.setHeaders({
            custom: "dontpanic"
        });

        await browser.auth.http({
            user: "arthur",
            password: "dent"
        });
        await browser.open(configUrls.headers);
        await browser.requests.setHeaders();
        await browser.open(configUrls.headers);

        const headers = JSON.parse(await browser.text("p"));
        assert.strictEqual(headers.authorization, "Basic YXJ0aHVyOmRlbnQ=");
        assert.strictEqual(headers.custom, undefined);
        assert.ok(headers.accept);
    });
});
