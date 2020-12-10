/**
 * "url" module typings simplified from @types/node
 */
declare module "url" {
    interface ParsedUrlQuery { [key: string]: string | string[]; }
    interface ParsedUrlQueryInput {
        [key: string]: unknown;
    }
    interface UrlObjectCommon {
        auth?: string;
        hash?: string;
        host?: string;
        hostname?: string;
        href?: string;
        path?: string;
        pathname?: string;
        protocol?: string;
        search?: string;
        slashes?: boolean;
    }

    // Input to `url.format`
    interface UrlObject extends UrlObjectCommon {
        port?: string | number;
        query?: string | null | ParsedUrlQueryInput;
    }

    // Output of `url.parse`
    interface Url extends UrlObjectCommon {
        port?: string;
        query?: string | null | ParsedUrlQuery;
    }

    interface UrlWithParsedQuery extends Url {
        query: ParsedUrlQuery;
    }

    interface UrlWithStringQuery extends Url {
        query: string | null;
    }

    export function parse(urlStr: string): UrlWithStringQuery;
    export function parse(urlStr: string, parseQueryString: false | undefined, slashesDenoteHost?: boolean): UrlWithStringQuery;
    export function parse(urlStr: string, parseQueryString: true, slashesDenoteHost?: boolean): UrlWithParsedQuery;
    export function parse(urlStr: string, parseQueryString: boolean, slashesDenoteHost?: boolean): Url;

    export function format(urlObject: UrlObject | string): string;
    export function resolve(from: string, to: string): string;
}
