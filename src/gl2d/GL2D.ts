import { Container } from '../scene/container/Container';
import { type GL2DNodeParser, type GL2DResourceParser } from './deserialize/parsers';
import { type GL2DFile, type GL2DScene } from './file';
import { type GL2DNode } from './node';
import { type GL2DResource } from './resources';
import { deepRemoveUndefinedOrNull } from './utils/deepRemoveUndefinedOrNull';

import type { Renderer } from '../rendering/renderers/types';

/**
 * Represents the nodes and resources of a gl2D file for JSON serialization.
 * @category gl2d
 * @standard
 */
export type ToGL2D = Pick<GL2DFile, 'resources' | 'nodes' | 'extensionsRequired' | 'extensionsUsed'>;

/**
 * Options for serializing a PixiJS v8 scene graph into a gl2D scene file.
 * @category gl2d
 * @standard
 */
export interface ToGL2DOptions
{
    gl2D: ToGL2D;
    renderer: Renderer;
}

/** @internal */
export class GL2DClass
{
    /** The list of node parsers for gl2D. */
    public nodeParsers: GL2DNodeParser<any>[] = [];
    public resourceParsers: GL2DResourceParser<any>[] = [];

    /**
     * Serialize a PixiJS v8 scene graph into a gl2D scene file.
     * @param options - The options for serialization
     * @param options.root - The root container for the active scene
     * @param options.renderer - The renderer instance
     * @returns The serialized gl2D JSON object
     * @category gl2d
     * @standard
     */
    public async serialize(options: { root: Container; renderer: Renderer }): Promise<GL2DFile>
    {
        const { root, renderer } = options;

        const gl2D: GL2DFile = {
            asset: {
                generator: 'PixiJS',
                version: '1.0',
            },
            extensionsUsed: [],
            extensionsRequired: [],
            resources: [],
            nodes: [],
            scenes: [],
            scene: 0,
        };

        await root.serialize({ gl2D, renderer });
        gl2D.scenes.push({
            name: gl2D.nodes[0].name,
            nodes: gl2D.nodes[0].children
        });

        // Ensure no duplicates if serializers pushed extensions multiple times
        if (gl2D.extensionsUsed) gl2D.extensionsUsed = Array.from(new Set(gl2D.extensionsUsed));
        if (gl2D.extensionsRequired) gl2D.extensionsRequired = Array.from(new Set(gl2D.extensionsRequired));

        return deepRemoveUndefinedOrNull(gl2D);
    }

    public async deserialize(data: GL2DFile): Promise<Container>
    {
        // Deserialization logic for gl2D assets
        const serializedAssets: any[] = Array(data.resources.length).fill(null);
        const serializedNodes = new Map<number, Container>();

        await this._parseResources(data.resources, serializedAssets);
        await this._parseNodes(data.nodes, serializedAssets, serializedNodes);

        // Create and return the active scene
        const activeSceneIndex = data.scene ?? 0;
        const activeScene = data.scenes?.[activeSceneIndex];

        if (activeScene)
        {
            return await this._parseScene(activeScene, serializedNodes);
        }

        // If no scene is defined, create a container with all nodes
        const rootContainer = new Container();

        rootContainer.label = 'GL2D Root';

        for (let i = 0; i < data.nodes.length; i++)
        {
            const node = serializedNodes.get(i);

            if (node && !node.parent)
            {
                rootContainer.addChild(node);
            }
        }

        return rootContainer;
    }

    /**
     * Parse resources array.
     * @param resources - Array of GL2D resources
     * @param serializedAssets - Array of serialized assets
     */
    private async _parseResources(resources: GL2DResource[], serializedAssets: any[]): Promise<void>
    {
        for (let i = 0; i < resources.length; i++)
        {
            const resource = resources[i];

            if (serializedAssets[i] !== null)
            {
                // we have already loaded it
                continue;
            }

            serializedAssets[i] = await this.parseResource(resource, resources, serializedAssets);
        }
    }

    /**
     * Parse a GL2D resource into a resource that can be used by the renderer.
     * @param resource - The GL2D resource to parse
     * @param resources - The array of all GL2D resources
     * @param serializedAssets - The array of serialized assets
     * @returns The parsed resource
     */
    public async parseResource(resource: GL2DResource, resources: GL2DResource[], serializedAssets: any[])
    {
        let parsed = null;

        for (const parser of this.resourceParsers)
        {
            if (await parser.test(resource))
            {
                parsed = await parser.parse(resource, resources, serializedAssets);
                break;
            }
        }

        if (parsed === null)
        {
            throw new Error(`Failed to parse resource: ${resource.type}`);
        }

        return parsed;
    }

    /**
     * Parse nodes array.
     * @param nodes - Array of GL2D nodes
     * @param serializedAssets
     * @param serializedNodes
     */
    private async _parseNodes(
        nodes: GL2DNode[],
        serializedAssets: any[],
        serializedNodes: Map<number, Container>,
    ): Promise<void>
    {
        for (let i = 0; i < nodes.length; i++)
        {
            const nodeData = nodes[i];
            let parsed = null;

            for (const parser of this.nodeParsers)
            {
                if (await parser.test(nodeData))
                {
                    parsed = await parser.parse(nodeData, serializedAssets);
                    break;
                }
            }

            if (parsed)
            {
                serializedNodes.set(i, parsed);
            }
        }

        // Second pass: setup children relationships
        for (let i = 0; i < nodes.length; i++)
        {
            const nodeData = nodes[i];
            const parentNode = serializedNodes.get(i);

            if (parentNode && nodeData.children)
            {
                for (const childIndex of nodeData.children)
                {
                    const childNode = serializedNodes.get(childIndex);

                    if (childNode)
                    {
                        parentNode.addChild(childNode);
                    }
                }
            }
        }
    }

    /**
     * Parse a scene definition.
     * @param scene - The GL2D scene data
     * @param nodeCache
     */
    private async _parseScene(scene: GL2DScene, nodeCache: Map<number, Container>): Promise<Container>
    {
        const sceneContainer = new Container();

        sceneContainer.label = scene.name || 'GL2D Scene';

        for (const nodeIndex of scene.nodes)
        {
            const node = nodeCache.get(nodeIndex);

            if (node)
            {
                sceneContainer.addChild(node);
            }
        }

        return sceneContainer;
    }
}

/**
 * Represents the core functionality for working with gl2D assets.
 * @example
 * ```ts
 * const serializedScene = GL2D.serialize(app.stage);
 * const clone = GL2D.deserialize(serializedScene);
 * app.stage.addChild(clone);
 * ```
 * @category gl2d
 * @class
 * @standard
 */
export const GL2D = new GL2DClass();
