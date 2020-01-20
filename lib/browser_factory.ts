import compose from 'compositer';
import isClass from 'is-class';

import Browser from './browser/browser';
import BrowserAssertion from './browser/browser_assertions';
import { FinalBrowserSettings, PluginModule } from './types';
import { FatalError } from './models/errors';
import BrowserInterface from './browser/browser_interface';
import PuppeteerContext from './puppeteer_wrapper/puppeteer_context';

export default class BrowserFactory {
    private static _browserClass?: typeof Browser;

    public static async createBrowser(context: PuppeteerContext, settings: FinalBrowserSettings, plugins: Array<PluginModule>): Promise<BrowserInterface> {
        if (!this._browserClass) {
            this._setupBrowserClass(plugins);
        }
        if (!this._browserClass) throw new FatalError("BrowserFactory", "Error on setupBrowserClass");

        const page = await context.getDefaultPage();
        return new this._browserClass(context, page, settings) as BrowserInterface;
    }

    public static clearCache(): void {
        this._browserClass = undefined;
    }

    private static _setupBrowserClass(plugins: Array<PluginModule>): void {
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
        this._browserClass = compose(Browser, finalComponents) as typeof Browser;
    }

    private static _setupAssertionModule(assertionPlugin: any, name: string): any {
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
