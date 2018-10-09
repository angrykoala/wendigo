"use strict";

const isClass = require('is-class');
const mix = require('mixwith').mix;
const compose = require('compositer');
const BrowserCore = require('./browser_core');
const BrowserAssertion = require('./modules/assertions/browser_assertions');
// const BrowserModule = require('./modules/browser_module');
// const {FatalError} = require('./errors');

const mixins = [
    require("./mixins/browser_actions"),
    require("./mixins/browser_info"),
    require("./mixins/browser_navigation"),
    require("./mixins/browser_queries"),
    require("./mixins/browser_wait")
];

module.exports = class BrowserFactory {
    static createBrowser(page, settings, plugins) {
        if (!this._BrowserClass) this._BrowserClass = this._createBrowserClass(plugins);
        const browser = new this._BrowserClass(page, settings);
        return browser;
    }

    static clearCache() {
        this._BrowserClass = undefined;
    }

    static _createBrowserClass(plugins) {
        const BaseClass = this._createBrowserMixin();
        return this._setupBrowserPlugins(BaseClass, plugins);
    }

    static _setupBrowserPlugins(BaseClass, plugins) {
        const components = {};
        const assertComponents = {};
        for (const p of plugins) {
            if (p.plugin) {
                components[p.name] = p.plugin;
            }
            if (p.assertions) {
                assertComponents[p.name] = this._setupAssertionModule(p.assertions, p.name);
            }
        }
        const AssertModule = compose(BrowserAssertion, assertComponents);
        const finalComponents = Object.assign({}, components, {"assert": AssertModule});
        return compose(BaseClass, finalComponents);
    }

    static _createBrowserMixin() {
        return class Browser extends mix(BrowserCore).with(...mixins) {
        };
    }

    static _setupAssertionModule(AssertionPlugin, name) {
        if (isClass(AssertionPlugin)) {
            return this._setupAssertionClass(AssertionPlugin, name);
        } else {
            return this._setupAssertionFunction(AssertionPlugin, name);
        }
    }

    static _setupAssertionFunction(assertionFunction, name) {
        return function(assertionModule, ...params) {
            const browser = assertionModule._browser;
            return assertionFunction(browser, browser[name], ...params);
        };
    }

    static _setupAssertionClass(AssertionClass, name) {
        return class extends AssertionClass {
            constructor(assertionModule) {
                const browser = assertionModule._browser;
                super(browser, browser[name]);
            }
        };
    }
};
