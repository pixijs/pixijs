import { Matrix } from '@pixi/math';

import type { ISystem } from '../system/ISystem';
import type { Rectangle } from '@pixi/math';
import type { Renderer } from '../Renderer';
import type { ExtensionMetadata } from '@pixi/extensions';
import { extensions, ExtensionType } from '@pixi/extensions';

/**
 * System plugin to the renderer to manage the projection matrix.
 *
 * The `projectionMatrix` is a global uniform provided to all shaders. It is used to transform points in world space to
 * normalized device coordinates.
 * @memberof PIXI
 */
export class ProjectionSystem implements ISystem
{
    /** @ignore */
    static extension: ExtensionMetadata = {
        type: ExtensionType.RendererSystem,
        name: 'projection',
    };

    /**
     * The destination frame used to calculate the current projection matrix.
     *
     * The destination frame is the rectangle in the render-target into which contents are rendered. If rendering
     * to the screen, the origin is on the top-left. If rendering to a framebuffer, the origin is on the
     * bottom-left. This "flipping" phenomenon is because of WebGL convention for (shader) texture coordinates, where
     * the bottom-left corner is (0,0). It allows display-objects to map their (0,0) position in local-space (top-left)
     * to (0,0) in texture space (bottom-left). In other words, a sprite's top-left corner actually renders the
     * texture's bottom-left corner. You will also notice this when using a tool like SpectorJS to view your textures
     * at runtime.
     *
     * The destination frame's dimensions (width,height) should be equal to the source frame. This is because,
     * otherwise, the contents will be scaled to fill the destination frame. Similarly, the destination frame's (x,y)
     * coordinates are (0,0) unless you know what you're doing.
     * @readonly
     */
    public destinationFrame: Rectangle;

    /**
     * The source frame used to calculate the current projection matrix.
     *
     * The source frame is the rectangle in world space containing the contents to be rendered.
     * @readonly
     */
    public sourceFrame: Rectangle;

    /**
     * Default destination frame
     *
     * This is not used internally. It is not advised to use this feature specifically unless you know what
     * you're doing. The `update` method will default to this frame if you do not pass the destination frame.
     * @readonly
     */
    public defaultFrame: Rectangle;

    /**
     * Projection matrix
     *
     * This matrix can be used to transform points from world space to normalized device coordinates, and is calculated
     * from the sourceFrame → destinationFrame mapping provided.
     *
     * The renderer's `globalUniforms` keeps a reference to this, and so it is available for all shaders to use as a
     * uniform.
     * @readonly
     */
    public projectionMatrix: Matrix;

    /**
     * A transform to be appended to the projection matrix.
     *
     * This can be used to transform points in world-space one last time before they are outputted by the shader. You can
     * use to rotate the whole scene, for example. Remember to clear it once you've rendered everything.
     * @member {PIXI.Matrix}
     */
    public transform: Matrix;

    private renderer: Renderer;

    /** @param renderer - The renderer this System works for. */
    constructor(renderer: Renderer)
    {
        this.renderer = renderer;

        this.destinationFrame = null;
        this.sourceFrame = null;
        this.defaultFrame = null;
        this.projectionMatrix = new Matrix();
        this.transform = null;
    }

    /**
     * Updates the projection-matrix based on the sourceFrame → destinationFrame mapping provided.
     *
     * NOTE: It is expected you call `renderer.framebuffer.setViewport(destinationFrame)` after this. This is because
     * the framebuffer viewport converts shader vertex output in normalized device coordinates to window coordinates.
     *
     * NOTE-2: {@link RenderTextureSystem#bind} updates the projection-matrix when you bind a render-texture. It is expected
     * that you dirty the current bindings when calling this manually.
     * @param destinationFrame - The rectangle in the render-target to render the contents into. If rendering to the canvas,
     *  the origin is on the top-left; if rendering to a render-texture, the origin is on the bottom-left.
     * @param sourceFrame - The rectangle in world space that contains the contents being rendered.
     * @param resolution - The resolution of the render-target, which is the ratio of
     *  world-space (or CSS) pixels to physical pixels.
     * @param root - Whether the render-target is the screen. This is required because rendering to textures
     *  is y-flipped (i.e. upside down relative to the screen).
     */
    update(destinationFrame: Rectangle, sourceFrame: Rectangle, resolution: number, root: boolean): void
    {
        this.destinationFrame = destinationFrame || this.destinationFrame || this.defaultFrame;
        this.sourceFrame = sourceFrame || this.sourceFrame || destinationFrame;

        // Calculate object-space to clip-space projection
        this.calculateProjection(this.destinationFrame, this.sourceFrame, resolution, root);

        if (this.transform)
        {
            this.projectionMatrix.append(this.transform);
        }

        const renderer =  this.renderer;

        renderer.globalUniforms.uniforms.projectionMatrix = this.projectionMatrix;
        renderer.globalUniforms.update();

        // this will work for now
        // but would be sweet to stick and even on the global uniforms..
        if (renderer.shader.shader)
        {
            renderer.shader.syncUniformGroup(renderer.shader.shader.uniforms.globals);
        }
    }

    /**
     * Calculates the `projectionMatrix` to map points inside `sourceFrame` to inside `destinationFrame`.
     * @param _destinationFrame - The destination frame in the render-target.
     * @param sourceFrame - The source frame in world space.
     * @param _resolution - The render-target's resolution, i.e. ratio of CSS to physical pixels.
     * @param root - Whether rendering into the screen. Otherwise, if rendering to a framebuffer, the projection
     *  is y-flipped.
     */
    calculateProjection(_destinationFrame: Rectangle, sourceFrame: Rectangle, _resolution: number, root: boolean): void
    {
        const pm = this.projectionMatrix;
        const sign = !root ? 1 : -1;

        pm.identity();

        pm.a = (1 / sourceFrame.width * 2);
        pm.d = sign * (1 / sourceFrame.height * 2);

        pm.tx = -1 - (sourceFrame.x * pm.a);
        pm.ty = -sign - (sourceFrame.y * pm.d);
    }

    /**
     * Sets the transform of the active render target to the given matrix.
     * @param _matrix - The transformation matrix
     */
    setTransform(_matrix: Matrix): void
    {
        // this._activeRenderTarget.transform = matrix;
    }

    destroy(): void
    {
        this.renderer = null;
    }
}

extensions.add(ProjectionSystem);
