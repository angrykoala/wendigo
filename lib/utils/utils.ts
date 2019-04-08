import * as querystring from 'querystring';
import { URL } from 'url';
import * as isClassModule from 'is-class';
import { ConsoleMessage, JSHandle } from 'puppeteer';

export function isNumber(n: any): n is number {
    return !Number.isNaN(Number(n));
}

export function stringify(element: any): string {
    if (typeof element === 'object' && !(element instanceof RegExp)) {
        element = JSON.stringify(element);
    }
    return String(element);
}

export async function promiseSerial(funcs: Array<() => Promise<any>>): Promise<Array<any>> {
    const results = [];
    for (const f of funcs) {
        const r = await f();
        results.push(r);
    }
    return results;
}

// Returns promise resolve if any promise is resolved, reject otherwise
export function promiseOr(promises: Array<Promise<any>>): Promise<any> {
    let resolved = false;
    let rejected = 0;
    return new Promise((resolve, reject) => {
        for (const promise of promises) {
            promise.then((res) => {
                if (!resolved) {
                    resolved = true;
                    resolve(res);
                }
            }).catch(() => {
                rejected++;
                if (!resolved && rejected >= promises.length) reject();
            });
        }
    });
}

export function matchText(text: string | null | undefined, expected: string | RegExp): boolean {
    if (text === undefined || text === null) return false;
    if (expected instanceof RegExp) {
        return expected.test(text);
    } else {
        return text === expected;
    }
}

export function matchTextList(list: Array<string>, expected: string | RegExp): boolean {
    for (const text of list) {
        if (matchText(text, expected)) return true;
    }
    return false;
}

export function delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
}

export function compareObjects(obj1: any, obj2: any): boolean { // Swallow compare
    if (!obj1 || !obj2) return false;
    const k1 = Object.keys(obj1);
    const k2 = Object.keys(obj2);
    if (k1.length !== k2.length) return false;
    for (const k of k1) {
        if (obj1[k] !== obj2[k]) return false;
    }
    return true;
}

export function parseQueryString(qs: string | URL | { [s: string]: string }): { [s: string]: string; } {
    if (typeof qs === 'string') {
        if (qs[0] === '?') qs = qs.slice(1);
        return Object.assign({}, querystring.parse(qs)) as { [s: string]: string; };
    } else if (qs instanceof URL) {
        qs = qs.searchParams.toString();
        return Object.assign({}, querystring.parse(qs)) as { [s: string]: string; };
    } else return qs;
}

export async function stringifyLogText(log: ConsoleMessage): Promise<string> {
    const text = log.text();
    if (text.includes('JSHandle@object')) {
        const args = await Promise.all(log.args().map(stringifyArg));
        return args.join(' ');
    }
    return text;
}

export function stringifyArg(arg: JSHandle): Promise<string> {
    return arg.executionContext().evaluate(element => {
        if (typeof element === 'object' && !(element instanceof RegExp)) {
            try {
                element = JSON.stringify(element);
            } catch (err) {
                if (err instanceof TypeError) { // Converting circular structure
                } else throw err;
            }
        }
        return String(element);
    }, arg);
}

export function arrayfy<T>(raw: T | Array<T>): Array<T> {
    if (Array.isArray(raw)) return raw;
    else return [raw];
}

export function isClass(c: any): boolean { // Wrapper to allow typing on isClass
    return Boolean(isClassModule(c));
}
