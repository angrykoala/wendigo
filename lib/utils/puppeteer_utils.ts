import { ConsoleMessage, JSHandle } from '../browser/puppeteer_wrapper/puppeteer_types';

export async function stringifyLogText(log: ConsoleMessage): Promise<string> {
    const text = log.text();
    if (text.includes('JSHandle@object')) {
        const args = await Promise.all(log.args().map(stringifyLogArg));
        return args.join(' ');
    }
    return text;
}

function stringifyLogArg(arg: JSHandle): Promise<string> {
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
