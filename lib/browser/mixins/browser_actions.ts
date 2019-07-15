
import BrowserQueries from './browser_queries';

import { arrayfy, isXPathQuery } from '../../utils/utils';
import { QueryError, WendigoError } from '../../errors';
import { WendigoSelector } from '../../types';
import DOMELement from '../../models/dom_element';
import FailIfNotLoaded from '../../decorators/fail_if_not_loaded';
import { Base64ScreenShotOptions } from '../puppeteer_wrapper/puppeteer_types';

// Mixin with user actions
export default abstract class BrowserActions extends BrowserQueries {

    @FailIfNotLoaded
    public async type(selector: WendigoSelector, text: string, options?: { delay: number }): Promise<void> {
        if (typeof text !== "string") return Promise.reject(new WendigoError("type", `Invalid text.`));
        const element = await this.query(selector);
        if (!element) throw new QueryError("type", `Element "${selector}" not found.`);
        await element.type(text, options);
    }

    @FailIfNotLoaded
    public async keyPress(key: Array<string> | string, count: number = 1): Promise<void> {
        const keys = arrayfy(key);

        try {
            for (let i = 0; i < count; i++) {
                for (const k of keys) {
                    await this._page.keyboard.press(k);
                }
            }
        } catch (err) {
            return Promise.reject(new WendigoError("keyPress", `Could not press keys "${keys.join(", ")}"`));
        }
    }

    @FailIfNotLoaded
    public async uploadFile(selector: WendigoSelector, path: string): Promise<void> {
        return this.query(selector).then(fileInput => {
            if (fileInput) {
                return fileInput.element.uploadFile(path);
            } else {
                const error = new QueryError("uploadFile", `Selector "${selector}" doesn't match any element to upload file.`);
                return Promise.reject(error);
            }
        });
    }

    @FailIfNotLoaded
    public async select(selector: WendigoSelector, values: Array<string> | string): Promise<Array<string>> {
        if (!Array.isArray(values)) values = [values];
        try {
            let cssPath: string;
            // Native select only support css selectors
            if (selector instanceof DOMELement || isXPathQuery(selector)) {
                const element = await this.query(selector);
                if (!element) throw new Error();
                cssPath = await this.findCssPath(element);
            } else cssPath = selector;
            return await this._page.select(cssPath, ...values);
        } catch (err) {
            throw new QueryError("select", `Element "${selector}" not found.`);
        }
    }

    @FailIfNotLoaded
    public clearValue(selector: WendigoSelector): Promise<void> {
        return this.evaluate((q) => {
            const elements = WendigoUtils.queryAll(q) as Array<HTMLInputElement>;
            for (const element of elements) {
                element.value = "";
            }
        }, selector);
    }

    @FailIfNotLoaded
    public async setValue(selector: WendigoSelector, value: any): Promise<number> {
        try {
            return await this.evaluate((q, v) => {
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

    @FailIfNotLoaded
    public async check(selector: WendigoSelector): Promise<void> {
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

    @FailIfNotLoaded
    public async uncheck(selector: WendigoSelector): Promise<void> {
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

    @FailIfNotLoaded
    public async focus(selector: WendigoSelector): Promise<void> {
        const element = await this.query(selector);
        if (!element) throw new QueryError("focus", `Element "${selector}" not found.`);
        else {
            await element.focus();
        }
    }

    @FailIfNotLoaded
    public async hover(selector: WendigoSelector): Promise<void> {
        const element = await this.query(selector);
        if (!element) throw new QueryError("hover", `Element "${selector}" not found.`);
        await element.hover();
    }

    @FailIfNotLoaded
    public async scroll(value: number, xvalue?: number): Promise<void> {
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

    @FailIfNotLoaded
    public screenshot(args?: Base64ScreenShotOptions): Promise<string | Buffer> {
        return this._page.screenshot(args);
    }

    @FailIfNotLoaded
    public async screenshotOfElement(selector: WendigoSelector, options?: Base64ScreenShotOptions): Promise<string | Buffer> {
        const element = await this.query(selector);
        if (!element) throw new QueryError("screenshotOfElement", `Selector "${selector}" not found.`);
        return element.element.screenshot(options);
    }

    @FailIfNotLoaded
    public async blur(selector: WendigoSelector): Promise<void> {
        try {
            const result = await this.evaluate((q) => {
                const element = WendigoUtils.queryElement(q);
                element.blur();
            }, selector);
            return result;
        } catch (err) {
            throw new QueryError("blur", `Element "${selector}" not found.`);
        }
    }

    // public async dragAndDrop(from: WendigoSelector, to: WendigoSelector): Promise<void> {
    //     const fromElement = await this.query(from);
    //     const toElement = await this.query(to);
    //     if (!fromElement || !toElement) throw new QueryError("dragAndDrop", `Elements "${from} and ${to} not found."`);
    //     const boxFrom = await fromElement.element.boundingBox();
    //     const boxTo = await toElement.element.boundingBox();
    //     if (!boxFrom || !boxTo) throw new FatalError("dragAndDrop", "Bounding box not found");
    //     const mouse = this._page.mouse;
    //     await mouse.up();
    //     await mouse.move(boxFrom.x + (boxFrom.width / 2), boxFrom.y + (boxFrom.height / 2));
    //     await mouse.down();
    //     await mouse.move(boxTo.x + (boxTo.width / 2), boxTo.y + (boxTo.height / 2));
    //     await mouse.up();
    // }
}
