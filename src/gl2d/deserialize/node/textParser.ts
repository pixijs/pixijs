import { ExtensionType } from '../../../extensions/Extensions';
import { type CanvasTextOptions, Text } from '../../../scene/text/Text';
import { type PixiGL2DText } from '../../spec/extensions/nodes';
import { deepRemoveUndefinedOrNull } from '../../utils/deepRemoveUndefinedOrNull';
import { type GL2DNodeParser } from '../parsers';
import { toPointData } from '../utils/arrayTo';
import { createContainerOptionsFromGl2D, setContainerTransformFromGL2D } from './containerParser';

import type { ContainerOptions } from '../../../scene/container/Container';

/**
 * Parser for GL2D text nodes.
 * @internal
 */
export const gl2DTextNodeParser: GL2DNodeParser<PixiGL2DText> = {
    extension: ExtensionType.GL2DNodeParser,

    async test(data: PixiGL2DText): Promise<boolean>
    {
        return data.type === 'text';
    },

    async parse(data: PixiGL2DText, resourceCache: any[]): Promise<Text>
    {
        const style = resourceCache[data.style];

        if (!style)
        {
            throw new Error(`Style at index ${data.style} not found`);
        }

        if (data.webFont !== undefined)
        {
            const webFont = resourceCache[data.webFont];

            if (!webFont)
            {
                throw new Error(`WebFont at index ${data.webFont} not found`);
            }
        }

        const properties: Required<Omit<CanvasTextOptions, keyof ContainerOptions>> = {
            ...createContainerOptionsFromGl2D(data),
            style,
            ...deepRemoveUndefinedOrNull({
                anchor: toPointData(data.extensions?.pixi_container_node?.anchor),
                roundPixels: data.extensions?.pixi_text_node?.roundPixels,
                textureStyle: data.extensions?.pixi_text_node?.textureStyle,
                text: data.text,
                resolution: data.resolution,
            }, 1)
        };

        const text = new Text(properties as CanvasTextOptions);

        // Apply base node properties
        setContainerTransformFromGL2D(text, data);

        return text;
    },
};
