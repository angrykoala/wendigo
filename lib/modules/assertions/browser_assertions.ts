import * as utils from '../../utils/utils';
import * as elementsAssertionUtils from './assert_elements';
import * as assertUtils from './assert_utils';
// TODO: RequestAssertionFilter should be an assertion module
// const RequestAssertionsFilter = require('../requests/request_assertions_filter');

import WendigoModule from '../wendigo_module';
import { QueryError, FatalError, WendigoError } from '../../errors';
import { WendigoSelector } from '../../types';

export default class BrowserAssertions extends WendigoModule {

    // get request() {
    //     const requests = this._browser.requests.filter;
    //     return new RequestAssertionsFilter((r) => {
    //         r();
    //     }, requests);
    // }

    public async exists(selector: WendigoSelector, msg?: string): Promise<void> {
        if (!msg) msg = `Expected element "${selector}" to exists`;
        let element;
        try {
            element = await this._browser.query(selector);
        } catch (err) {
            throw WendigoError.overrideFnName(err, "assert.exists");
        }
        if (!element) return assertUtils.rejectAssertion("assert.exists", msg);
    }

    public visible(selector: WendigoSelector, msg?: string): Promise<void> {
        return this._browser.evaluate((q) => {
            const elements = WendigoUtils.queryAll(q);
            if (elements.length === 0) throw new WendigoError("assert.visible", "Element not Found");
            for (const e of elements) {
                if (WendigoUtils.isVisible(e)) return true;
            }
            return false;
        }, selector).catch(() => {
            return assertUtils.rejectAssertion("assert.visible", `Selector "${selector}" doesn't match any elements.`);
        }).then((visible: boolean) => {
            if (!visible) {
                if (!msg) msg = `Expected element "${selector}" to be visible.`;
                return assertUtils.rejectAssertion("assert.visible", msg);
            } else return Promise.resolve();
        });
    }

    public async tag(selector: WendigoSelector, expected: string, msg?: string): Promise<void> {
        if (!expected) {
            return Promise.reject(new WendigoError("assert.tag", `Missing expected tag for assertion.`));
        }
        const tagsFound = await this._browser.evaluate((q) => {
            const elements = WendigoUtils.queryAll(q);
            const results = [];
            for (const e of elements) {
                results.push(e.tagName.toLowerCase());
            }
            return results;
        }, selector);
        for (const tag of tagsFound) {
            if (tag === expected) return Promise.resolve();
        }
        if (!msg) {
            msg = `No element with tag "${expected}" found.`;
        }
        return assertUtils.rejectAssertion("assert.tag", msg);
    }

    public text(selector: WendigoSelector, expected: string | Array<string>, msg?: string): Promise<void> {
        if ((!expected && expected !== "") || (Array.isArray(expected) && expected.length === 0)) {
            return Promise.reject(new WendigoError("assert.text", `Missing expected text for assertion.`));
        }
        let processedExpected: Array<string> = [];
        if (Array.isArray(expected)) processedExpected = expected;
        else processedExpected = [expected];
        return this._browser.text(selector).then((texts) => {
            for (const expectedText of expected) {
                if (!utils.matchTextList(texts, expectedText)) {
                    if (!msg) {
                        const foundText = texts.length === 0 ? "no text" : `"${texts.join(" ")}"`;
                        msg = `Expected element "${selector}" to have text "${expectedText}", ${foundText} found.`;
                    }
                    return assertUtils.rejectAssertion("assert.text", msg);
                }
            }
            return Promise.resolve();
        });
    }

    textContains(selector, expected, msg) {
        return this._browser.text(selector).then((texts) => {
            for (const text of texts) {
                if (text && text.includes(expected)) return Promise.resolve();
            }
            if (!msg) {
                const foundText = texts.length === 0 ? "no text" : `"${texts.join(" ")}"`;
                msg = `Expected element "${selector}" to contain text "${expected}", ${foundText} found.`;
            }
            return assertUtils.rejectAssertion("assert.textContains", msg);
        });
    }

    title(expected, msg) {
        return this._browser.title().then((title) => {
            const foundTitle = title ? `"${title}"` : "no title";
            if (!utils.matchText(title, expected)) {
                if (!msg) msg = `Expected page title to be "${expected}", ${foundTitle} found.`;
                return assertUtils.rejectAssertion("assert.title", msg);
            }
        });
    }

