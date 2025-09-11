import { Cache } from '../../../assets/cache/Cache';
import { type BitmapFont } from '../../../scene/text-bitmap/BitmapFont';
import { type BitmapText } from '../../../scene/text-bitmap/BitmapText';
import { type PixiGL2DBitmapText } from '../../spec/extensions/nodes';
import { type GL2DBitmapFont } from '../../spec/resources';
import { serializeContainer } from './serializeContainer';

import type { ToGL2DOptions } from '../../GL2D';

/**
 * Gets the index of the bitmap font resource in the GL2D resources.
 * @param gl2D - The GL2D options.
 * @param fontFamily - The font family name.
 * @returns The index of the bitmap font resource, or undefined if not found.
 * @internal
 */
function getBitmapIndex(gl2D: ToGL2DOptions['gl2D'], fontFamily: string): number | undefined
{
    let bitmapFontIndex: number | undefined;

    if (Cache.has(`${fontFamily}-bitmap`))
    {
        const bitmapCache = Cache.get<BitmapFont>(`${fontFamily}-bitmap`);

        bitmapFontIndex = (gl2D.resources as GL2DBitmapFont[]).findIndex(
            (r) => r.type === 'bitmap_font' && r.uid === `bitmap_font_${bitmapCache.uid}`,
        );

        if (bitmapFontIndex === -1)
        {
            const bitmapResource: GL2DBitmapFont = {
                type: 'bitmap_font',
                uri: bitmapCache.url,
                uid: `bitmap_font_${bitmapCache.uid}`,
                fontFamily: bitmapCache.fontFamily,
            };

            gl2D.resources.push(bitmapResource);
            bitmapFontIndex = gl2D.resources.length - 1;
        }
    }

    return bitmapFontIndex;
}

/**
 * Serializes the text into a gl2D-compatible format.
 * @param instance - The text instance to serialize.
 * @param options - The gl2D serialization context and options.
 * @returns The updated gl2D serialization context.
 * @internal
 */
export async function serializeBitmapText(instance: BitmapText, options: ToGL2DOptions): Promise<ToGL2DOptions>
{
    const { gl2D } = options;

    await serializeContainer(instance, options);
    const text = gl2D.nodes.find((node) => node.uid === `${instance.uid}`);

    if (!text)
    {
        throw new Error(`BitmapText with uid ${instance.uid} not found in GL2D nodes.`);
    }

    let styleIndex = gl2D.resources.findIndex((style) => style.uid === `text_style_${instance.style.uid}`);

    if (styleIndex === -1)
    {
        await instance.style.serialize(options);
        styleIndex = gl2D.resources.findIndex((style) => style.uid === `text_style_${instance.style.uid}`);
    }

    // we now also need to get the webfont resource
    const fontFamily = instance.style.fontFamily;
    const bitmapFontIndex = getBitmapIndex(gl2D, fontFamily as string);

    const fullText: PixiGL2DBitmapText = {
        ...text,
        type: 'bitmap_text',
        text: instance.text,
        style: styleIndex,
        resolution: instance.resolution,
        bitmapFont: bitmapFontIndex,
        extensions: {
            pixi_container_node: {
                ...text.extensions.pixi_container_node,
                anchor: [instance.anchor.x, instance.anchor.y],
            },
            pixi_text_node: {
                roundPixels: instance.roundPixels,
            },
        },
    };

    // Assign the full text back to the original text
    Object.assign(text, fullText);

    gl2D.extensionsUsed.push('pixi_text_node');

    return options;
}

/**
 * Mixin for serializing a bitmapText to a gl2D-compatible format.
 * @category gl2d
 * @standard
 */
export interface SerializeBitmapTextMixin
{
    /**
     * Serializes the bitmapText to a gl2D-compatible format.
     * @param {ToGL2DOptions} gl2DOptions - The gl2D serialization context and options.
     */
    serialize(gl2DOptions: ToGL2DOptions): Promise<ToGL2DOptions>;
}

/** @internal */
export const serializeBitmapTextMixin: Partial<BitmapText> = {
    serialize(gl2DOptions: ToGL2DOptions): Promise<ToGL2DOptions>
    {
        return serializeBitmapText(this, gl2DOptions);
    },
} as BitmapText;
