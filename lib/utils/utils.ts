import * as querystring from 'querystring';
import { URL } from 'url';

export function isNumber(n: any): n is number {
    return !Number.isNaN(Number(n));
}

export function isXPathQuery(s: string): boolean {
    if (s[0] === '/') return true;
    if (/^.\./.test(s)) return true;
    const axisSplit = s.split("::");
    if (axisSplit.length > 1) {
        const validAxis = ["ancestor", "ancestor-or-self", "attribute", "child", "descendant", "descendant-or-self",
            "following", "following-sibling", "namespace", "parent", "preceding", "preceding-sibling", "self"];
        const axe = axisSplit[0];
        if (validAxis.indexOf(axe) !== -1) return true;
    }
    return false;
}

export function stringify(element: any): string {
    if (typeof element === 'object' && !(element instanceof RegExp)) {
        element = JSON.stringify(element);
    }
    return String(element);
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

export function arrayfy<T>(raw: T | Array<T>): Array<T> {
    if (Array.isArray(raw)) return raw;
    else return [raw];
}

export function cleanStringForXpath(str: string): string {
    const parts = str.split('\'');
    if (parts.length === 1) return `'${parts[0]}'`;

    const formattedParts = parts.map((part: string): string => {
        if (part === "") {
            return '"\'"';
        }
        return "'" + part + "'";
    });
    return "concat(" + formattedParts.join(",") + ")";
}
