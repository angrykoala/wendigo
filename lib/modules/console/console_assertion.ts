import BrowserConsole from './browser_console';
import { ConsoleFilter } from './types';
import { isNumber } from '../../utils/utils';
import { AssertionError } from '../../models/errors';

function processMessage(filterOptions: ConsoleFilter, count: number, actualCount: number): string {
    const filterMessage = processFilterMessage(filterOptions);
    return `Expected ${count} console events${filterMessage}, ${actualCount} found.`;
}

function processMessageWithoutExpectedCount(filterOptions: ConsoleFilter): string {
    const filterMessage = processFilterMessage(filterOptions);
    return `Expected at least one console event${filterMessage}, none found.`;
}

function processFilterMessage(filterOptions: ConsoleFilter): string {
    const typeMsg = filterOptions.type ? ` of type "${filterOptions.type}"` : "";
    const textMsg = filterOptions.text ? ` with text "${filterOptions.text}"` : "";
    return `${typeMsg}${textMsg}`;
}

export default async function(consoleModule: BrowserConsole, filterOptions: ConsoleFilter, count?: number, msg?: string): Promise<void> {
    const logs = consoleModule.filter(filterOptions);
    if (!isNumber(count)) {
        if (logs.length <= 0) {
            if (!msg) msg = processMessageWithoutExpectedCount(filterOptions);
            throw new AssertionError("assert.console", msg);
        }
    } else {
        if (logs.length !== count) {
            if (!msg) msg = processMessage(filterOptions, count, logs.length);
            throw new AssertionError("assert.console", msg);
        }
    }
}
