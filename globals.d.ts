declare namespace WendigoUtils {
    function isVisible(element: HTMLElement): boolean;
    function queryElement(selector: string | HTMLElement): HTMLElement; // TODO: may return null
    function queryAll(selector: string | HTMLElement): Array<HTMLElement>;
    function xPathQuery(xPath: string): Array<HTMLElement>;
    function getStyles(element: string | HTMLElement): { [s: string]: string };
    function mockDate(timestamp: number, freeze: boolean): void;
    function clearDateMock(): void;
    function findCssPath(node: HTMLElement): string;
    function findXPath(node: HTMLElement): string;
}
