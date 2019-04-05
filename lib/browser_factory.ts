import * as isClass from 'is-class';
import * as compose from 'compositer';
import { Page } from 'puppeteer';

import Browser from './browser/browser';
import { FinalBrowserSettings, WendigoPluginInterface } from './types';
import BrowserAssertion from './modules/assertions/browser_assertions';
import BrowserNotAssertions from './modules/assertions/browser_not_assertions';

export default class BrowserFactory {
    private static browserClass?: typeof Browser;

    public static createBrowser(page: Page, settings: FinalBrowserSettings, plugins: Array<WendigoPluginInterface>): Browser {
        if (!this.browserClass) this.browserClass = this.createBrowserClass(plugins);
        return new this.browserClass(page, settings, []);
    }

    public static clearCache(): void {
        this.browserClass = undefined;
    }

    private static createBrowserClass(plugins: Array<WendigoPluginInterface>): typeof Browser { // TODO: improve plugin type
        return this.setupBrowserPlugins(Browser, plugins);
    }

    private static setupBrowserPlugins(baseClass: typeof Browser, plugins: Array<WendigoPluginInterface>): typeof Browser {
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

        const notAssertModule = compose(BrowserNotAssertions, notAssertFunctions);
        assertComponents.not = notAssertModule;
        const assertModule = compose(BrowserAssertion, assertComponents);
        const finalComponents = Object.assign({}, components, { assert: assertModule });
        return compose(baseClass, finalComponents);
    }

    private static _setupAssertionModule(assertionPlugin: any, name: string): any { // TODO: improve typing
        if (isClass(assertionPlugin)) {
            return this._setupAssertionClass(assertionPlugin, name);
        } else if (typeof assertionPlugin === 'function') {
            return this._setupAssertionFunction(assertionPlugin, name);
        } else if (typeof assertionPlugin.assert === 'function') {
            return this._setupAssertionFunction(assertionPlugin.assert, name);
        } else {
            return null;
        }
    }

    private static _setupAssertionFunction(assertionFunction: (...params: Array<any>) => any, name: string): (...params: Array<any>) => any {
        return function(assertionModule, ...params: Array<any>): Promise<void> {
            const browser = assertionModule._browser;
            return assertionFunction(browser, browser[name], ...params);
        };
    }

    private static _setupAssertionClass(assertionClass: any, name: string): any {
        return class extends assertionClass {
            constructor(assertionModule: any) {
                const browser = assertionModule._browser;
                super(browser, browser[name]);
            }
        };
    }
}
