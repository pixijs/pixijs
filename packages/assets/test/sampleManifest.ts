import type {  ResolverManifest } from '../src/resolver/Resolver';

export const manifest: ResolverManifest = {
    bundles: [
        {
            name: 'default',
            assets: [
                {
                    name: 'image1',
                    srcs: [
                        {
                            resolution: 1,
                            format: 'png',
                            src: 'my-sprite@2x.png',
                        },
                        {
                            resolution: 2,
                            format: 'png',
                            src: 'my-image@2x.png',
                        },
                    ],
                },
                {
                    name: 'spriteSheet1',
                    srcs: [
                        {
                            resolution: 1,
                            format: 'png',
                            src: 'my-sprite-sheet.json',
                        },
                        {
                            resolution: 2,
                            format: 'png',
                            src: 'my-sprite-sheet@2x.json',
                        },
                    ],
                },
                {
                    name: `spriteSheet2`,
                    srcs: [
                        {
                            resolution: 1,
                            format: 'png',
                            src: 'my-sprite-sheet-2.json',
                        },
                    ],
                },
                {
                    name: 'levelData',
                    srcs: 'levelData.json',
                },
            ],
        },
        {
            name: 'level',
            assets: [
                {
                    name: 'image3',
                    srcs: [
                        {
                            resolution: 1,
                            format: 'png',
                            src: 'chicken.png',
                        },
                        {
                            resolution: 2,
                            format: 'png',
                            src: 'chicken@2x.png',
                        },
                    ],
                },
            ],
        },
    ],
};
