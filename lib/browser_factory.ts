import * as compose from 'compositer';
import { Page } from 'puppeteer';
import { isClass } from './utils/utils';

import Browser from './browser/browser';
import BrowserAssertion from './browser/browser_assertions';
import { FinalBrowserSettings, PluginModule } from './types';
import { FatalError } from './errors';
import BrowserInterface from './browser/browser_interface';

export default class BrowserFactory {
    private static browserClass?: typeof Browser;

    public static createBrowser(page: Page, settings: FinalBrowserSettings, plugins: Array<PluginModule>): BrowserInterface {
        if (!this.browserClass) {
            this.setupBrowserClass(plugins);
        }
        if (!this.browserClass) throw new FatalError("BrowserFactory", "Error on setupBrowserClass");
        return new this.browserClass(page, settings) as BrowserInterface;
    }

    public static clearCache(): void {
        this.browserClass = undefined;
    }

    private static setupBrowserClass(plugins: Array<PluginModule>): void {
        const components: { [s: string]: any } = {};
        const assertComponents: { [s: string]: any } = {};

        for (const p of plugins) {
            if (p.plugin) {
                components[p.name] = p.plugin;
            }
            if (p.assertions) {
                assertComponents[p.name] = this._setupAssertionModule(p.assertions, p.name);
            }
        }

        const assertionClass = compose(BrowserAssertion, assertComponents);
        const finalComponents = Object.assign({}, components, { assert: assertionClass });
        this.browserClass = compose(Browser, finalComponents) as typeof Browser;
    }

    private static _setupAssertionModule(assertionPlugin: any, name: string): any { // TODO: improve typing
        if (isClass(assertionPlugin)) {
            return this._setupAssertionClass(assertionPlugin, name);
        } else if (typeof assertionPlugin === 'function') {
            return this._setupAssertionFunction(assertionPlugin, name);
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
                super(assertionModule._browser, (assertionModule._browser as any)[name]);
            }
        };
    }
}
