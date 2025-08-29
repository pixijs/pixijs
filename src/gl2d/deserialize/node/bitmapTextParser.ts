import { ExtensionType } from '../../../extensions/Extensions';
import { type TextOptions } from '../../../scene/text/AbstractText';
import { BitmapText } from '../../../scene/text-bitmap/BitmapText';
import { type PixiGL2DBitmapText } from '../../spec/extensions/nodes';
import { deepRemoveUndefinedOrNull } from '../../utils/deepRemoveUndefinedOrNull';
import { type GL2DNodeParser } from '../parsers';
import { toPointData } from '../utils/arrayTo';
import { createContainerOptionsFromGl2D, setContainerTransformFromGL2D } from './containerParser';

import type { ContainerOptions } from '../../../scene/container/Container';

/**
 * Parser for GL2D text nodes.
 * @internal
 */
export const gl2DBitmapTextNodeParser: GL2DNodeParser<PixiGL2DBitmapText> = {
    extension: ExtensionType.GL2DNodeParser,

    async test(data: PixiGL2DBitmapText): Promise<boolean>
    {
        return data.type === 'bitmap_text';
    },

    async parse(data: PixiGL2DBitmapText, resourceCache: any[]): Promise<BitmapText>
    {
        const style = resourceCache[data.style];

        if (!style)
        {
            throw new Error(`Style at index ${data.style} not found`);
        }

        if (data.bitmapFont !== undefined)
        {
            const bitmapFont = resourceCache[data.bitmapFont];

            if (!bitmapFont)
            {
                throw new Error(`BitmapFont at index ${data.bitmapFont} not found`);
            }
        }

        const properties: Required<Omit<TextOptions, keyof ContainerOptions>> = {
            ...createContainerOptionsFromGl2D(data),
            style,
            ...deepRemoveUndefinedOrNull(
                {
                    anchor: toPointData(data.extensions?.pixi_container_node?.anchor),
                    roundPixels: data.extensions?.pixi_text_node?.roundPixels,
                    textureStyle: data.extensions?.pixi_text_node?.textureStyle,
                    text: data.text,
                    resolution: data.resolution,
                },
                1,
            ),
        };

        const text = new BitmapText(properties as TextOptions);

        // Apply base node properties
        setContainerTransformFromGL2D(text, data);

        return text;
    },
};
