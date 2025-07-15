import { ExtensionType } from '../extensions/Extensions';
import { CanvasTransformSync } from './CanvasTransformSync';
import { type DOMContainer } from './DOMContainer';

import type { InstructionSet } from '../rendering/renderers/shared/instructions/InstructionSet';
import type { RenderPipe } from '../rendering/renderers/shared/instructions/RenderPipe';
import type { Renderer } from '../rendering/renderers/types';

/**
 * The DOMPipe class is responsible for managing and rendering DOM elements within a PixiJS scene.
 * It maps dom elements to the canvas and ensures they are correctly positioned and visible.
 * @internal
 */
export class DOMPipe implements RenderPipe<DOMContainer>
{
    /**
     * Static property defining the extension type and name for the DOMPipe.
     * This is used to register the DOMPipe with different rendering pipelines.
     */
    public static extension = {
        type: [
            ExtensionType.WebGLPipes,
            ExtensionType.WebGPUPipes,
            ExtensionType.CanvasPipes,
        ],
        name: 'dom',
    } as const;

    private _renderer: Renderer;

    /** Array to keep track of attached DOM elements */
    private readonly _attachedDomElements: DOMContainer[] = [];
    /** The main DOM element that acts as a container for other DOM elements */
    private readonly _domElement: HTMLDivElement;
    /** The CanvasTransformSync instance that keeps the DOM element in sync with the canvas */
    private readonly _canvasTransformSync: CanvasTransformSync;

    /**
     * Constructor for the DOMPipe class.
     * @param renderer - The renderer instance that this DOMPipe will be associated with.
     */
    constructor(renderer: Renderer)
    {
        this._renderer = renderer;

        // Add this DOMPipe to the postrender runner of the renderer
        // we want to dom elements are calculated after all things have been rendered
        this._renderer.runners.postrender.add(this);

        // Create a main DOM element to contain other DOM elements
        this._domElement = document.createElement('div');
        this._domElement.style.position = 'absolute';
        this._domElement.style.top = '0';
        this._domElement.style.left = '0';
        this._domElement.style.pointerEvents = 'none';
        this._domElement.style.zIndex = '1000';

        // Initialize the CanvasTransformSync to keep the DOM element in sync with the canvas
        this._canvasTransformSync = new CanvasTransformSync({
            domElement: this._domElement,
            renderer: this._renderer,
        });
    }

    /**
     * Adds a renderable DOM container to the list of attached elements.
     * @param domContainer - The DOM container to be added.
     * @param _instructionSet - The instruction set (unused).
     */
    public addRenderable(domContainer: DOMContainer, _instructionSet: InstructionSet): void
    {
        if (!this._attachedDomElements.includes(domContainer))
        {
            this._attachedDomElements.push(domContainer);
        }
    }

    /**
     * Updates a renderable DOM container.
     * @param _domContainer - The DOM container to be updated (unused).
     */
    public updateRenderable(_domContainer: DOMContainer): void
    {
        // Updates happen in postrender
    }

    /**
     * Validates a renderable DOM container.
     * @param _domContainer - The DOM container to be validated (unused).
     * @returns Always returns true as validation is not required.
     */
    public validateRenderable(_domContainer: DOMContainer): boolean
    {
        return true;
    }

    /** Handles the post-rendering process, ensuring DOM elements are correctly positioned and visible. */
    public postrender(): void
    {
        const attachedDomElements = this._attachedDomElements;

        if (attachedDomElements.length === 0)
        {
            this._domElement.remove();

            return;
        }

        // Ensure the canvas is set
        this._canvasTransformSync.canvas = this._renderer.view.canvas as HTMLCanvasElement;

        for (let i = 0; i < attachedDomElements.length; i++)
        {
            const domContainer = attachedDomElements[i];
            const element = domContainer.element;

            if (!domContainer.parent || domContainer.globalDisplayStatus < 0b111)
            {
                element?.remove();
                attachedDomElements.splice(i, 1);
                i--;
            }
            else
            {
                if (!this._domElement.contains(element))
                {
                    element.style.position = 'absolute';
                    element.style.pointerEvents = 'auto';
                    this._domElement.appendChild(element);
                }

                const wt = domContainer.worldTransform;
                const anchor = domContainer._anchor;
                const ax = domContainer.width * anchor.x;
                const ay = domContainer.height * anchor.y;

                element.style.transformOrigin = `${ax}px ${ay}px`;
                element.style.transform = `matrix(${wt.a}, ${wt.b}, ${wt.c}, ${wt.d}, ${wt.tx - ax}, ${wt.ty - ay})`;
                element.style.opacity = domContainer.groupAlpha.toString();
            }
        }
    }

    /** Destroys the DOMPipe, removing all attached DOM elements and cleaning up resources. */
    public destroy(): void
    {
        this._renderer.runners.postrender.remove(this);

        for (let i = 0; i < this._attachedDomElements.length; i++)
        {
            const domContainer = this._attachedDomElements[i];

            domContainer.element?.remove();
        }

        this._attachedDomElements.length = 0;
        this._domElement.remove();
        this._canvasTransformSync.destroy();
        this._renderer = null;
    }
}
