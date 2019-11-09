import path from 'path';
import querystring from 'querystring';

import { stringifyLogText } from '../puppeteer_wrapper/puppeteer_utils';
import DomElement from '../models/dom_element';
import { FatalError, InjectScriptError } from '../errors';
import { FinalBrowserSettings, OpenSettings } from '../types';
import PuppeteerPage from '../puppeteer_wrapper/puppeteer_page';
import { ViewportOptions, ConsoleMessage, Page, Response, Frame, BrowserContext, Target } from '../puppeteer_wrapper/puppeteer_types';
import FailIfNotLoaded from '../decorators/fail_if_not_loaded';
import PuppeteerContext from '../puppeteer_wrapper/puppeteer_context';
import OverrideError from '../decorators/override_error';

import WendigoUtilsLoader from '../../injection_scripts/selector_query';
import SelectorQueryLoader from '../../injection_scripts/wendigo_utils';
import SelectorFinderLoader from '../../injection_scripts/selector_finder';

async function pageLog(log?: ConsoleMessage): Promise<void> {
    if (log) {
        const text = await stringifyLogText(log);
        let logType = log.type() as string;
        if (logType === 'warning') logType = 'warn';
        const con = console as any;
        if (!(con[logType])) logType = 'log';
        con[logType](text);
    }
}

const defaultOpenOptions: OpenSettings = {
    viewport: {
        width: 1440,
        height: 900,
        isMobile: false
    }
};

export default abstract class BrowserCore {
    public initialResponse: Response | null;

    protected _page: PuppeteerPage;
    protected _context: PuppeteerContext;
    protected _originalHtml?: string;
    protected _settings: FinalBrowserSettings;

    private _loaded: boolean;
    private _disabled: boolean;
    private _components: Array<string>;
    private _cache: boolean;
    private _openSettings: OpenSettings = defaultOpenOptions;

    constructor(context: PuppeteerContext, page: PuppeteerPage, settings: FinalBrowserSettings, components: Array<string> = []) {
        this._page = page;
        this._context = context;
        this._settings = settings;
        this._loaded = false;
        this.initialResponse = null;
        this._disabled = false;
        this._cache = settings.cache !== undefined ? settings.cache : true;
        this._components = components;
        if (this._settings.log) {
            this._page.on("console", pageLog);
        }

        this._context.on('targetcreated', async (target: Target): Promise<void> => {
            const createdPage = await target.page();
            if (createdPage) {
                const puppeteerPage = new PuppeteerPage(createdPage);
                try {
                    await puppeteerPage.setBypassCSP(true);
                    if (this._settings.userAgent)
                        await puppeteerPage.setUserAgent(this._settings.userAgent);
                } catch (err) {
                    // Will fail if browser is closed before finishing
                }
            }
        });

        this._page.on('load', async (): Promise<void> => {
            if (this._loaded) {
                try {
                    await this._afterPageLoad();
                } catch (err) {
                    // Will fail if browser is closed
                }
            }
        });
    }

    public get page(): Page {
        return this._page.page;
    }

    public get context(): BrowserContext {
        return this._context.context;
    }

    public get loaded(): boolean {
        return this._loaded && !this._disabled;
    }

    public get incognito(): boolean {
        return Boolean(this._settings.incognito);
    }

    public get cacheEnabled(): boolean {
        return this._cache;
    }

    @OverrideError()
    public async open(url: string, options?: OpenSettings): Promise<void> {
        this._loaded = false;
        this._openSettings = Object.assign({}, defaultOpenOptions, options);
        url = this._processUrl(url);
        await this.setCache(this._cache);
        if (this._openSettings.queryString) {
            const qs = this._generateQueryString(this._openSettings.queryString);
            url = `${url}${qs}`;
        }
        try {
            await this._beforeOpen(this._openSettings);
            const response = await this._page.goto(url);
            this.initialResponse = response;
            return this._afterPageLoad();
        } catch (err) {
            if (err instanceof FatalError) return Promise.reject(err);
            return Promise.reject(new FatalError("open", `Failed to open "${url}". ${err.message}`));
        }
    }

    @OverrideError()
    public async openFile(filepath: string, options: OpenSettings): Promise<void> {
        const absolutePath = path.resolve(filepath);
        try {
            await this.open(`file://${absolutePath}`, options);
        } catch (err) {
            return Promise.reject(new FatalError("openFile", `Failed to open "${filepath}". File not found.`));
        }
    }

    @OverrideError()
    public async setContent(html: string): Promise<void> {
        this._loaded = false;
        await this.setCache(this._cache);
        try {
            await this._beforeOpen({});
            await this.page.setContent(html);
            return this._afterPageLoad();
        } catch (err) {
            if (err instanceof FatalError) return Promise.reject(err);
            return Promise.reject(new FatalError("setContent", `Failed to set content. ${err.message}`));
        }
    }

