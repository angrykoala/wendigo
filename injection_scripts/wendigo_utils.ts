declare const WendigoQuery: any;
declare const WendigoPathFinder: any;

export default function WendigoUtilsLoader(): void {
    if (!(window as any).WendigoUtils) {
        const _origDate = Date;

        (window as any).WendigoUtils = {
            isVisible(element: Element | Document | null): boolean {
                if (!element) return false;
                if (element === document) return true; // Top element, always visible
                else {
                    const style = window.getComputedStyle(element as Element);
                    if (style.display === 'none' ||
                        style.visibility === 'hidden' ||
                        style.opacity === '0') return false;
                    return this.isVisible(element.parentNode);
                }
            },
            queryElement(selector: any): Element {
                return WendigoQuery.query(selector);
            },
            queryAll(selector: any): Array<Element> {
                return WendigoQuery.queryAll(selector);
            },
            xPathQuery(xPath: any): Array<Element> {
                return WendigoQuery.queryXPathAll(xPath);
            },
            getStyles(element: Element): { [s: string]: string } {
                const rawStyles = getComputedStyle(element);
                const result: { [s: string]: string } = {};
                for (let i = 0; i < rawStyles.length; i++) {
                    const name = rawStyles[i];
                    result[name] = rawStyles.getPropertyValue(name);
                }
                return result;
            },
            mockDate(timestamp: number, freeze: boolean): void {
                let baseTimestamp = 0;
                if (!freeze) {
                    baseTimestamp = new _origDate().getTime();
                }
                function getCurrentTimestamp(): number {
                    if (!freeze) {
                        const currentTimestamp = new _origDate().getTime();
                        const timeDiff = currentTimestamp - baseTimestamp;
                        return timestamp + timeDiff;
                    } else return timestamp;
                }

                // Based on https://github.com/capaj/proxy-date
                (window as any).Date = new Proxy(_origDate, {
                    construct(target: typeof Date, args: Array<any>): Date {
                        if (args.length === 0) {
                            return new target(getCurrentTimestamp());
                        }
                        // @ts-ignore
                        return new target(...args);
                    },
                    get(_target: typeof Date, prop): () => number {
                        if (prop === 'now') {
                            return () => getCurrentTimestamp();
                        }
                        // @ts-ignore
                        return Reflect.get(...arguments);
                    },
                    apply(target: typeof Date): string {
                        return new target(getCurrentTimestamp()).toString();
                    }
                });
            },
            clearDateMock(): void {
                (window as any).Date = _origDate;
            },
            findCssPath(node: Element | Document): string {
                return WendigoPathFinder.cssPath(node);
            },
            findXPath(node: Element | Document): string {
                return WendigoPathFinder.xPath(node);
            },
        };
    }
}
