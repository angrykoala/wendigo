"use strict";

const FactoryCore = require('./factory_core');
const BrowserAssertion = require('../modules/assertions/browser_assertions');

module.exports = class AssertionFactory extends FactoryCore {
    static createAssertionComponent(browser, components) {
        const browserAssertions = new BrowserAssertion(browser);
        this.addComponents(browserAssertions, components, browser);
        return browserAssertions;
    }

};
