import { DOMAdapter } from '../../../../environment/adapter';
import { ExtensionType } from '../../../../extensions/Extensions';
import { GraphicsContext } from '../../../../scene/graphics/shared/GraphicsContext';
import { checkDataUrl } from '../../../utils/checkDataUrl';
import { checkExtension } from '../../../utils/checkExtension';
import { LoaderParserPriority } from '../LoaderParser';

import type { LoaderParser } from '../LoaderParser';

/**
 * Regular expression for SVG XML document.
 * @example &lt;?xml version="1.0" encoding="utf-8" ?&gt;&lt;!-- image/svg --&gt;&lt;svg
 * @readonly
 */
const SVG_XML = /^(<\?xml[^?]+\?>)?\s*(<!--[^(-->)]*-->)?\s*\<svg/m;
const validSVGExtension = '.svg';
const validSVGMIME = 'image/svg+xml';

/**
 * A simple loader plugin for loading json data
 *
 * This will be added automatically if `pixi.js/assets` is imported
 * @memberof assets
 */
export const loadSvg = {
    extension: {
        type: ExtensionType.LoadParser,
        priority: LoaderParserPriority.Low,
    },

    name: 'loadSVG',

    test(url: string): boolean
    {
        return checkDataUrl(url, validSVGMIME) || checkExtension(url, validSVGExtension);
    },

    async testParse(data: string): Promise<boolean>
    {
        // source is SVG data-uri
        return (typeof data === 'string' && data.startsWith('data:image/svg+xml'))
        // source is SVG inline
        || (typeof data === 'string' && SVG_XML.test(data));
    },

    async parse(asset: string): Promise<GraphicsContext>
    {
        const context = new GraphicsContext();

        context.svg(asset);

        return context;
    },

    async load(url: string): Promise<string>
    {
        const response = await DOMAdapter.get().fetch(url);

        return response.text();
    },

    unload(asset: GraphicsContext): void
    {
        asset.destroy(true);
    }
} as LoaderParser<string | GraphicsContext>;
