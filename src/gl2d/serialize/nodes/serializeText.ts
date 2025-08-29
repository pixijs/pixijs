import { Cache } from '../../../assets/cache/Cache';
import { type FontFaceCache } from '../../../assets/loader/parsers/loadWebFont';
import { type Text } from '../../../scene/text/Text';
import { type PixiGL2DText } from '../../spec/extensions/nodes';
import { type GL2DWebFont } from '../../spec/resources';
import { serializeContainer } from './serializeContainer';

import type { ToGL2DOptions } from '../../GL2D';

/**
 * Gets the index of the web font resource in the GL2D resources.
 * @param gl2D - The GL2D options.
 * @param fontFamily - The font family name.
 * @returns The index of the web font resource, or undefined if not found.
 * @internal
 */
function getWebFontIndex(gl2D: ToGL2DOptions['gl2D'], fontFamily: string): number | undefined
{
    let webFontIndex: number | undefined;

    if (Cache.has(`${fontFamily}-and-url`))
    {
        const webfontCache = Cache.get<FontFaceCache>(`${fontFamily}-and-url`);

        webFontIndex = (gl2D.resources as GL2DWebFont[]).findIndex(
            (r) => r.type === 'web_font' && r.family === fontFamily,
        );

        if (webFontIndex === -1)
        {
            webfontCache.entries.forEach((entry) =>
            {
                const webfontResource: GL2DWebFont = {
                    type: 'web_font',
                    family: fontFamily as string,
                    weights: entry.faces.map((face) => face.weight),
                    uri: entry.url,
                    variant: entry.faces[0].variant,
                    unicodeRange: entry.faces[0].unicodeRange,
                    stretch: entry.faces[0].stretch,
                    featureSettings: entry.faces[0].featureSettings,
                    display: entry.faces[0].display,
                    style: entry.faces[0].style,
                };

                gl2D.resources.push(webfontResource);
                webFontIndex = gl2D.resources.length - 1;
            });
        }
    }

    return webFontIndex;
}

/**
 * Serializes the text into a gl2D-compatible format.
 * @param instance - The text instance to serialize.
 * @param options - The gl2D serialization context and options.
 * @returns The updated gl2D serialization context.
 * @internal
 */
export async function serializeText(instance: Text, options: ToGL2DOptions): Promise<ToGL2DOptions>
{
    const { gl2D } = options;

    await serializeContainer(instance, options);
    const text = gl2D.nodes.find((node) => node.uid === `${instance.uid}`);

    if (!text)
    {
        throw new Error(`Text with uid ${instance.uid} not found in GL2D nodes.`);
    }

    let styleIndex = gl2D.resources.findIndex((style) => style.uid === `text_style_${instance.style.uid}`);

    if (styleIndex === -1)
    {
        await instance.style.serialize(options);
        styleIndex = gl2D.resources.findIndex((style) => style.uid === `text_style_${instance.style.uid}`);
    }

    // we now also need to get the webfont resource
    const fontFamily = instance.style.fontFamily;
    const webFontIndex = getWebFontIndex(gl2D, fontFamily as string);

    const fullText: PixiGL2DText = {
        ...text,
        type: 'text',
        text: instance.text,
        style: styleIndex,
        resolution: instance.resolution,
        webFont: webFontIndex,
        extensions: {
            pixi_container_node: {
                ...text.extensions.pixi_container_node,
                anchor: [instance.anchor.x, instance.anchor.y],
            },
            pixi_text_node: {
                roundPixels: instance.roundPixels,
                textureStyle: instance.textureStyle
                    ? {
                        addressModeU: instance.textureStyle.addressModeU,
                        addressModeV: instance.textureStyle.addressModeV,
                        addressModeW: instance.textureStyle.addressModeW,
                        maxAnisotropy: instance.textureStyle.maxAnisotropy,
                        compare: instance.textureStyle.compare,
                        magFilter: instance.textureStyle.magFilter,
                        minFilter: instance.textureStyle.minFilter,
                        mipmapFilter: instance.textureStyle.mipmapFilter,
                        lodMinClamp: instance.textureStyle.lodMinClamp,
                        lodMaxClamp: instance.textureStyle.lodMaxClamp,
                    }
                    : undefined,
            },
        },
    };

    // Assign the full text back to the original text
    Object.assign(text, fullText);

    gl2D.extensionsUsed.push('pixi_text_node');

    return options;
}

/**
 * Mixin for serializing a text to a gl2D-compatible format.
 * @category gl2d
 * @standard
 */
export interface SerializeTextMixin
{
    /**
     * Serializes the text to a gl2D-compatible format.
     * @param {ToGL2DOptions} gl2DOptions - The gl2D serialization context and options.
     */
    serialize(gl2DOptions: ToGL2DOptions): Promise<ToGL2DOptions>;
}

/** @internal */
export const serializeTextMixin: Partial<Text> = {
    serialize(gl2DOptions: ToGL2DOptions): Promise<ToGL2DOptions>
    {
        return serializeText(this, gl2DOptions);
    },
} as Text;
