/* eslint-disable max-lines */
/* global WendigoUtils */
"use strict";

const utils = require('../../utils/utils');
const elementsAssertionUtils = require('../../utils/assert_elements');
const assertUtils = require('../../utils/assert_utils');
const RequestAssertionsFilter = require('../requests/request_assertions_filter');
const deprecationWarning = require('../../utils/deprecation_warning');
const {QueryError, FatalError, WendigoError} = require('../../errors');

module.exports = class BrowserAssertions {
    constructor(browser) {
        this._browser = browser;
        // Not assertions are dinamically added
    }

    get request() {
        const requests = this._browser.requests.filter;
        return new RequestAssertionsFilter((r) => {
            r();
        }, requests);
    }

    async exists(selector, msg) {
        if (!msg) msg = `Expected element "${selector}" to exists`;
        let element;
        try {
            element = await this._browser.query(selector);
        } catch (err) {
            throw WendigoError.overrideFnName(err, "assert.exists");
        }
        if (!element) return assertUtils.rejectAssertion("assert.exists", msg);
    }

    visible(selector, msg) {
        return this._browser.evaluate((q) => {
            const elements = WendigoUtils.queryAll(q);
            if (elements.length === 0) throw new WendigoError("assert.visible", "Element not Found");
            for (let i = 0; i < elements.length; i++) {
                if (WendigoUtils.isVisible(elements[i])) return true;
            }
            return false;
        }, selector).catch(() => {
            return assertUtils.rejectAssertion("assert.visible", `Selector "${selector}" doesn't match any elements.`);
        }).then((visible) => {
            if (!visible) {
                if (!msg) msg = `Expected element "${selector}" to be visible.`;
                return assertUtils.rejectAssertion("assert.visible", msg);
            }
        });
    }

    async tag(selector, expected, msg) {
        if (!expected) {
            return Promise.reject(new WendigoError("assert.tag", `Missing expected tag for assertion.`));
        }
        const tagsFound = await this._browser.evaluate((q) => {
            const elements = WendigoUtils.queryAll(q);
            const results = [];
            for (let i = 0; i < elements.length; i++) {
                results.push(elements[i].tagName.toLowerCase());
            }
            return results;
        }, selector);
        for (const tag of tagsFound) {
            if (tag === expected) return null;
        }
        if (!msg) {
            msg = `No element with tag "${expected}" found.`;
        }
        return assertUtils.rejectAssertion("assert.tag", msg);
    }

    text(selector, expected, msg) {
        if ((!expected && expected !== "") || (Array.isArray(expected) && expected.length === 0)) {
            return Promise.reject(new WendigoError("assert.text", `Missing expected text for assertion.`));
        }
        if (!Array.isArray(expected)) expected = [expected];
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

    cookie(...params) {
        // DEPRECATED
        deprecationWarning("Browser.assert.cookie", "browser.asssert.cookies");
        return this.cookies(...params);
    }

    webworker(...params) {
        // DEPRECATED
        deprecationWarning("Browser.assert.webworker", "browser.asssert.webworkers");
        return this.webworkers(...params);
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
};

/* eslint-enable max-lines */
