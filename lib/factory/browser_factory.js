"use strict";

const mix = require('../utils/mix');
const BrowserCore = require('../browser_core');
const AssertionFactory = require('./assertion_factory');
const FactoryCore = require('./factory_core');

const mixins = [
    require("../mixins/browser_actions"),
    require("../mixins/browser_info"),
    require("../mixins/browser_navigation"),
    require("../mixins/browser_queries"),
    require("../mixins/browser_setup"),
    require("../mixins/browser_wait")
];

module.exports = class BrowserFactory extends FactoryCore {
    static createBrowser(page, settings, components, assertComponents) {
        const browser = new this.Browser(page, settings);
        this.addComponents(browser, components);
        const assertionModule = AssertionFactory.createAssertionComponent(browser, assertComponents);
        this.attachModule(browser, "assert", assertionModule);
        return browser;
    }

    static get Browser() {
        if(!this._browser) {
            this._browser = this._createBrowserClass();
        }
        return this._browser;
    }

    static _createBrowserClass() {
        return class Browser extends mix(BrowserCore).with(...mixins) {
            constructor(page, settings) {
                super(page, settings);
            }
        };
    }
};
