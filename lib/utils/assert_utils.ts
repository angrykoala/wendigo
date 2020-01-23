import { AssertionError, WendigoError } from '../models/errors';

// Inverts the result of an asyncronous assertion. Throws if error is not an assertion
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
    throw new AssertionError(fnName, msg);
}

export function sameMembers<T>(arr1: Array<T>, arr2: Array<T>): boolean {
    const arr1Length = arr1.length;
    if (arr1Length !== arr2.length) return false;
    for (let i = 0; i < arr1Length; i++) {
        if (arr1[i] !== arr2[i]) return false;
    }
    return true;
}
