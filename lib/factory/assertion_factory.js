"use strict";

const FactoryCore = require('./factory_core');
const BrowserAssertion = require('../modules/assertions/browser_assertions');


const components = {
    "not": require('../modules/assertions/browser_not_assertions'),
    "localStorage": require('../modules/assertions/local_storage_assertions')
};

module.exports = class AssertionFactory extends FactoryCore {
    static createAssertionComponent(browser) {
        const browserAssertions = new BrowserAssertion(browser);
        this.addComponents(browserAssertions, components, browser);
        return browserAssertions;
    }

};