    async class(selector, expected, msg) {
        let classes;
        try {
            classes = await this._browser.class(selector);
        } catch (err) {
            return Promise.reject(new QueryError("assert.class", `Selector "${selector}" doesn't match any elements.`));
        }
        if (!classes.includes(expected)) {
            if (!msg) {
                const foundClasses = classes.length === 0 ? "no classes" : `"${classes.join(" ")}"`;
                msg = `Expected element "${selector}" to contain class "${expected}", ${foundClasses} found.`;
            }
            return assertUtils.rejectAssertion("assert.class", msg);
        }
    }

    async url(expected, msg) {
        let url;
        try {
            url = await this._browser.url();
        } catch (err) {
            throw new FatalError("assert.url", `Can't obtain page url.${err.extraMessage || err.message}`);
        }
        if (!utils.matchText(url, expected)) {
            if (!msg) msg = `Expected url to be "${utils.stringify(expected)}", "${url}" found`;
            return assertUtils.rejectAssertion("assert.url", msg, url, expected);
        }
    }

    value(selector, expected, msg) {
        return this._browser.value(selector).then((value) => {
            if (value !== expected) {
                if (!msg) {
                    if (value === null) msg = `Expected element "${selector}" to have value "${expected}", no value found`;
                    else msg = `Expected element "${selector}" to have value "${expected}", "${value}" found`;
                }
                return assertUtils.rejectAssertion("assert.value", msg, value, expected);
            }
        });
    }

    element(selector, msg) {
        return this.elements(selector, 1, msg).catch((err) => {
            return Promise.reject(WendigoError.overrideFnName(err, "assert.element"));
        });
    }

    elements(selector, count, msg) {
        const assertCountData = elementsAssertionUtils.parseCountInput(count);
        if (!assertCountData.case) {
            return Promise.reject("assert.elements", new WendigoError("assert.elements", `parameter count (${count}) is not valid.`));
        }
        return this._browser.queryAll(selector).then((elements) => {
            const elementsCount = elements.length;
            return elementsAssertionUtils.makeAssertion(selector, assertCountData, elementsCount, msg);
        });
    }

    /* eslint-disable complexity */
    attribute(selector, attribute, expectedValue, msg) {
        const customMessage = Boolean(msg);
        if (!customMessage) {
            msg = `Expected element "${selector}" to have attribute "${attribute}"`;
            if (expectedValue) msg = `${msg} with value "${expectedValue}"`;
            if (expectedValue === null) msg = `Expected element "${selector}" not to have attribute "${attribute}"`;
        }


        return this._browser.evaluate((q, attrName) => {
            const elements = WendigoUtils.queryAll(q);
            return Array.from(elements).map((el) => {
                return el.getAttribute(attrName);
            });
        }, selector, attribute).then((attributes) => {
            if (attributes.length === 0) {
                if (!customMessage) msg = `${msg}, no element found.`;
                return assertUtils.rejectAssertion("assert.attribute", msg);
            }
            for (const attr of attributes) {
                if (attr !== null || expectedValue === null) {
                    if (expectedValue === undefined || utils.matchText(attr, expectedValue)) {
                        return Promise.resolve();
                    }
                }
            }
            if (!customMessage) {
                const foundElements = new Set(attributes.filter((a) => {
                    return a !== null;
                }));
                if (foundElements.size === 0 || expectedValue === null) msg = `${msg}.`;
                else {
                    const foundArr = Array.from(foundElements);
                    msg = `${msg}, ["${foundArr.join('", "')}"] found.`;
                }
            }
            return assertUtils.rejectAssertion("assert.attribute", msg);
        });
    }
    /* eslint-enable complexity */

    style(selector, style, expected, msg) {
        return this._browser.evaluate((sel, sty) => {
            const element = WendigoUtils.queryElement(sel);
            if (!element) return Promise.reject();
            const styles = getComputedStyle(element);
            return styles.getPropertyValue(sty);
        }, selector, style).catch(() => {
            const error = new QueryError("assert.style", `Element "${selector}" not found.`);
            return Promise.reject(error);
        }).then((value) => {
            if (value !== expected) {
                if (!msg) {
                    msg = `Expected element "${selector}" to have style "${style}" with value "${expected}"`;
                    if (value) msg = `${msg}, "${value}" found.`;
                    else msg = `${msg}, style not found.`;
                }
                return assertUtils.rejectAssertion("assert.style", msg);
            }
        });
    }

    href(selector, expected, msg) {
        return this.attribute(selector, "href", expected, msg).catch((err) => {
            return Promise.reject(WendigoError.overrideFnName(err, "assert.href"));
        });
    }

