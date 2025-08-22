import { type ExtensionMetadata } from '../../extensions/Extensions';
import { type GL2DNode } from '../spec/node';
import { type GL2DResource } from '../spec/resources';

/**
 * Interface for parsing GL2D nodes.
 * @category gl2d
 * @standard
 */
export interface GL2DNodeParser<T extends GL2DNode, U extends GL2DNode = T>
{
    extension?: ExtensionMetadata;
    test: (data: T) => Promise<boolean>;
    parse: (data: U, resourceCache: any[]) => Promise<any>;
}

/**
 * Interface for parsing GL2D resources.
 * @category gl2d
 * @standard
 */
export interface GL2DResourceParser<T extends GL2DResource, K extends GL2DResource = T>
{
    extension?: ExtensionMetadata;
    test: (data: T) => Promise<boolean>;
    parse: (data: K, resources: GL2DResource[], serializedAssets: any[]) => Promise<any>;
}
