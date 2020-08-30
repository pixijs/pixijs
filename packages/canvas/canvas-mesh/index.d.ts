import type { CanvasRenderer } from '@pixi/canvas-renderer';
import type { Mesh } from '@pixi/mesh';

/**
 * Renderer dedicated to meshes.
 *
 * @class
 * @protected
 * @memberof PIXI
 */
export declare class CanvasMeshRenderer {
    renderer: CanvasRenderer;
    /**
     * @param {PIXI.CanvasRenderer} renderer - The renderer this downport works for
     */
    constructor(renderer: CanvasRenderer);
    /**
     * Renders the Mesh
     *
     * @param {PIXI.Mesh} mesh - the Mesh to render
     */
    render(mesh: Mesh): void;
    /**
     * Draws the object in Triangle Mesh mode
     *
     * @private
     * @param {PIXI.Mesh} mesh - the Mesh to render
     */
    private _renderTriangleMesh;
    /**
     * Draws the object in triangle mode using canvas
     *
     * @private
     * @param {PIXI.Mesh} mesh - the current mesh
     */
    private _renderTriangles;
    /**
     * Draws one of the triangles that from the Mesh
     *
     * @private
     * @param {PIXI.Mesh} mesh - the current mesh
     * @param {number} index0 - the index of the first vertex
     * @param {number} index1 - the index of the second vertex
     * @param {number} index2 - the index of the third vertex
     */
    private _renderDrawTriangle;
    /**
     * Renders a flat Mesh
     *
     * @private
     * @param {PIXI.Mesh} mesh - The Mesh to render
     */
    renderMeshFlat(mesh: Mesh): void;
    /**
     * destroy the the renderer.
     *
     */
    destroy(): void;
}

export { }
