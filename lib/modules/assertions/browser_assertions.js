/* eslint-disable max-lines */
/* global WendigoUtils */
"use strict";

const utils = require('../../utils');
const elementsAssertionUtils = require('./utils/assert_elements');
const assertUtils = require('./utils/assert_utils');
const BrowserModule = require('../browser_module');
const RequestAssertionsFilter = require('./request_assertions_filter');
const BrowserNotAssertions = require('./browser_not_assertions');
const {QueryError} = require('../../errors');

module.exports = class BrowserAssertions extends BrowserModule {
    constructor(browser) {
        super(browser);

        this.not = new BrowserNotAssertions(browser, this);
    }

    get request() {
        const requests = this._browser.requests.filter;
        return new RequestAssertionsFilter((r) => {
            r();
        }, requests);
    }

    exists(selector, msg) {
        if (!msg) msg = `Expected element "${selector}" to exists`;
        return this._browser.query(selector).then((element) => {
            if (!element) return assertUtils.rejectAssertion(msg);
        });
    }

    visible(selector, msg) {
        return this._browser.evaluate((q) => {
            const elements = WendigoUtils.queryAll(q);
            if (elements.length === 0) throw new Error("Element not Found");
            for (let i = 0; i < elements.length; i++) {
                if (WendigoUtils.isVisible(elements[i])) return true;
            }
            return false;
        }, selector).catch(() => {
            return assertUtils.rejectAssertion(`Selector "${selector}" doesn't match any elements.`);
        }).then((visible) => {
            if (!visible) {
                if (!msg) msg = `Expected element "${selector}" to be visible.`;
                return assertUtils.rejectAssertion(msg);
            }
        });
    }

    text(selector, expected, msg) {
        if ((!expected && expected !== "") || expected.length === 0) return Promise.reject(new Error(`Missing expected text for assertion`));
        if (!Array.isArray(expected)) expected = [expected];
        return this._browser.text(selector).then((texts) => {
            for (const expectedText of expected) {
                if (!utils.matchTextList(texts, expectedText)) {
                    if (!msg) {
                        const foundText = texts.length === 0 ? "no text" : `"${texts.join(" ")}"`;
                        msg = `Expected element "${selector}" to have text "${expectedText}", ${foundText} found`;
                    }
                    return assertUtils.rejectAssertion(msg);
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
                msg = `Expected element "${selector}" to contain text "${expected}", ${foundText} found`;
            }
            return assertUtils.rejectAssertion(msg);
        });
    }

    title(expected, msg) {
        return this._browser.title().then((title) => {
            const foundTitle = title ? `"${title}"` : "no title";
            if (!utils.matchText(title, expected)) {
                if (!msg) msg = `Expected page title to be "${expected}", ${foundTitle} found`;
                return assertUtils.rejectAssertion(msg);
            }
        });
    }

    class(selector, expected, msg) {
        return this._browser.class(selector).then((classes) => {
            if (!classes.includes(expected)) {
                if (!msg) {
                    const foundClasses = classes.length === 0 ? "no classes" : `"${classes.join(" ")}"`;
                    msg = `Expected element "${selector}" to contain class "${expected}", ${foundClasses} found.`;
                }
                return assertUtils.rejectAssertion(msg);
            }
        });
    }

    url(expected, msg) {
        return this._browser.url().then((url) => {
            if (url !== expected) {
                if (!msg) msg = `Expected url to be "${expected}", "${url}" found`;
                return assertUtils.rejectAssertion(msg, url, expected);
            }
        });
    }

    value(selector, expected, msg) {
        return this._browser.value(selector).then((value) => {
            if (value !== expected) {
                if (!msg) {
                    if (value === null) msg = `Expected element "${selector}" to have value "${expected}", no value found`;
                    else msg = `Expected element "${selector}" to have value "${expected}", "${value}" found`;
                }
                return assertUtils.rejectAssertion(msg, value, expected);
            }
        });
    }

    element(selector, msg) {
        return this.elements(selector, 1, msg);
    }

    elements(selector, count, msg) {
        const assertCountData = elementsAssertionUtils.parseCountInput(count);
        if (!assertCountData.case) {
            return Promise.reject(new Error(`browser.assert.elements, parameter count (${count}) is not valid`));
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
                return assertUtils.rejectAssertion(msg);
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
            return assertUtils.rejectAssertion(msg);
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
            const error = new QueryError(`Element "${selector}" not found when trying to assert style.`);
            return Promise.reject(error);
        }).then((value) => {
            if (value !== expected) {
                if (!msg) {
                    msg = `Expected element "${selector}" to have style "${style}" with value "${expected}"`;
                    if (value) msg = `${msg}, "${value}" found.`;
                    else msg = `${msg}, style not found.`;
                }
                return assertUtils.rejectAssertion(msg);
            }
        });
    }

    href(selector, expected, msg) {
        return this.attribute(selector, "href", expected, msg);
    }

    innerHtml(selector, expected, msg) {
        if (!expected && expected !== "") return Promise.reject(new Error("Missing expected html for assertion."));

        return this._browser.innerHtml(selector).then((found) => {
            if (found.length === 0) {
                const error = new QueryError(`Element "${selector}" not found.`);
                return Promise.reject(error);
            }
            for (const html of found) {
                if (utils.matchText(html, expected)) return Promise.resolve();
            }

            if (!msg) {
                msg = `Expected element "${selector}" to have inner html "${expected}", "${found.join(" ")}" found.`;
            }

            return assertUtils.rejectAssertion(msg, found, expected);
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
                return assertUtils.rejectAssertion(msg, options, expected);
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
                return assertUtils.rejectAssertion(msg, selectedOptions, expected);
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
                    return assertUtils.rejectAssertion(msg);
                }
            } else if (value !== expected) {
                if (!msg) {
                    msg = `Expected "${key}" to be defined as global variable with value "${expected}", "${value}" found.`;
                }
                return assertUtils.rejectAssertion(msg, value, expected);
            }
        });
    }

    cookie(name, expected, msg) {
        return this._browser.cookies.get(name).then((value) => {
            if (expected === undefined) {
                if (value === undefined) {
                    if (!msg) {
                        msg = `Expected cookie "${name}" to exist.`;
                    }
                    return assertUtils.rejectAssertion(msg);
                }
            } else if (value !== expected) {
                if (!msg) {
                    msg = `Expected cookie "${name}" to have value "${expected}", "${value}" found.`;
                }
                return assertUtils.rejectAssertion(msg, value, expected);
            }
        });
    }

    checked(selector, msg) {
        return this._browser.checked(selector).then((value) => {
            if (value !== true) {
                if (!msg) msg = `Expected element "${selector}" to be checked.`;
                return assertUtils.rejectAssertion(msg, value, true);
            }
        });
    }

    disabled(selector, msg) {
        return this._browser.attribute(selector, "disabled").then((value) => {
            if (value === null) {
                if (!msg) msg = `Expected element "${selector}" to be disabled.`;
                return assertUtils.rejectAssertion(msg);
            }
        });
    }

    enabled(selector, msg) {
        return this._browser.attribute(selector, "disabled").then((value) => {
            if (value !== null) {
                if (!msg) msg = `Expected element "${selector}" to be enabled.`;
                return assertUtils.rejectAssertion(msg);
            }
        });
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
            const error = new QueryError(`Element "${selector}" not found when trying to assert focus.`);
            return Promise.reject(error);
        }).then((focused) => {
            if (!focused) {
                if (!msg) msg = `Expected element "${selector}" to be focused.`;
                return assertUtils.rejectAssertion(msg);
            }
        });
    }

    redirect(msg) {
        const chain = this._browser._initialResponse.request().redirectChain();
        if (chain.length === 0) {
            if (!msg) msg = `Expected current url to be a redirection.`;
            return assertUtils.rejectAssertion(msg);
        } else return Promise.resolve();
    }

    /* eslint-disable complexity */
    console(options, count, msg) {
        const logs = this._browser.console.filter(options);
        const checkCount = count !== undefined && count !== null;
        if ((checkCount && logs.length !== count) || (!checkCount && logs.length === 0)) {
            if (!msg) {
                const typeMsg = options.type ? ` of type "${options.type}"` : "";
                const textMsg = options.text ? ` with text "${options.text}"` : "";
                const countMsg = checkCount ? ` ${count}` : "";
                msg = `Expected${countMsg} console events${typeMsg}${textMsg}, ${logs.length} found.`;
            }
            return assertUtils.rejectAssertion(msg);
        }
    }
    /* eslint-enable complexity */

    /* eslint-disable complexity */
    webworker(options, msg) {
        if (!options) options = {};
        let workers = this._browser.webworkers.all();
        let urlMsg = "";
        if (options.url) {
            urlMsg = ` with url "${options.url}"`;
            workers = workers.filter((w) => {
                return w.url === options.url;
            });
        }
        if (options.count !== undefined) {
            if (workers.length !== options.count) {
                if (!msg) msg = `Expected ${options.count} webworkers running${urlMsg}, ${workers.length} found.`;
                return assertUtils.rejectAssertion(msg);
            }
        } else if (workers.length === 0) {
            if (!msg) msg = `Expected at least 1 webworker running${urlMsg}, 0 found.`;
            return assertUtils.rejectAssertion(msg);
        }
    }
    /* eslint-enable complexity */
};

/* eslint-enable max-lines */
