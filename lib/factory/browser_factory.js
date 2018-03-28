"use strict";

const mix = require('../mix');
const BrowserCore = require('../browser_core');
const AssertionFactory = require('./assertion_factory');
const FactoryCore = require('./factory_core');

const mixins = [
    require("../mixins/browser_base_mixin"),
    require("../mixins/browser_mixin")
];

const components = {
    "cookies": require('../modules/browser_cookies'),
    "localStorage": require('../modules/browser_local_storage')
};

module.exports = class BrowserFactory extends FactoryCore {
    static createBrowser(page, settings) {
        const browser = new this.Browser(page, settings);
        this.addComponents(browser, components);
        const assertionModule = AssertionFactory.createAssertionComponent(browser);
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
