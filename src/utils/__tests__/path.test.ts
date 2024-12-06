import { path } from '../path';

describe('Paths', () =>
{
    it('should convert paths to posix', () =>
    {
        expect(path.toPosix('C:\\foo\\bar')).toBe('C:/foo/bar');
        expect(path.toPosix('C:\\foo\\bar/')).toBe('C:/foo/bar/');
        expect(path.toPosix('C:\\foo/bar')).toBe('C:/foo/bar');

        expect(path.toPosix('foo\\bar')).toBe('foo/bar');
        expect(path.toPosix('foo\\bar/baz')).toBe('foo/bar/baz');
    });

    it('should check if path is a url', () =>
    {
        expect(path.isUrl('http://foo.com')).toBe(true);
        expect(path.isUrl('https://foo.com')).toBe(true);
        expect(path.isUrl('http://foo.com/bar/baz')).toBe(true);
        expect(path.isUrl('https://foo.com/bar/baz')).toBe(true);
        expect(path.isUrl('https://foo.com/bar/baz/')).toBe(true);

        expect(path.isUrl('file:///foo/bar/baz')).toBe(false);
        expect(path.isUrl('data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==')).toBe(false);
        expect(path.isUrl('blob:http://example.com/00000000-0000-0000-0000-000000000000')).toBe(false);
        expect(path.isUrl('blob:https://example.com/00000000-0000-0000-0000-000000000000')).toBe(false);
        expect(path.isUrl('C:/foo/bar')).toBe(false);
        expect(path.isUrl('C:\\foo\\bar')).toBe(false);
        expect(path.isUrl('//foo.com')).toBe(false);
        expect(path.isUrl('foo.com')).toBe(false);
        expect(path.isUrl('/foo.com')).toBe(false);
        expect(path.isUrl('foo/bar')).toBe(false);
    });

    it('should check if a path contains a protocol', () =>
    {
        expect(path.hasProtocol('http://foo.com')).toBe(true);
        expect(path.hasProtocol('https://foo.com')).toBe(true);
        expect(path.hasProtocol('https://foo.com/')).toBe(true);
        expect(path.hasProtocol('file:///foo/bar/baz')).toBe(true);
        expect(path.hasProtocol('data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==')).toBe(true);
        expect(path.hasProtocol('blob:http://example.com/00000000-0000-0000-0000-000000000000')).toBe(true);
        expect(path.hasProtocol('blob:https://example.com/00000000-0000-0000-0000-000000000000')).toBe(true);
        expect(path.hasProtocol('C:/foo/bar')).toBe(true);
        expect(path.hasProtocol('C:\\foo\\bar')).toBe(true);

        expect(path.hasProtocol('//foo.com')).toBe(false);
        expect(path.hasProtocol('foo.com')).toBe(false);
        expect(path.hasProtocol('/foo.com')).toBe(false);
        expect(path.hasProtocol('foo/bar')).toBe(false);
    });

    it('should extract the protocol from a url', () =>
    {
        expect(path.getProtocol('http://foo.com')).toBe('http://');
        expect(path.getProtocol('https://foo.com')).toBe('https://');
        expect(path.getProtocol('https://foo.com/')).toBe('https://');
        expect(path.getProtocol('file:///foo/bar/baz')).toBe('file:///');
        expect(path.getProtocol('data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==')).toBe('data:');
        expect(path.getProtocol('blob:http://example.com/00000000-0000-0000-0000-000000000000')).toBe('blob:');
        expect(path.getProtocol('blob:https://example.com/00000000-0000-0000-0000-000000000000')).toBe('blob:');
        expect(path.getProtocol('C:/foo/bar')).toBe('C:/');
        expect(path.getProtocol('C:\\foo\\bar')).toBe('C:/');
        expect(path.getProtocol('/foo/bar/baz')).toBe('');
        expect(path.getProtocol('foo\\bar\\baz')).toBe('');
    });

    it('should state if a path is absolute or not', () =>
    {
        expect(path.isAbsolute('http://foo.com/bar/baz')).toBe(true);
        expect(path.isAbsolute('https://foo.com/bar/baz')).toBe(true);
        expect(path.isAbsolute('https://foo.com/bar/baz/')).toBe(true);
        expect(path.isAbsolute('file:///foo/bar/baz')).toBe(true);
        expect(path.isAbsolute('data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==')).toBe(true);
        expect(path.isAbsolute('blob:http://example.com/00000000-0000-0000-0000-000000000000')).toBe(true);
        expect(path.isAbsolute('blob:https://example.com/00000000-0000-0000-0000-000000000000')).toBe(true);
        expect(path.isAbsolute('C:\\foo\\bar')).toBe(true);
        expect(path.isAbsolute('C:/foo/bar')).toBe(true);
        expect(path.isAbsolute('C:/foo/bar/')).toBe(true);
        expect(path.isAbsolute('/foo/bar')).toBe(true);
        expect(path.isAbsolute('/foo/bar/')).toBe(true);

        expect(path.isAbsolute('foo/bar')).toBe(false);
        expect(path.isAbsolute('foo/bar/')).toBe(false);
        expect(path.isAbsolute('foo\\bar')).toBe(false);
        expect(path.isAbsolute('../foo/bar')).toBe(false);
        expect(path.isAbsolute('./foo/bar')).toBe(false);
    });

    it('should normalise the path', () =>
    {
        expect(path.normalize('https://foo.com/bar/baz//file')).toBe('https://foo.com/bar/baz/file');
        expect(path.normalize('https://foo.com/bar/baz/../file')).toBe('https://foo.com/bar/file');
        expect(path.normalize('https://foo.com/../bar/baz//file')).toBe('https://foo.com/bar/baz/file');
        expect(path.normalize('https://foo.com/../../bar/baz//file')).toBe('https://foo.com/bar/baz/file');
        expect(path.normalize('https://foo.com/../../../../../bar/baz//file')).toBe('https://foo.com/bar/baz/file');
        expect(path.normalize('file:///foo/../../../../../bar/baz//file')).toBe('file:///bar/baz/file');
        expect(path.normalize('file:///foo/bar/baz//file')).toBe('file:///foo/bar/baz/file');
        expect(path.normalize('data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='))
            .toBe('data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==');
        expect(path.normalize('blob:http://example.com/00000000-0000-0000-0000-000000000000'))
            .toBe('blob:http://example.com/00000000-0000-0000-0000-000000000000');
        expect(path.normalize('blob:https://example.com/00000000-0000-0000-0000-000000000000'))
            .toBe('blob:https://example.com/00000000-0000-0000-0000-000000000000');
        expect(path.normalize('C:/foo/../../../../../bar/baz//file')).toBe('C:/bar/baz/file');
        expect(path.normalize('C:\\foo\\bar\\baz\\file')).toBe('C:/foo/bar/baz/file');
        expect(path.normalize('C:/foo\\bar\\baz\\file')).toBe('C:/foo/bar/baz/file');
        expect(path.normalize('/foo/../../../../../bar/baz//file')).toBe('/bar/baz/file');
        expect(path.normalize('/foo/bar/baz/file')).toBe('/foo/bar/baz/file');
        expect(path.normalize('foo')).toBe('foo');
    });

    it('should join paths', () =>
    {
        expect(path.join('http://foo.com/index.html', '../bar/baz/file')).toBe('http://foo.com/bar/baz/file');
        expect(path.join('http://foo.com/bar/index.html', '../baz/file')).toBe('http://foo.com/baz/file');
        expect(path.join('http://foo.com/bar/index.html', './baz/file')).toBe('http://foo.com/bar/baz/file');
        expect(path.join('http://foo.com/bar/index.html', 'baz/file')).toBe('http://foo.com/bar/baz/file');
        expect(path.join('http://foo.com/bar/index.html?var=a', '../baz/file')).toBe('http://foo.com/baz/file');
        expect(path.join('http://foo.com/bar/index.html?var=a#hash', '../baz/file')).toBe('http://foo.com/baz/file');
        expect(path.join('http://foo.com/bar/index.html#hash', '../baz/file')).toBe('http://foo.com/baz/file');

        expect(path.join('http://foo.com/bar3.0/', './baz/file')).toBe('http://foo.com/bar3.0/baz/file');
        expect(path.join('http://foo.com/bar3.0/', '../baz/file')).toBe('http://foo.com/baz/file');
        expect(path.join('http://foo.com/bar/', '../baz3.0/file')).toBe('http://foo.com/baz3.0/file');

        expect(path.join('http://foo.com', '../bar/baz/file')).toBe('http://foo.com/bar/baz/file');
        expect(path.join('https://foo.com', '../bar/baz/file')).toBe('https://foo.com/bar/baz/file');
        expect(path.join('file:///foo', '../bar/baz/file')).toBe('file:///bar/baz/file');
        expect(path.join('/foo', '../bar/baz/file')).toBe('/bar/baz/file');
        expect(path.join('C:/foo', '../bar/baz/file')).toBe('C:/bar/baz/file');
        expect(path.join('C:\\foo', '..\\bar\\baz\\file')).toBe('C:/bar/baz/file');

        expect(path.join('http://foo.com', '../../bar/baz/file')).toBe('http://foo.com/bar/baz/file');
        expect(path.join('https://foo.com', '../../bar/baz/file')).toBe('https://foo.com/bar/baz/file');
        expect(path.join('file:///foo', '../../bar/baz/file')).toBe('file:///bar/baz/file');
        expect(path.join('/foo', '../../bar/baz/file')).toBe('/bar/baz/file');
        expect(path.join('C:/foo', '../../bar/baz/file')).toBe('C:/bar/baz/file');
        expect(path.join('C:\\foo', '..\\..\\bar\\baz\\file')).toBe('C:/bar/baz/file');

        expect(path.join('http://foo.com', 'bar/baz/file', '../test')).toBe('http://foo.com/bar/baz/test');
        expect(path.join('https://foo.com', 'bar/baz/file', '../test')).toBe('https://foo.com/bar/baz/test');
        expect(path.join('file:///foo', 'bar/baz/file', '../test')).toBe('file:///foo/bar/baz/test');
        expect(path.join('/foo', 'bar/baz/file', '../test')).toBe('/foo/bar/baz/test');
        expect(path.join('C:/foo', 'bar/baz/file', '../test')).toBe('C:/foo/bar/baz/test');
        expect(path.join('C:\\foo', 'bar/baz/file', '../test')).toBe('C:/foo/bar/baz/test');
    });

    it('should get the directory name', () =>
    {
        expect(path.dirname('C:\\domain/')).toBe('C:/');
        expect(path.dirname('C:/domain/')).toBe('C:/');
        expect(path.dirname('/domain')).toBe('/');
        expect(path.dirname('C:\\')).toBe('C:/');
        expect(path.dirname('C:/')).toBe('C:/');
        expect(path.dirname('/')).toBe('/');
        expect(path.dirname('http://domain.com/')).toBe('http://domain.com/');
        expect(path.dirname('file:///domain/')).toBe('file:///');
        expect(path.dirname('C:\\domain/path')).toBe('C:/domain');
        expect(path.dirname('C:/domain/path')).toBe('C:/domain');
        expect(path.dirname('/domain/path')).toBe('/domain');
        expect(path.dirname('http://domain.com/path')).toBe('http://domain.com');
        expect(path.dirname('file:///domain/path')).toBe('file:///domain');
        expect(path.dirname('C:\\domain/path/to/file')).toBe('C:/domain/path/to');
        expect(path.dirname('C:/domain/path/to/file')).toBe('C:/domain/path/to');
        expect(path.dirname('/domain/path/to/file')).toBe('/domain/path/to');
        expect(path.dirname('http://domain.com/path/to/file')).toBe('http://domain.com/path/to');
        expect(path.dirname('file:///domain/path/to/file')).toBe('file:///domain/path/to');
        expect(path.dirname('domain.com/path/to/file')).toBe('domain.com/path/to');
        expect(path.dirname('domain')).toBe('');
    });

    it('should get the root of a path', () =>
    {
        expect(path.rootname('https://domain.com')).toBe('https://domain.com/');
        expect(path.rootname('/domain')).toBe('/');
        expect(path.rootname('C:/domain')).toBe('C:/');
        expect(path.rootname('https://domain.com/path')).toBe('https://domain.com/');
        expect(path.rootname('https://domain.com/')).toBe('https://domain.com/');
        expect(path.rootname('file:///domain')).toBe('file:///');
        expect(path.rootname('/domain.com')).toBe('/');
        expect(path.rootname('C:/domain/path')).toBe('C:/');
    });

    it('should get the basename of a path', () =>
    {
        expect(path.basename('https://foo.com/bar/baz/file.txt')).toBe('file.txt');
        expect(path.basename('file:///foo.com/bar/baz/file.txt')).toBe('file.txt');
        expect(path.basename('C:/foo/bar/baz/file.txt')).toBe('file.txt');
        expect(path.basename('C:\\foo\\bar\\bar\\file.txt')).toBe('file.txt');
        expect(path.basename('/foo/bar/baz/file.txt')).toBe('file.txt');
        expect(path.basename('foo/bar/baz/file.txt')).toBe('file.txt');

        expect(path.basename('https://foo.com/bar/baz/file.txt', '.txt')).toBe('file');
        expect(path.basename('file:///foo/bar/baz/file.txt', '.txt')).toBe('file');
        expect(path.basename('C:/foo/bar/baz/file.txt', '.txt')).toBe('file');
        expect(path.basename('C:\\foo\\bar\\bar\\file.txt', '.txt')).toBe('file');
        expect(path.basename('/foo/bar/baz/file.txt', '.txt')).toBe('file');
        expect(path.basename('foo/bar/baz/file.txt', '.txt')).toBe('file');
    });

    it('should get the extension of a path', () =>
    {
        expect(path.extname('https://foo.com/bar/baz/file.TXT')).toBe('.TXT');
        expect(path.extname('https://foo.com/bar/baz/file.txt')).toBe('.txt');
        expect(path.extname('file:///foo/bar/baz/file.txt')).toBe('.txt');
        expect(path.extname('C:/foo/bar/baz/file.txt')).toBe('.txt');
        expect(path.extname('C:\\foo\\bar\\bar\\file.txt')).toBe('.txt');
        expect(path.extname('/foo/bar/baz/file.txt')).toBe('.txt');
        expect(path.extname('foo/bar/baz/file.txt')).toBe('.txt');
        expect(path.extname('foo/bar')).toBe('');
        expect(path.extname('foo')).toBe('');
    });

    it('should parse a path', () =>
    {
        expect(path.parse('https://domain.com/')).toEqual(expect.objectContaining(
            { root: 'https://domain.com/', dir: 'https://domain.com/', base: 'domain.com', ext: '.com', name: 'domain' }
        ));
        expect(path.parse('https://domain.com/path/to/file.txt')).toEqual(expect.objectContaining(
            { root: 'https://domain.com/', dir: 'https://domain.com/path/to', base: 'file.txt', ext: '.txt', name: 'file' }
        ));
        expect(path.parse('file:///domain/path/to/file.txt')).toEqual(expect.objectContaining(
            { root: 'file:///', dir: 'file:///domain/path/to', base: 'file.txt', ext: '.txt', name: 'file' }
        ));
        expect(path.parse('C:/domain.com/path/to/file.txt')).toEqual(expect.objectContaining(
            { root: 'C:/', dir: 'C:/domain.com/path/to', base: 'file.txt', ext: '.txt', name: 'file' }
        ));
        expect(path.parse('C:/domain')).toEqual(expect.objectContaining(
            { root: 'C:/', dir: 'C:/', base: 'domain', ext: '', name: 'domain' }
        ));
        expect(path.parse('/domain/path/to/file.txt')).toEqual(expect.objectContaining(
            { root: '/', dir: '/domain/path/to', base: 'file.txt', ext: '.txt', name: 'file' }
        ));
        expect(path.parse('/domain')).toEqual(expect.objectContaining(
            { root: '/', dir: '/', base: 'domain', ext: '', name: 'domain' }
        ));
        expect(path.parse('domain')).toEqual(expect.objectContaining(
            { root: '', dir: '', base: 'domain', ext: '', name: 'domain' }
        ));
        expect(path.parse('/domain/path')).toEqual(expect.objectContaining(
            { root: '/', dir: '/domain', base: 'path', ext: '', name: 'path' }
        ));

        expect(path.parse('http://0.0.0.0:8080/games/game3.0/resources/config.json')).toEqual(expect.objectContaining(
            {
                root: 'http://0.0.0.0:8080/',
                dir: 'http://0.0.0.0:8080/games/game3.0/resources',
                base: 'config.json',
                ext: '.json',
                name: 'config'
            }
        ));
    });

    it('should create absolute urls', () =>
    {
        // relative paths
        expect(path.toAbsolute('./img/browser.png', 'http://example.com/page-1/'))
            .toEqual(`http://example.com/page-1/img/browser.png`);
        expect(path.toAbsolute('./img/browser.png', 'http://example.com/page-1/'))
            .toEqual(`http://example.com/page-1/img/browser.png`);
        expect(path.toAbsolute('browser.png', 'http://example.com/page-1')).toEqual(`http://example.com/page-1/browser.png`);
        expect(path.toAbsolute('img/browser.png', 'http://example.com/page-1/'))
            .toEqual(`http://example.com/page-1/img/browser.png`);
        expect(path.toAbsolute('windows.png', 'C:/foo/bar/')).toEqual(`C:/foo/bar/windows.png`);
        expect(path.toAbsolute('windows.png', 'C:/foo/bar')).toEqual(`C:/foo/bar/windows.png`);
        expect(path.toAbsolute('windows.png', 'C:\\foo\\bar\\')).toEqual(`C:/foo/bar/windows.png`);
        expect(path.toAbsolute('mac.png', '/foo/bar/')).toEqual(`/foo/bar/mac.png`);
        expect(path.toAbsolute('mac.png', '/foo/bar')).toEqual(`/foo/bar/mac.png`);

        // dots in path
        expect(path.toAbsolute('./img3.0/browser.png', 'http://example.com/page-1/'))
            .toEqual(`http://example.com/page-1/img3.0/browser.png`);

        expect(path.toAbsolute('./browser.png', 'http://example.com/page-1/bar3.0'))
            .toEqual(`http://example.com/page-1/bar3.0/browser.png`);
        expect(path.toAbsolute('./img/browser.png', 'http://example.com/page-1/bar3.0'))
            .toEqual(`http://example.com/page-1/bar3.0/img/browser.png`);
        expect(path.toAbsolute('img/browser.png', 'http://example.com/page-1/bar3.0'))
            .toEqual(`http://example.com/page-1/bar3.0/img/browser.png`);
        expect(path.toAbsolute('windows.png', 'C:/foo/bar/baz3.0')).toEqual(`C:/foo/bar/baz3.0/windows.png`);
        expect(path.toAbsolute('mac.png', '/foo/bar/baz3.0')).toEqual(`/foo/bar/baz3.0/mac.png`);

        expect(path.toAbsolute('./browser.png', 'http://example.com/page-1/bar3.0?var=a#hash'))
            .toEqual(`http://example.com/page-1/bar3.0/browser.png`);
        expect(path.toAbsolute('./img/browser.png', 'http://example.com/page-1/bar3.0?var=a#hash'))
            .toEqual(`http://example.com/page-1/bar3.0/img/browser.png`);
        expect(path.toAbsolute('img/browser.png', 'http://example.com/page-1/bar3.0?var=a#hash'))
            .toEqual(`http://example.com/page-1/bar3.0/img/browser.png`);

        // paths with extensions
        expect(path.toAbsolute('./browser.png', 'http://example.com/page-1/index.html'))
            .toEqual(`http://example.com/page-1/browser.png`);
        expect(path.toAbsolute('./img/browser.png', 'http://example.com/page-1/index.html'))
            .toEqual(`http://example.com/page-1/img/browser.png`);
        expect(path.toAbsolute('img/browser.png', 'http://example.com/page-1/index.html'))
            .toEqual(`http://example.com/page-1/img/browser.png`);
        expect(path.toAbsolute('windows.png', 'C:/foo/bar/index.html')).toEqual(`C:/foo/bar/windows.png`);
        expect(path.toAbsolute('mac.png', '/foo/bar/index.html')).toEqual(`/foo/bar/mac.png`);

        // path with query string
        expect(path.toAbsolute('./browser.png', 'http://example.com/page-1/index.html?var=a#hash'))
            .toEqual(`http://example.com/page-1/browser.png`);
        expect(path.toAbsolute('./img/browser.png', 'http://example.com/page-1/index.html?var=a#hash'))
            .toEqual(`http://example.com/page-1/img/browser.png`);
        expect(path.toAbsolute('img/browser.png', 'http://example.com/page-1/index.html?var=a#hash'))
            .toEqual(`http://example.com/page-1/img/browser.png`);
        expect(path.toAbsolute('img/browser.png', 'http://example.com/page-1?var=a#hash'))
            .toEqual(`http://example.com/page-1/img/browser.png`);
        expect(path.toAbsolute('img/browser.png', 'http://example.com/page-1/?var=a#hash'))
            .toEqual(`http://example.com/page-1/img/browser.png`);

        // root relative paths
        expect(path.toAbsolute('/browser.png', undefined, 'http://example.com/')).toEqual(`http://example.com/browser.png`);
        expect(path.toAbsolute('/browser.png', undefined, 'http://example.com')).toEqual(`http://example.com/browser.png`);

        expect(path.toAbsolute('/windows.png', undefined, 'C:/foo/')).toEqual(`C:/foo/windows.png`);
        expect(path.toAbsolute('/windows.png', undefined, 'C:/foo')).toEqual(`C:/foo/windows.png`);
        expect(path.toAbsolute('/windows.png', undefined, 'C:\\foo\\')).toEqual(`C:/foo/windows.png`);
        expect(path.toAbsolute('/mac.png', undefined, '/foo/')).toEqual(`/foo/mac.png`);
        expect(path.toAbsolute('/mac.png', undefined, '/foo')).toEqual(`/foo/mac.png`);

        // url is already absolute
        expect(path.toAbsolute('http://example.com/browser.png')).toEqual(`http://example.com/browser.png`);
        expect(path.toAbsolute('data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='))
            .toBe('data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==');
        expect(path.toAbsolute('blob:http://example.com/00000000-0000-0000-0000-000000000000'))
            .toBe('blob:http://example.com/00000000-0000-0000-0000-000000000000');
        expect(path.toAbsolute('blob:https://example.com/00000000-0000-0000-0000-000000000000'))
            .toBe('blob:https://example.com/00000000-0000-0000-0000-000000000000');
        expect(path.toAbsolute('C:/windows.png')).toEqual(`C:/windows.png`);
        expect(path.toAbsolute('C:\\windows.png')).toEqual(`C:/windows.png`);
    });

    it('should detect if path is a data url', () =>
    {
        const valid = [
            'data:image/png;base64,abc',
            'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2',
            'data:image/svg+xml;charset=utf-8;name=bar.svg,%3Csvg%20xmlns%3D%22http%3A%2',
            'data:image/png;name=foo.png;base64,abc',
            'data:image/svg+xml;base64,abc',
            'data:,A%20brief%20note',
            'data:text/html;charset=US-ASCII,%3Ch1%3EHello!%3C%2Fh1%3E',
            'data:audio/mp3;base64,%3Ch1%3EHello!%3C%2Fh1%3E',
            'data:video/x-ms-wmv;base64,%3Ch1%3EHello!%3C%2Fh1%3E',
            'data:application/vnd.ms-excel;base64,PGh0bWw%2BPC9odG1sPg%3D%3D',
            'data:image/svg+xml;name=foobar%20(1).svg;charset=UTF-8,some-data',
            'data:image/svg+xml;name=lorem_ipsum.txt;charset=UTF-8,some-data',
            'data:text/html,<script>alert(\'hi\');</script>'
        ];

        const invalid = [
            'dataxbase64',
            'data:HelloWorld',
            'data:text/html;charset=,%3Ch1%3EHello!%3C%2Fh1%3E',
            'data:text/plain;name=@;base64,SGVsbG8sIFdvcmxkIQ%3D%3D',
            'data:text/html;charset,%3Ch1%3EHello!%3C%2Fh1%3E',
            'data:base64,abc',
            '',
            'http://wikipedia.org',
            'base64',
            'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAABlBMVEUAAAD///+l2Z/dA'
        ];

        valid.forEach((value) =>
        {
            expect(path.isDataUrl(value)).toBe(true);
        });
        invalid.forEach((value) =>
        {
            expect(path.isDataUrl(value)).toBe(false);
        });
    });

    it('should normalise url params correctly', () =>
    {
        const url = 'http://example.com/page-1/my-font.xml?var=a&var2=b#hash';

        expect(path.extname(url)).toEqual('.xml');
        expect(path.basename(url)).toEqual('my-font.xml');
        expect(path.dirname(url)).toEqual('http://example.com/page-1');
        expect(path.parse(url)).toEqual({
            root: 'http://example.com/',
            dir: 'http://example.com/page-1',
            base: 'my-font.xml',
            ext: '.xml',
            name: 'my-font'
        });
    });
});
