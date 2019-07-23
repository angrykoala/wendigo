import { AssertionError as NativeAssertionError } from 'assert';

export class AssertionError extends NativeAssertionError {
    public readonly extraMessage: string;
    constructor(fn: string, message: string, actual?: any, expected?: any) {
        if (actual !== undefined) actual = String(actual);
        if (expected !== undefined) expected = String(expected);
        const msg = `[${fn}] ${message}`;
        super({
            message: msg,
            actual: actual,
            expected: expected
        });
        this.extraMessage = message;
    }
}

export class WendigoError extends Error {
    protected fnName: string;
    public extraMessage: string;

    constructor(fn: string, message: string) {
        super(`[${fn}] ${message}`);
        this.fnName = fn;
        this.extraMessage = message;
    }

    public static overrideFnName(error: Error, fnName: string): Error {
        if (error instanceof TimeoutError) {
            const c = error.constructor as any;
            const newError = new c(fnName, error.extraMessage, error.timeout);
            return newError;
        } else if (error instanceof AssertionError) {
            const c = error.constructor as any;
            const newError = new c(fnName, error.extraMessage, error.actual, error.expected); // keeps same error, changes origin function
            return newError;
        } else if (error instanceof WendigoError) {
            const c = error.constructor as any;
            const newError = new c(fnName, error.extraMessage);
            return newError;
        } else return error;
    }
}

export class QueryError extends WendigoError {
    constructor(fn: string, message: string) {
        super(fn, message);
        this.name = this.constructor.name;
    }
}

export class FatalError extends WendigoError {
    constructor(fn: string, message: string) {
        super(fn, message);
        this.name = this.constructor.name;
    }
}

export class TimeoutError extends WendigoError {
    public readonly timeout: number;
    constructor(fn: string, message: string, timeout: number) {
        let msg = message ? `${message}, timeout` : "Timeout";
        if (timeout !== undefined) msg = `${msg} of ${timeout}ms exceeded.`;
        super(fn, msg);
        this.name = this.constructor.name;
        this.timeout = timeout;
        this.extraMessage = message;
    }
}

export class InjectScriptError extends FatalError {
    constructor(fn: string, message: string) {
        super(fn, message);
        this.name = this.constructor.name;
    }
}
