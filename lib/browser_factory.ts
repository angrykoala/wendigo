import * as isClass from 'is-class';
import * as compose from 'compositer';
import { Page } from 'puppeteer';
import { BrowserSettings, WendigoPluginInterface } from './types';

import Browser from './browser/browser';
// const BrowserCore = require('./browser_core');
// const BrowserAssertion = require('./modules/assertions/browser_assertions');
// const BrowserNotAssertions = require('./modules/assertions/browser_not_assertions');

export default class BrowserFactory {
    private static browserClass?: typeof Browser;

    public static createBrowser(page: Page, settings: BrowserSettings, plugins: Array<WendigoPluginInterface>): Browser {
        if (!this.browserClass) this.browserClass = this.createBrowserClass(plugins);
        return new this.browserClass(page, settings);
    }

    public static clearCache(): void {
        this.browserClass = undefined;
    }

    private static createBrowserClass(plugins: Array<WendigoPluginInterface>): typeof Browser { // TODO: improve plugin type
        return this.setupBrowserPlugins(Browser, plugins);
    }

    private static setupBrowserPlugins(BaseClass: typeof Browser, plugins: Array<WendigoPluginInterface>) {
        const components: { [s: string]: any } = {};
        const assertComponents: { [s: string]: any } = {};
        const notAssertFunctions: { [s: string]: any } = {};
        for (const p of plugins) {
            if (p.plugin) {
                components[p.name] = p.plugin;
            }
            if (p.assertions) {
                assertComponents[p.name] = this._setupAssertionModule(p.assertions, p.name);
                if (typeof p.assertions.not === 'function') {
                    notAssertFunctions[p.name] = this._setupAssertionFunction(p.assertions.not, p.name);
                }
            }
        }

        const NotAssertModule = compose(BrowserNotAssertions, notAssertFunctions);
        assertComponents.not = NotAssertModule;
        const AssertModule = compose(BrowserAssertion, assertComponents);
        const finalComponents = Object.assign({}, components, { "assert": AssertModule });
        return compose(BaseClass, finalComponents);
    }

    private static _setupAssertionModule(AssertionPlugin, name) {
        if (isClass(AssertionPlugin)) {
            return this._setupAssertionClass(AssertionPlugin, name);
        } else if (typeof AssertionPlugin === 'function') {
            return this._setupAssertionFunction(AssertionPlugin, name);
        } else if (typeof AssertionPlugin.assert === 'function') {
            return this._setupAssertionFunction(AssertionPlugin.assert, name);
        }
    }

    private static _setupAssertionFunction(assertionFunction, name) {
        return function(assertionModule, ...params) {
            const browser = assertionModule._browser;
            return assertionFunction(browser, browser[name], ...params);
        };
    }

    private static _setupAssertionClass(AssertionClass, name) {
        return class extends AssertionClass {
            constructor(assertionModule) {
                const browser = assertionModule._browser;
                super(browser, browser[name]);
            }
        };
    }
}
