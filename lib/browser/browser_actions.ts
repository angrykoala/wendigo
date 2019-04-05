import { Base64ScreenShotOptions } from 'puppeteer';
import DomElement from '../models/dom_element';
import { promiseSerial } from '../utils/utils';
import { QueryError, WendigoError } from '../errors';
import BrowserQueries from './browser_queries';
import { CssSelector, WendigoSelector } from '../types';

export default abstract class BrowserActions extends BrowserQueries {
    public type(selector: CssSelector | DomElement, text: string, options: { delay?: number } = {}): Promise<void> {
        this.failIfNotLoaded("type");
        if (typeof text !== "string") return Promise.reject(new WendigoError("type", `Invalid text.`));
        if (typeof selector === "string") {
            return this.page.type(selector, text, { delay: options.delay || 0 });
        } else if (selector instanceof DomElement) {
            return selector.element.type(text);
        } else return Promise.reject(new WendigoError("type", `Invalid selector.`));
    }

    public async keyPress(key: Array<string> | string, count: number = 1): Promise<void> {
        this.failIfNotLoaded("keyPress");
        if (!Array.isArray(key)) key = [key];
        const funcs = key.map(k => () => this.page.keyboard.press(k));
        let funcsFinal: Array<() => Promise<any>> = [];
        for (let i = 0; i < count; i++) {
            funcsFinal = funcsFinal.concat(funcs);
        }

        try {
            await promiseSerial(funcsFinal);
        } catch (err) {
            return Promise.reject(new WendigoError("keyPress", `Could not press keys "${key.join(", ")}"`));
        }
    }

    public async uploadFile(selector: WendigoSelector, path: string): Promise<void> {
        this.failIfNotLoaded("uploadFile");
        return this.query(selector).then(fileInput => {
            if (fileInput) {
                return fileInput.element.uploadFile(path);
            } else {
                const error = new QueryError("uploadFile", `Selector "${selector}" doesn't match any element to upload file.`);
                return Promise.reject(error);
            }
        });
    }

    public async select(selector: CssSelector, values: Array<string> | string): Promise<void> {
        this.failIfNotLoaded("select");
        if (!Array.isArray(values)) values = [values];
        try {
            await this.page.select(selector, ...values);
        } catch (err) {
            throw new QueryError("select", `Element "${selector}" not found.`);
        }
    }

    public clearValue(selector: WendigoSelector): Promise<void> {
        this.failIfNotLoaded("clearValue");
        return this.evaluate((q) => {
            const elements = WendigoUtils.queryAll(q) as Array<HTMLInputElement>;
            for (const element of elements) {
                element.value = "";
            }
        }, selector);
    }

    public async setValue(selector: WendigoSelector, value: any): Promise<void> {
        this.failIfNotLoaded("setValue");
        try {
            await this.evaluate((q, v) => {
                const elements = WendigoUtils.queryAll(q) as Array<HTMLInputElement>;
                if (elements.length === 0) return Promise.reject();
                for (const element of elements) {
                    element.value = v;
                }
                return elements.length;
            }, selector, value);
        } catch (err) {
            throw new QueryError("setValue", `Element "${selector}" not found.`);
        }
    }

    public async check(selector: WendigoSelector): Promise<void> {
        this.failIfNotLoaded("check");
        try {
            await this.evaluate((q) => {
                const element = WendigoUtils.queryElement(q) as HTMLInputElement;
                if (!element) return Promise.reject();
                element.checked = true;
                return Promise.resolve();
            }, selector);
        } catch (err) {
            throw new QueryError("check", `Element "${selector}" not found.`);
        }
    }

    public async uncheck(selector: WendigoSelector): Promise<void> {
        this.failIfNotLoaded("uncheck");
        try {
            await this.evaluate((q) => {
                const element = WendigoUtils.queryElement(q) as HTMLInputElement;
                if (!element) return Promise.reject();
                element.checked = false;
                return Promise.resolve();
            }, selector);
        } catch (err) {
            throw new QueryError("uncheck", `Element "${selector}" not found.`);
        }
    }

    public async focus(selector: CssSelector): Promise<void> {
        this.failIfNotLoaded("focus");
        try {
            await this.page.focus(selector);
        } catch (err) {
            throw new QueryError("focus", `Element "${selector}" not found.`);
        }
    }

    public async hover(selector: CssSelector): Promise<void> {
        this.failIfNotLoaded("hover");
        try {
            await this.page.hover(selector);
        } catch (err) {
            throw new QueryError("hover", `Element "${selector}" not found.`);
        }
    }

    public async scroll(value: number, xvalue?: number): Promise<void> {
        this.failIfNotLoaded("scroll");
        try {
            await this.evaluate((val, xval) => {
                if (typeof val === 'number') {
                    if (typeof xval !== 'number') xval = window.scrollX;
                    window.scroll(xval, val);
                } else {
                    const element = WendigoUtils.queryElement(val);
                    element.scrollIntoView();
                }
            }, value, xvalue);
        } catch (err) {
            return Promise.reject(new QueryError("scroll", `Selector "${value}" doesn't match any element to scroll.`));
        }
    }

    public screenshot(args?: Base64ScreenShotOptions): Promise<string | Buffer> {
        this.failIfNotLoaded("screenshot");
        return this.page.screenshot(args);
    }

    public async screenshotOfElement(selector: WendigoSelector, options?: Base64ScreenShotOptions): Promise<string | Buffer> {
        this.failIfNotLoaded("screenshotOfElement");
        const element = await this.query(selector);
        if (!element) throw new QueryError("screenshotOfElement", `Selector "${selector}" not found.`);
        return element.element.screenshot(options);
    }

    public async blur(selector: WendigoSelector): Promise<void> {
        this.failIfNotLoaded("selector");
        try {
            return this.evaluate((q) => {
                const element = WendigoUtils.queryElement(q);
                element.blur();
            }, selector);
        } catch (err) {
            throw new QueryError("blur", `Element "${selector}" not found.`);
        }
    }

    // async dragAndDrop(from, to) {
    //     const fromElement = await this.query(from);
    //     const toElement = await this.query(to);
    //     const boxFrom = await fromElement.element.boundingBox();
    //     const boxTo = await toElement.element.boundingBox();
    //     const mouse = this.page.mouse;
    //     await mouse.up();
    //     await mouse.move(boxFrom.x + (boxFrom.width / 2), boxFrom.y + (boxFrom.height / 2));
    //     await mouse.down();
    //     await mouse.move(boxTo.x + (boxTo.width / 2), boxTo.y + (boxTo.height / 2));
    //     await mouse.up();
    // }
}
