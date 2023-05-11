/*
 * This file contains redeclared types for Node `url` and `querystring` modules. These modules
 * don't provide their own typings but instead are a part of the full Node typings. The purpose of
 * this file is to redeclare the required types to avoid having the whole Node types as a
 * dependency.
 */

import { format as _format, parse as _parse, resolve as _resolve } from 'url';
import { deprecation } from './logging/deprecation';

interface ParsedUrlQuery
{
    [key: string]: string | string[];
}

interface ParsedUrlQueryInput
{
    [key: string]: unknown;
}

interface UrlObjectCommon
{
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
interface UrlObject extends UrlObjectCommon
{
    port?: string | number;
    query?: string | null | ParsedUrlQueryInput;
}

// Output of `url.parse`
interface Url extends UrlObjectCommon
{
    port?: string;
    query?: string | null | ParsedUrlQuery;
}

interface UrlWithParsedQuery extends Url
{
    query: ParsedUrlQuery;
}

interface UrlWithStringQuery extends Url
{
    query: string | null;
}

interface URLFormatOptions
{
    auth?: boolean;
    fragment?: boolean;
    search?: boolean;
    unicode?: boolean;
}

type ParseFunction = {
    (urlStr: string): UrlWithStringQuery;
    (urlStr: string, parseQueryString: false | undefined, slashesDenoteHost?: boolean): UrlWithStringQuery;
    (urlStr: string, parseQueryString: true, slashesDenoteHost?: boolean): UrlWithParsedQuery;
    (urlStr: string, parseQueryString: boolean, slashesDenoteHost?: boolean): Url;
};

type FormatFunction = {
    (URL: URL, options?: URLFormatOptions): string;
    (urlObject: UrlObject | string): string;
};

type ResolveFunction = {
    (from: string, to: string): string;
};

export const url = {
    /**
     * @deprecated since 7.3.0
     */
    get parse()
    {
        // #if _DEBUG
        deprecation('7.3.0', 'utils.url.parse is deprecated, use native URL API instead.');
        // #endif

        return _parse as ParseFunction;
    },
    /**
     * @deprecated since 7.3.0
     */
    get format()
    {
        // #if _DEBUG
        deprecation('7.3.0', 'utils.url.format is deprecated, use native URL API instead.');
        // #endif

        return _format as FormatFunction;
    },
    /**
     * @deprecated since 7.3.0
     */
    get resolve()
    {
        // #if _DEBUG
        deprecation('7.3.0', 'utils.url.resolve is deprecated, use native URL API instead.');
        // #endif

        return _resolve as ResolveFunction;
    }
};
