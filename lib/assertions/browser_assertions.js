/* global WendigoUtils */
"use strict";

const BrowserNotAssertions = require('./browser_not_assertions');
const elementsAssertionUtils = require('./utils/assert_elements');
const textUtils = require('./utils/text_utils');
const assertUtils = require('./utils/assert_utils');
const ErrorFactory = require('../errors/error_factory');

module.exports = class BrowserAssertions {

    constructor(browser) {
        this._browser = browser;
        this.not = new BrowserNotAssertions(this, browser);
    }

    exists(selector, msg) {
        if(!msg) msg = `Expected element "${selector}" to exists`;
        return this._browser.query(selector).then((element) => {
            if(!element) return assertUtils.rejectAssertion(msg);
        });
    }

    visible(selector, msg) {
        if(!msg) msg = `Expected element "${selector}" to be visible`;
        return this._browser.evaluate((q) => {
            const element = WendigoUtils.queryElement(q);
            return WendigoUtils.isVisible(element);
        }, selector).then((visible) => {
            if(!visible) return assertUtils.rejectAssertion(msg);
        });
    }

    text(selector, expected, msg) {
        if((!expected && expected !== "") || expected.length === 0) return Promise.reject(new Error(`Missing expected text for assertion`));
        if(!Array.isArray(expected)) expected = [expected];
        return this._browser.text(selector).then((texts) => {
            for(const expectedText of expected) {
                if(!textUtils.matchTextList(texts, expectedText)) {
                    if(!msg) {
                        const foundText = texts.length === 0 ? "no text" : `"${texts.join(" ")}"`;
                        msg = `Expected element "${selector}" to have text "${expectedText}", ${foundText} found`;
                    }
                    return assertUtils.rejectAssertion(msg, expected, texts);
                }
            }
        });
    }

    textContains(selector, expected, msg) {
        return this._browser.text(selector).then((texts) => {
            for(const text of texts) {
                if(text && text.includes(expected)) return Promise.resolve();
            }
            if(!msg) {
                const foundText = texts.length === 0 ? "no text" : `"${texts.join(" ")}"`;
                msg = `Expected element "${selector}" to contain text "${expected}", ${foundText} found`;
            }
            return assertUtils.rejectAssertion(msg, expected, texts);
        });
    }

    title(expected, msg) {
        return this._browser.title().then((title) => {
            const foundTitle = title ? `"${title}"` : "no title";
            if(!textUtils.matchText(title, expected)) {
                if(!msg) msg = `Expected page title to be "${expected}", ${foundTitle} found`;
                return assertUtils.rejectAssertion(msg, expected, title);
            }
        });
    }

    class(selector, expected, msg) {
        return this._browser.class(selector).then((classes) => {
            if(!classes.includes(expected)) {
                if(!msg) {
                    const foundClasses = classes.length === 0 ? "no classes" : `"${classes.join(" ")}"`;
                    msg = `Expected element "${selector}" to contain class "${expected}", ${foundClasses} found.`;
                }
                return assertUtils.rejectAssertion(msg, expected, classes);
            }
        });
    }

    url(expected, msg) {
        return this._browser.url().then((url) => {
            if(url !== expected) {
                if(!msg) msg = `Expected url to be "${expected}", "${url}" found`;
                return assertUtils.rejectAssertion(msg, expected, url);
            }
        });
    }

    value(selector, expected, msg) {
        return this._browser.value(selector).then((value) => {
            if(value !== expected) {
                if(!msg) {
                    if(value === null) msg = `Expected element "${selector}" to have value "${expected}", no value found`;
                    else msg = `Expected element "${selector}" to have value "${expected}", "${value}" found`;
                }
                return assertUtils.rejectAssertion(msg, expected, value);
            }
        });
    }

    element(selector, msg) {
        return this.elements(selector, 1, msg);
    }

    elements(selector, count, msg) {
        const assertCountData = elementsAssertionUtils.parseCountInput(count);
        if(!assertCountData.case) {
            return Promise.reject(new Error(`browser.assert.elements, parameter count (${count}) is not valid`));
        }
        return this._browser.queryAll(selector).then((elements) => {
            const elementsCount = elements.length;
            return elementsAssertionUtils.makeAssertion(selector, assertCountData, elementsCount, msg);
        });
    }

    /* eslint-disable complexity */
    attribute(selector, attribute, expectedValue, msg) {
        return this._browser.attribute(selector, attribute).then((value) => {
            if(expectedValue === undefined) {
                if(value === null) {
                    if(!msg) msg = `Expected element "${selector}" to have attribute "${attribute}".`;
                    return assertUtils.rejectAssertion(msg);
                }
            } else if(value !== expectedValue) {
                if(!msg) {
                    msg = `Expected element "${selector}" to have attribute "${attribute}" with value "${expectedValue}"`;
                    if(value) msg = `${msg}, "${value}" found.`;
                    else msg = `${msg}.`;
                }
                return assertUtils.rejectAssertion(msg, expectedValue, value);
            }
        }).catch(() => {
            if(!msg) {
                msg = `Expected element "${selector}" to have attribute "${attribute}"`;
                if(expectedValue !== undefined) msg = `${msg} with value "${expectedValue}"`;
                msg = `${msg}, no element found.`;
            }
            return assertUtils.rejectAssertion(msg, expectedValue, attribute);
        });
    }
    /* eslint-enable complexity */

    style(selector, style, expected, msg) {
        return this._browser.evaluate((selector, style) => {
            const element = WendigoUtils.queryElement(selector);
            if(!element) return Promise.reject();
            const styles = getComputedStyle(element);
            return styles.getPropertyValue(style);
        }, selector, style).catch(() => {
            const error = ErrorFactory.generateQueryError(`Element "${selector}" not found when trying to assert style.`);
            return Promise.reject(error);
        }).then((value) => {
            if(value !== expected) {
                if(!msg) {
                    msg = `Expected element "${selector}" to have style "${style}" with value "${expected}"`;
                    if(value) msg = `${msg}, "${value}" found.`;
                    else msg = `${msg}, style not found.`;
                }
                return assertUtils.rejectAssertion(msg, expected, value);
            }
        });
    }

    href(selector, expected, msg) {
        return this.attribute(selector, "href", expected, msg);
    }

    innerHtml(selector, expected, msg) {
        if(!expected && expected !== "") return Promise.reject(new Error("Missing expected html for assertion."));

        return this._browser.innerHtml(selector).then((found) => {
            if(found.length === 0) {
                const error = ErrorFactory.generateQueryError(`Element "${selector}" not found.`);
                return Promise.reject(error);
            }
            for(const html of found) {
                if(textUtils.matchText(html, expected)) return Promise.resolve();
            }

            if(!msg) {
                msg = `Expected element "${selector}" to have inner html "${expected}", "${found.join(" ")}" found.`;
            }

            return assertUtils.rejectAssertion(msg, expected, found);
        });
    }

    options(selector, expected, msg) {
        if(!Array.isArray(expected)) expected = [expected];
        return this._browser.options(selector).then((options) => {
            const sameMembers = assertUtils.sameMembers(expected, options);
            if(!sameMembers) {
                if(!msg) {
                    const expectedText = expected.join(", ");
                    const optionsText = options.join(", ");
                    msg = `Expected element "${selector}" to have options "${expectedText}", "${optionsText}" found.`;
                }
                return assertUtils.rejectAssertion(msg, expected, options);
            }
        });
    }

    selectedOptions(selector, expected, msg) {
        if(!Array.isArray(expected)) expected = [expected];
        return this._browser.selectedOptions(selector).then((selectedOptions) => {
            const sameMembers = assertUtils.sameMembers(expected, selectedOptions);
            if(!sameMembers) {
                if(!msg) {
                    const expectedText = expected.join(", ");
                    const optionsText = selectedOptions.join(", ");
                    msg = `Expected element "${selector}" to have options "${expectedText}" selected, "${optionsText}" found.`;
                }
                return assertUtils.rejectAssertion(msg, expected, selectedOptions);
            }
        });
    }

    global(key, expected, msg) {
        return this._browser.evaluate((k) => {
            return window[k];
        }, key).then((value) => {
            if(expected === undefined) {
                if(value === undefined) {
                    if(!msg) {
                        msg = `Expected "${key}" to be defined as global variable.`;
                    }
                    return assertUtils.rejectAssertion(msg);
                }
            } else{
                if(value !== expected) {
                    if(!msg) {
                        msg = `Expected "${key}" to be defined as global variable with value "${expected}", "${value}" found.`;
                    }
                    return assertUtils.rejectAssertion(msg, expected, value);
                }
            }
        });
    }

    cookie(name, expected, msg) {
        return this._browser.cookies.get(name).then((value) => {
            if(expected === undefined) {
                if(value === undefined) {
                    if(!msg) {
                        msg = `Expected cookie "${name}" to exist.`;
                    }
                    return assertUtils.rejectAssertion(msg);
                }
            }else{
                if(value !== expected) {
                    if(!msg) {
                        msg = `Expected cookie "${name}" to have value "${expected}", "${value}" found.`;
                    }
                    return assertUtils.rejectAssertion(msg, expected, value);
                }
            }
        });
    }
};
