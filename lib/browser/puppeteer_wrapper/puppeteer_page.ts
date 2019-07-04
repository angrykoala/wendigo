import {
    Page, Frame, Viewport, EvaluateFn, SerializableOrJSHandle, JSHandle, Response, Worker,
    ScriptTagOptions, Browser, Base64ScreenShotOptions, Keyboard, Mouse, NavigationOptions, WaitForSelectorOptions, ElementHandle,
    Touchscreen, Cookie, SetCookie, DeleteCookie, PageEventObj, Request, Timeoutable, PDFOptions
} from 'puppeteer';
import { ViewportOptions } from './puppeteer_types';

export default class PuppeteerPage {
    public page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    public get keyboard(): Keyboard {
        return this.page.keyboard;
    }

    public get mouse(): Mouse {
        return this.page.mouse;
    }

    public get touchscreen(): Touchscreen {
        return this.page.touchscreen;
    }

    public goto(url: string): Promise<Response | null> {
        return this.page.goto(url);
    }

    public browser(): Browser {
        return this.page.browser();
    }

    public frames(): Array<Frame> {
        return this.page.frames();
    }

    public setViewport(config: ViewportOptions = {}): Promise<void> {
        const finalConfig = Object.assign({}, this.page.viewport(), config) as Viewport;
        return this.page.setViewport(finalConfig);
    }

    public on<K extends keyof PageEventObj>(eventName: K, cb: (msg: PageEventObj[K]) => Promise<void>): void {
        this.page.on(eventName, cb);
    }

    public evaluateHandle(cb: EvaluateFn, ...args: Array<SerializableOrJSHandle>): Promise<JSHandle> {
        return this.page.evaluateHandle(cb, ...args);
    }

    public async addScriptTag(options: ScriptTagOptions): Promise<void> {
        await this.page.addScriptTag(options);
    }

    public async setUserAgent(userAgent: string): Promise<void> {
        await this.page.setUserAgent(userAgent);
    }

    public async setBypassCSP(value: boolean): Promise<void> {
        await this.page.setBypassCSP(value);
    }

    public content(): Promise<string> {
        return this.page.content();
    }

    public screenshot(args?: Base64ScreenShotOptions): Promise<string | Buffer> {
        return this.page.screenshot(args);
    }

    public select(cssPath: string, ...values: Array<string>): Promise<Array<string>> {
        return this.page.select(cssPath, ...values);
    }

    public title(): Promise<string> {
        return this.page.title();
    }

    public async goBack(): Promise<void> {
        await this.page.goBack();
    }

    public async goForward(): Promise<void> {
        await this.page.goForward();
    }

    public async reload(): Promise<void> {
        await this.page.reload();
    }

    public async waitForNavigation(options?: NavigationOptions): Promise<void> {
        await this.page.waitForNavigation(options);
    }

    public async waitFor(selector: string | EvaluateFn, options?: WaitForSelectorOptions, ...args: Array<SerializableOrJSHandle>): Promise<void> {
        await this.page.waitFor(selector, options, ...args);
    }

    public waitForRequest(url: string, options?: Timeoutable): Promise<Request> {
        return this.page.waitForRequest(url, options);
    }

    public waitForResponse(url: string, options?: Timeoutable): Promise<Response> {
        return this.page.waitForResponse(url, options);
    }

    public $(selector: string): Promise<ElementHandle<Element> | null> {
        return this.page.$(selector);
    }

    public $x(selector: string): Promise<Array<ElementHandle<Element>>> {
        return this.page.$x(selector);
    }

    public $$(selector: string): Promise<Array<ElementHandle<Element>>> {
        return this.page.$$(selector);
    }

    public cookies(...urls: Array<string>): Promise<Array<Cookie>> {
        return this.page.cookies(...urls);
    }

    public setCookie(...cookies: Array<SetCookie>): Promise<void> {
        return this.page.setCookie(...cookies);
    }

    public deleteCookie(...cookies: Array<DeleteCookie>): Promise<void> {
        return this.page.deleteCookie(...cookies);
    }

    public workers(): Array<Worker> {
        return this.page.workers();
    }

    public setRequestInterception(b: boolean): Promise<void> {
        return this.page.setRequestInterception(b);
    }

    public pdf(options?: PDFOptions): Promise<Buffer> {
        return this.page.pdf(options);
    }

    public setCache(value: boolean): Promise<void> {
        return this.page.setCacheEnabled(value);
    }

    // public authenticate(options?: AuthOptions): Promise<void> {
    //     return this.page.authenticate(options || null);
    // }

    public setExtraHTTPHeaders(headers: Record<string, string>): Promise<void> {
        return this.page.setExtraHTTPHeaders(headers);
    }
}
