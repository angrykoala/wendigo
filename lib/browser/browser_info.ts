import BrowserClick from './browser_click';
import { QueryError } from '../errors';
import { CssSelector, XPathSelector, WendigoSelector } from '../types';

export default abstract class BrowserInfo extends BrowserClick {
    public text(selector: WendigoSelector): Promise<Array<string>> {
        this.failIfNotLoaded("text");
        return this.evaluate((q) => {
            const elements = WendigoUtils.queryAll(q);
            const result = [];
            for (const e of elements) {
                result.push(e.textContent);
            }
            return result;
        }, selector);
    }

    public title(): Promise<string> {
        this.failIfNotLoaded("title");
        return this.page.title();
    }

    public html(): string {
        this.failIfNotLoaded("html");
        return this.originalHtml || "";
    }

    public async url(): Promise<string | null> {
        this.failIfNotLoaded("url");
        let url = await this.evaluate(() => window.location.href);
        if (url === "about:blank") url = null;
        return url;
    }

    public tag(selector: WendigoSelector): Promise<string | null> {
        this.failIfNotLoaded("tag");
        return this.evaluate((q) => {
            const element = WendigoUtils.queryElement(q);
            if (!element) return null;
            else return element.tagName.toLowerCase();
        }, selector);
    }

    public innerHtml(selector: WendigoSelector): Promise<Array<string>> {
        this.failIfNotLoaded("innerHtml");
        return this.evaluate((q) => {
            const elements = WendigoUtils.queryAll(q);
            return elements.map(e => e.innerHTML);
        }, selector);
    }

    public async options(selector: WendigoSelector): Promise<Array<string>> {
        this.failIfNotLoaded("options");
        try {
            return this.evaluate((q) => {
                const element = WendigoUtils.queryElement(q) as HTMLSelectElement;
                if (!element) return Promise.reject();
                const options = element.options || [];
                const result = [];
                for (const o of options) {
                    result.push(o.value);
                }
                return result;
            }, selector);
        } catch (err) {
            throw new QueryError("options", `Element "${selector}" not found.`);
        }
    }

    public async selectedOptions(selector: WendigoSelector): Promise<Array<string>> {
        this.failIfNotLoaded("selectedOptions");
        try {
            return this.evaluate((q) => {
                const elements = WendigoUtils.queryElement(q) as HTMLSelectElement;
                return Array.from(elements.options).filter((option) => {
                    return option.selected;
                }).map((option) => {
                    return option.value || option.text;
                });
            }, selector);
        } catch (err) {
            throw new QueryError("selectedOptions", `Element "${selector}" not found.`);

        }
    }

    public async class(selector: WendigoSelector): Promise<Array<string>> {
        this.failIfNotLoaded("class");
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

    public value(selector: WendigoSelector): Promise<string | null> {
        this.failIfNotLoaded("value");
        return this.evaluate((q) => {
            const element = WendigoUtils.queryElement(q) as HTMLInputElement;
            if (!element) return null;
            else if (element.value === undefined) return null;
            else return element.value;
        }, selector);
    }

    public async attribute(selector: WendigoSelector, attributeName: string): Promise<string | null> {
        this.failIfNotLoaded("attribute");
        try {
            return this.evaluate((q, attr) => {
                const element = WendigoUtils.queryElement(q);
                if (!element) return Promise.reject();
                return element.getAttribute(attr);
            }, selector, attributeName);
        } catch (err) {
            throw new QueryError("attribute", `Element "${selector}" not found.`);
        }
    }

    public async styles(selector: WendigoSelector): Promise<{ [s: string]: string }> {
        this.failIfNotLoaded("styles");
        try {
            return this.evaluate((q) => {
                const element = WendigoUtils.queryElement(q);
                if (!element) return Promise.reject();
                return WendigoUtils.getStyles(element);
            }, selector);
        } catch (err) {
            throw new QueryError("styles", `Element "${selector}" not found.`);
        }
    }

    public async style(selector: WendigoSelector, styleName: string): Promise<string> {
        this.failIfNotLoaded("style");
        try {
            return this.styles(selector).then((styles) => {
                return styles[styleName];
            });
        } catch (err) {
            throw new QueryError("style", `Element "${selector}" not found.`);
        }
    }

    public async checked(selector: WendigoSelector): Promise<boolean> {
        this.failIfNotLoaded("checked");
        try {
            return this.evaluate((q) => {
                const element = WendigoUtils.queryElement(q) as HTMLInputElement;
                if (!element) return Promise.reject();
                return Boolean(element.checked);
            }, selector);
        } catch (err) {
            throw new QueryError("checked", `Element "${selector}" not found.`);
        }
    }
}
