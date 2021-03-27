import {
    ElementHandle, GeolocationOptions, PDFOptions, WaitForOptions,
    WebWorker, Browser, Cookie, Frame, HTTPResponse, JSHandle, Keyboard, MediaFeature, Mouse, Page, ScreenshotOptions,
    ScriptTagOptions, SerializableOrJSHandle, Touchscreen, Viewport, ViewportOptions, SetCookie, DeleteCookie, waitForOptions
} from './puppeteer_types';

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

    public goto(url: string): Promise<HTTPResponse | null> {
        return this.page.goto(url);
    }

    public browser(): Browser {
        return this.page.browser();
    }

    public frames(): Array<Frame> {
        return this.page.frames();
    }

    public close(): Promise<void> {
        return this.page.close();
    }

    public isClosed(): boolean {
        return this.page.isClosed();
    }

    public setViewport(config: ViewportOptions = {}): Promise<void> {
        const finalConfig = Object.assign({}, this.page.viewport(), config) as Viewport;
        return this.page.setViewport(finalConfig);
    }

    public on(eventName: string, cb: (msg: any) => void): void {
        this.page.on(eventName, cb);
    }

    public off(eventName: string, cb: (msg: any) => void): void {
        this.page.off(eventName, cb);
    }

    public evaluateHandle(cb: string | ((...args: any[]) => any), ...args: Array<SerializableOrJSHandle>): Promise<JSHandle> {
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

    public screenshot(args?: ScreenshotOptions): Promise<string | Buffer | void> {
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

    public async waitForNavigation(options?: WaitForOptions): Promise<void> {
        await this.page.waitForNavigation(options);
    }

    public async waitForXPath(xpath: string, options?: waitForOptions): Promise<void> {
        await this.page.waitForXPath(xpath, options)
    }

    public async waitForSelector(selector: string, options?: waitForOptions): Promise<void> {
        await this.page.waitForSelector(selector, options)
    }

    public async waitForFunction(func: Function | string, options?: {
        timeout?: number;
        polling?: string | number;
    }, ...args: Array<SerializableOrJSHandle>): Promise<void> {
        await this.page.waitForFunction(func, options, ...args)
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

    public workers(): Array<WebWorker> {
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

    public setExtraHTTPHeaders(headers: Record<string, string>): Promise<void> {
        return this.page.setExtraHTTPHeaders(headers);
    }

    public setContent(html: string): Promise<void> {
        return this.page.setContent(html);
    }

    public emulateTimezone(tz?: string): Promise<void> {
        return (this.page as any).emulateTimezone(tz); // TODO: remove any when types update
    }

    public setGeolocation(geolocation: GeolocationOptions): Promise<void> {
        return this.page.setGeolocation(geolocation);
    }

    public emulateMediaType(mediaType: string): Promise<void> {
        return this.page.emulateMediaType(mediaType);
    }

    public emulateMediaFeatures(mediaFeatures: Array<MediaFeature>): Promise<void> {
        return this.page.emulateMediaFeatures(mediaFeatures);
    }
}