    public async close(): Promise<void> {
        if (this._disabled) return Promise.resolve();
        const p = this._beforeClose(); // Minor race condition with this._loaded if moved
        this._disabled = true;
        this._loaded = false;
        this.initialResponse = null;
        this._originalHtml = undefined;
        try {
            await p;
            await this._page.browser().close();
        } catch (err) {
            return Promise.reject(new FatalError("close", `Failed to close browser. ${err.message}`));
        }
    }

    @FailIfNotLoaded
    public async evaluate(cb: string | ((...args: Array<any>) => any), ...args: Array<any>): Promise<any> {
        args = this._setupEvaluateArguments(args);
        const rawResult = await this._page.evaluateHandle(cb, ...args);
        const resultAsElement = rawResult.asElement();
        if (resultAsElement) {
            return new DomElement(resultAsElement);
        } else return rawResult.jsonValue();
    }

    public async pages(): Promise<Array<Page>> {
        return this._context.pages();
    }

    @OverrideError()
    public async selectPage(index: number): Promise<void> {
        const page = await this._context.getPage(index);
        if (!page) throw new FatalError("selectPage", `Invalid page index "${index}".`);
        this._page = page;
        // TODO: Avoid reload
        // await this.page.reload(); // Required to enable bypassCSP
        await this._beforeOpen(this._openSettings);
        await this._afterPageLoad();
    }

    public async closePage(index: number): Promise<void> {
        const page = await this._context.getPage(index);
        if (!page) throw new FatalError("closePage", `Invalid page index "${index}".`);
        await page.close();
        try {
            await this.selectPage(0);
        } catch (err) {
            this.close();
        }
    }

    public setViewport(config: ViewportOptions = {}): Promise<void> {
        return this._page.setViewport(config);
    }

    public setTimezone(tz?: string): Promise<void> {
        return this._page.emulateTimezone(tz);
    }

    public frames(): Array<Frame> {
        return this._page.frames();
    }

    @FailIfNotLoaded
    public async mockDate(date: Date, options = { freeze: true }): Promise<void> {
        await this.evaluate((d: number, f: boolean) => {
            WendigoUtils.mockDate(d, f);
        }, date.getTime(), options.freeze);
    }

    @FailIfNotLoaded
    public clearDateMock(): Promise<void> {
        return this.evaluate(() => {
            WendigoUtils.clearDateMock();
        });
    }

    @FailIfNotLoaded
    public async addScript(scriptPath: string): Promise<void> {
        try {
            await this._page.addScriptTag({
                path: scriptPath
            });
        } catch (err) {
            if (err.message === "Evaluation failed: Event") {
                const cspWarning = "This may be caused by the page Content Security Policy. Make sure the option bypassCSP is set to true in Wendigo.";
                throw new InjectScriptError("addScript", `Error injecting scripts. ${cspWarning}`); // CSP error
            } else throw new InjectScriptError("addScript", err);
        }
    }

    public async setCache(value: boolean): Promise<void> {
        await this._page.setCache(value);
        this._cache = value;
    }

    protected async _beforeClose(): Promise<void> {
        this._settings.__onClose(this);
        if (!this._loaded) return Promise.resolve();
        await this._callComponentsMethod("_beforeClose");
    }

    protected async _beforeOpen(options: OpenSettings): Promise<void> {
        if (this._settings.userAgent) {
            await this._page.setUserAgent(this._settings.userAgent);
        }
        if (this._settings.bypassCSP) {
            await this._page.setBypassCSP(true);
        }
        await this.setViewport(options.viewport);
        await this._callComponentsMethod("_beforeOpen", options);
    }

    protected async _afterPageLoad(): Promise<void> {
        const content = await this._page.content();
        this._originalHtml = content;
        await this._addJsScripts();
        this._loaded = true;
        await this._callComponentsMethod("_afterOpen");
    }

    private async _addJsScripts(): Promise<void> {
        await Promise.all([
            this._page.evaluateHandle(WendigoUtilsLoader),
            this._page.evaluateHandle(SelectorQueryLoader),
            this._page.evaluateHandle(SelectorFinderLoader)
        ]);
    }

    private _setupEvaluateArguments(args: Array<any>): Array<any> {
        return args.map((e) => {
            if (e instanceof DomElement) return e.element;
            else return e;
        });
    }

    private async _callComponentsMethod(method: string, options?: any): Promise<void> {
        await Promise.all(this._components.map((c) => {
            const anyThis = this as any;
            if (typeof anyThis[c][method] === 'function')
                return anyThis[c][method](options);
        }));
    }

    private _generateQueryString(qs: string | { [s: string]: string; }): string {
        if (typeof qs === 'string') {
            if (qs[0] !== "?") qs = `?${qs}`;
            return qs;
        } else {
            return `?${querystring.stringify(qs)}`;
        }
    }

    private _processUrl(url: string): string {
        if (url.split("://").length === 1) {
            return `http://${url}`;
        } else return url;
    }
}
