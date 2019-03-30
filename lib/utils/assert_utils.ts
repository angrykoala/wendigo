import { AssertionError, WendigoError } from '../errors';

export async function invertify(cb: () => Promise<void>, fnName: string, msg: string): Promise<void> {
    try {
        await cb();
    } catch (err) {
        if (err instanceof AssertionError) return Promise.resolve();
        else if (err instanceof WendigoError) {
            const newError = WendigoError.overrideFnName(err, fnName);
            return Promise.reject(newError);
        } else return Promise.reject(err);
    }
    return this.rejectAssertion(fnName, msg);
}

export function sameMembers(arr1: Array<any>, arr2: Array<any>): boolean {
    const arr1Length = arr1.length;
    if (arr1Length !== arr2.length) return false;
    for (let i = 0; i < arr1Length; i++) {
        if (arr1[i] !== arr2[i]) return false;
    }
    return true;
}

export function rejectAssertion(fnName: string, msg: string, actual, expected) {
    return Promise.reject(new AssertionError(fnName, msg, actual, expected));
}
