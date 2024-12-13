import { Assets } from '../Assets';
import { detectAvif } from '../detections/parsers/detectAvif';
import { detectDefaults } from '../detections/parsers/detectDefaults';
import { detectMp4 } from '../detections/parsers/detectMp4';
import { detectOgv } from '../detections/parsers/detectOgv';
import { detectWebm } from '../detections/parsers/detectWebm';
import { detectWebp } from '../detections/parsers/detectWebp';
import { ExtensionType } from '~/extensions';

describe('Assets', () =>
{
    const defaultDetections = [
        detectAvif,
        detectWebp,
        detectDefaults,
        detectMp4,
        detectWebm,
        detectOgv
    ];

    const passDetection = {
        format: 'foo',
        extension: {
            type: ExtensionType.DetectionParser,
            priority: 0
        },
        test: async () => true,
        async add(formats: string[]): Promise<string[]>
        {
            return [...formats, this.format];
        },
        async remove(formats: string[]): Promise<string[]>
        {
            return formats.filter((f) => f !== this.format);
        }
    };

    const failDetection = {
        extension: {
            type: ExtensionType.DetectionParser,
        },
        test: async () => false,
        add: async (formats: string[]) => [...formats, 'bar'],
        remove: async (formats: string[]) => formats.filter((f) => f !== 'bar'),
    };

    beforeEach(() =>
    {
        // reset the loader
        Assets.reset();
    });

    it('should add format', async () =>
    {
        const pass = { ...passDetection };
        const fail = { ...failDetection };

        const res = await Assets['_detectFormats']({
            preferredFormats: null,
            skipDetections: false,
            detections: [...defaultDetections, pass, fail],
        });

        expect(res).toEqual([
            'avif',
            'webp',
            'png',
            'jpg',
            'jpeg',
            'mp4',
            'm4v',
            'webm',
            'ogv',
            // added foo
            'foo',
        ]);
    });

    it('should prioritise a user defined format', async () =>
    {
        const pass = { ...passDetection };
        const pass2 = { ...passDetection };
        const fail = { ...failDetection };

        pass2.format = 'baz';

        const res = await Assets['_detectFormats']({
            preferredFormats: ['foo', 'bar', 'baz', 'ogv'],
            skipDetections: false,
            detections: [...defaultDetections, pass, fail, pass2],
        });

        expect(res).toEqual([
            // added foo and baz to the start
            'foo',
            'baz',
            'ogv',
            'avif',
            'webp',
            'png',
            'jpg',
            'jpeg',
            'mp4',
            'm4v',
            'webm',
        ]);
    });
});
