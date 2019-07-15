import BrowserClick from './browser_click';

import { QueryError } from '../../errors';
import { WendigoSelector } from '../../types';
import FailIfNotLoaded from '../../decorators/fail_if_not_loaded';
import { PDFOptions } from '../puppeteer_wrapper/puppeteer_types';

export default abstract class BrowserInfo extends BrowserClick {

    @FailIfNotLoaded
    public text(selector: WendigoSelector): Promise<Array<string>> {
        return this.evaluate((q) => {
            const elements = WendigoUtils.queryAll(q);
            const result = [];
            for (const e of elements) {
                result.push(e.textContent);
            }
            return result;
        }, selector);
    }

    @FailIfNotLoaded
    public title(): Promise<string> {
        return this._page.title();
    }

    @FailIfNotLoaded
    public html(): string {
        return this.originalHtml || "";
    }

    @FailIfNotLoaded
    public async url(): Promise<string | null> {
        let url = await this.evaluate(() => window.location.href);
        if (url === "about:blank") url = null;
        return url;
    }

    @FailIfNotLoaded
    public tag(selector: WendigoSelector): Promise<string | null> {
        return this.evaluate((q) => {
            const element = WendigoUtils.queryElement(q);
            if (!element) return null;
            else return element.tagName.toLowerCase();
        }, selector);
    }

    @FailIfNotLoaded
    public innerHtml(selector: WendigoSelector): Promise<Array<string>> {
        return this.evaluate((q) => {
            const elements = WendigoUtils.queryAll(q);
            return elements.map(e => e.innerHTML);
        }, selector);
    }

    @FailIfNotLoaded
    public elementHtml(selector: WendigoSelector): Promise<Array<string>> {
        return this.evaluate((q) => {
            const elements = WendigoUtils.queryAll(q);
            return elements.map(e => e.outerHTML);
        }, selector);
    }

    @FailIfNotLoaded
    public async options(selector: WendigoSelector): Promise<Array<string>> {
        try {
            return await this.evaluate((q) => {
                const element = WendigoUtils.queryElement(q) as HTMLSelectElement;
                if (!element) return Promise.reject();
                const options = element.options || [];
                const result = [];
                for (let i = 0; i < options.length; i++) {
                    result.push(options[i].value);
                }
                return result;
            }, selector);
        } catch (err) {
            throw new QueryError("options", `Element "${selector}" not found.`);
        }
    }

    @FailIfNotLoaded
    public async selectedOptions(selector: WendigoSelector): Promise<Array<string>> {
        try {
            const result = await this.evaluate((q) => {
                const elements = WendigoUtils.queryElement(q) as HTMLSelectElement;
                return Array.from(elements.options).filter((option) => {
                    return option.selected;
                }).map((option) => {
                    return option.value || option.text;
                });
            }, selector);
            return result;
        } catch (err) {
            throw new QueryError("selectedOptions", `Element "${selector}" not found.`);
        }
    }

    @FailIfNotLoaded
    public async class(selector: WendigoSelector): Promise<Array<string>> {
        try {
            const result = await this.evaluate((q) => {
                const element = WendigoUtils.queryElement(q);
                if (!element) throw new Error();
                else return Array.from(element.classList);
            }, selector);
            return result as Array<string>;
        } catch (err) {
            throw new QueryError("class", `Selector "${selector}" doesn't match any elements.`);

        }
    }

    @FailIfNotLoaded
    public async value(selector: WendigoSelector): Promise<string | null> {
        try {
            return await this.evaluate((q) => {
                const element = WendigoUtils.queryElement(q) as HTMLInputElement;
                if (!element) return Promise.reject();
                else if (element.value === undefined) return null;
                else return element.value;
            }, selector);
        } catch (err) {
            throw new QueryError("value", `Element "${selector}" not found.`);
        }
    }

    @FailIfNotLoaded
    public async attribute(selector: WendigoSelector, attributeName: string): Promise<string | null> {
        try {
            return await this.evaluate((q, attr) => {
                const element = WendigoUtils.queryElement(q);
                if (!element) return Promise.reject();
                return element.getAttribute(attr);
            }, selector, attributeName);
        } catch (err) {
            throw new QueryError("attribute", `Element "${selector}" not found.`);
        }
    }

    @FailIfNotLoaded
    public async styles(selector: WendigoSelector): Promise<{ [s: string]: string }> {
        try {
            return await this.evaluate((q) => {
                const element = WendigoUtils.queryElement(q);
                if (!element) return Promise.reject();
                return WendigoUtils.getStyles(element);
            }, selector);
        } catch (err) {
            throw new QueryError("styles", `Element "${selector}" not found.`);
        }
    }

    @FailIfNotLoaded
    public async style(selector: WendigoSelector, styleName: string): Promise<string> {
        try {
            return await this.styles(selector).then((styles) => {
                return styles[styleName];
            });
        } catch (err) {
            throw new QueryError("style", `Element "${selector}" not found.`);
        }
    }

    @FailIfNotLoaded
    public async checked(selector: WendigoSelector): Promise<boolean | undefined> {
        try {
            return await this.evaluate((q) => {
                const element = WendigoUtils.queryElement(q) as HTMLInputElement;
                if (!element) return Promise.reject();
                return element.checked;
            }, selector);
        } catch (err) {
            throw new QueryError("checked", `Element "${selector}" not found.`);
        }
    }

    @FailIfNotLoaded
    public async pdf(options?: PDFOptions | string): Promise<Buffer> {
        if (typeof options === 'string') {
            options = {
                path: options
            };
        }
        return this._page.pdf(options);
    }
}
