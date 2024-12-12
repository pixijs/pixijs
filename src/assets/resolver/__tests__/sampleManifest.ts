import type { AssetsManifest } from '../../types';

export const manifest: AssetsManifest = {
    bundles: [
        {
            name: 'default',
            assets: [
                {
                    alias: 'image1',
                    src: [
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
                    alias: 'spriteSheet1',
                    src: [
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
                    alias: `spriteSheet2`,
                    src: [
                        {
                            resolution: 1,
                            format: 'png',
                            src: 'my-sprite-sheet-2.json',
                        },
                    ],
                },
                {
                    alias: 'levelData',
                    src: 'levelData.json',
                },
            ],
        },
        {
            name: 'level',
            assets: [
                {
                    alias: 'image3',
                    src: [
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