    innerHtml(selector, expected, msg) {
        if (!expected && expected !== "") return Promise.reject(new WendigoError("assert.innerHtml", "Missing expected html for assertion."));

        return this._browser.innerHtml(selector).then((found) => {
            if (found.length === 0) {
                const error = new QueryError("assert.innerHtml", `Element "${selector}" not found.`);
                return Promise.reject(error);
            }
            for (const html of found) {
                if (utils.matchText(html, expected)) return Promise.resolve();
            }

            if (!msg) {
                msg = `Expected element "${selector}" to have inner html "${expected}", "${found.join(" ")}" found.`;
            }

            return assertUtils.rejectAssertion("assert.innerHtml", msg, found, expected);
        });
    }

    options(selector, expected, msg) {
        if (!Array.isArray(expected)) expected = [expected];
        return this._browser.options(selector).then((options) => {
            const sameMembers = assertUtils.sameMembers(expected, options);
            if (!sameMembers) {
                if (!msg) {
                    const expectedText = expected.join(", ");
                    const optionsText = options.join(", ");
                    msg = `Expected element "${selector}" to have options "${expectedText}", "${optionsText}" found.`;
                }
                return assertUtils.rejectAssertion("assert.options", msg, options, expected);
            }
        });
    }

    selectedOptions(selector, expected, msg) {
        if (!Array.isArray(expected)) expected = [expected];
        return this._browser.selectedOptions(selector).then((selectedOptions) => {
            const sameMembers = assertUtils.sameMembers(expected, selectedOptions);
            if (!sameMembers) {
                if (!msg) {
                    const expectedText = expected.join(", ");
                    const optionsText = selectedOptions.join(", ");
                    msg = `Expected element "${selector}" to have options "${expectedText}" selected, "${optionsText}" found.`;
                }
                return assertUtils.rejectAssertion("assert.selectedOptions", msg, selectedOptions, expected);
            }
        });
    }

    global(key, expected, msg) {
        return this._browser.evaluate((k) => {
            return window[k];
        }, key).then((value) => {
            if (expected === undefined) {
                if (value === undefined) {
                    if (!msg) {
                        msg = `Expected "${key}" to be defined as global variable.`;
                    }
                    return assertUtils.rejectAssertion("assert.global", msg);
                }
            } else if (value !== expected) {
                if (!msg) {
                    msg = `Expected "${key}" to be defined as global variable with value "${expected}", "${value}" found.`;
                }
                return assertUtils.rejectAssertion("assert.global", msg, value, expected);
            }
        });
    }

    async checked(selector, msg) {
        let value;
        try {
            value = await this._browser.checked(selector);
        } catch (err) {
            return Promise.reject(new QueryError("assert.checked", `Element "${selector}" not found.`));
        }
        if (value !== true) {
            if (!msg) msg = `Expected element "${selector}" to be checked.`;
            return assertUtils.rejectAssertion("assert.checked", msg, value, true);
        }
    }

    async disabled(selector, msg) {
        let value;
        try {
            value = await this._browser.attribute(selector, "disabled");
        } catch (err) {
            return Promise.reject(new QueryError("assert.disabled", `Element "${selector}" not found.`));
        }
        if (value === null) {
            if (!msg) msg = `Expected element "${selector}" to be disabled.`;
            return assertUtils.rejectAssertion("assert.disabled", msg);
        }
    }

    async enabled(selector, msg) {
        let value;
        try {
            value = await this._browser.attribute(selector, "disabled");
        } catch (err) {
            return Promise.reject(new QueryError("assert.enabled", `Element "${selector}" not found.`));
        }
        if (value !== null) {
            if (!msg) msg = `Expected element "${selector}" to be enabled.`;
            return assertUtils.rejectAssertion("assert.enabled", msg);
        }
    }

    focus(selector, msg) {
        return this._browser.evaluate((q) => {
            const elements = WendigoUtils.queryAll(q);
            if (elements.length === 0) return Promise.reject();
            for (const el of elements) {
                if (document.activeElement === el) return true;
            }
            return false;
        }, selector).catch(() => {
            const error = new QueryError("assert.focus", `Element "${selector}" not found.`);
            return Promise.reject(error);
        }).then((focused) => {
            if (!focused) {
                if (!msg) msg = `Expected element "${selector}" to be focused.`;
                return assertUtils.rejectAssertion("assert.focus", msg);
            }
        });
    }

    redirect(msg) {
        const chain = this._browser._initialResponse.request().redirectChain();
        if (chain.length === 0) {
            if (!msg) msg = `Expected current url to be a redirection.`;
            return assertUtils.rejectAssertion("assert.redirect", msg);
        } else return Promise.resolve();
    }
