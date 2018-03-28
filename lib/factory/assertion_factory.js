"use strict";

const FactoryCore = require('./factory_core');
const BrowserAssertion = require('../modules/assertions/browser_assertions');


// const components = {
//     "not": "",
//     "localStorage"
// };

module.exports = class AssertionFactory extends FactoryCore {
    static createAssertionComponent(browser) {
        const browserAssertions = new BrowserAssertion(browser);
        // this.addComponents(browserAssertions, components);
        return browserAssertions;
    }

};
