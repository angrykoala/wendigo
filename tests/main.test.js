"use strict";

const Ghoul = require('../lib/ghoul');


describe("Main", () => {

    it("Basic page", async () => {
        const browser = await Ghoul.createBrowser();
        await browser.open("http://localhost:3456/index.html");

        const title = await browser.getElement("h1");
        const content = await browser.page.property('content');
        console.log(content);
        console.log("TITLE",title.textContent);
    });

});
