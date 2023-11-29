import { ObservablePoint } from '../../maths/point/ObservablePoint';
import { Texture } from '../../rendering/renderers/shared/texture/Texture';
import { emptyViewObserver } from '../../rendering/renderers/shared/view/View';
import { uid } from '../../utils/data/uid';
import { updateQuadBounds } from '../../utils/data/updateQuadBounds';

import type { PointData } from '../../maths/point/PointData';
import type { View, ViewObserver } from '../../rendering/renderers/shared/view/View';
import type { Bounds, SimpleBounds } from '../container/bounds/Bounds';
import type { TextureDestroyOptions, TypeOrBool } from '../container/destroyTypes';

export class SpriteView implements View
{
    public readonly renderPipeId = 'sprite';
    public readonly owner: ViewObserver = emptyViewObserver;
    public readonly uid: number = uid('spriteView');
    public batched = true;
    public anchor: ObservablePoint;

    // sprite specific..
    /** @internal */
    public _texture: Texture;
    /** @internal */
    public _didUpdate = false;

    private _bounds: SimpleBounds = { left: 0, right: 1, top: 0, bottom: 0 };
    private _sourceBounds: SimpleBounds = { left: 0, right: 1, top: 0, bottom: 0 };
    private _boundsDirty = true;
    private _sourceBoundsDirty = true;

    public roundPixels: 0 | 1 = 0;

    constructor(texture: Texture)
    {
        this.anchor = new ObservablePoint(
            this,
            texture.defaultAnchor?.x || 0,
            texture.defaultAnchor?.y || 0,
        );

        this.texture = texture;
    }

    set texture(value: Texture)
    {
        value ||= Texture.EMPTY;

        if (this._texture === value) return;

        this._texture = value;

        this.onUpdate();
    }

    get texture()
    {
        return this._texture;
    }

    get bounds()
    {
        if (this._boundsDirty)
        {
            this._updateBounds();
            this._boundsDirty = false;
        }

        return this._bounds;
    }

    get sourceBounds()
    {
        if (this._sourceBoundsDirty)
        {
            this._updateSourceBounds();
            this._sourceBoundsDirty = false;
        }

        return this._sourceBounds;
    }

    // passed local space..
    public containsPoint(point: PointData)
    {
        const bounds = this.sourceBounds;

        if (point.x >= bounds.right && point.x <= bounds.left)
        {
            if (point.y >= bounds.bottom && point.y <= bounds.top)
            {
                return true;
            }
        }

        return false;
    }

    public addBounds(bounds: Bounds)
    {
        const _bounds = this._texture.trim ? this.sourceBounds : this.bounds;

        bounds.addFrame(_bounds.left, _bounds.top, _bounds.right, _bounds.bottom);
    }

    /**
     * @internal
     */
    public onUpdate()
    {
        this._didUpdate = true;

        this._sourceBoundsDirty = this._boundsDirty = true;

        this.owner.onViewUpdate();
    }

    private _updateBounds()
    {
        updateQuadBounds(this._bounds, this.anchor, this._texture, 0);
    }

    private _updateSourceBounds()
    {
        const anchor = this.anchor;
        const texture = this._texture;

        const sourceBounds = this._sourceBounds;

        const { width, height } = texture.orig;

        sourceBounds.right = -anchor._x * width;
        sourceBounds.left = sourceBounds.right + width;

        sourceBounds.bottom = -anchor._y * height;
        sourceBounds.top = sourceBounds.bottom + height;
    }

    /**
     * Destroys this sprite renderable and optionally its texture.
     * @param options - Options parameter. A boolean will act as if all options
     *  have been set to that value
     * @param {boolean} [options.texture=false] - Should it destroy the current texture of the renderable as well
     * @param {boolean} [options.textureSource=false] - Should it destroy the textureSource of the renderable as well
     */
    public destroy(options: TypeOrBool<TextureDestroyOptions> = false)
    {
        this.anchor = null;

        const destroyTexture = typeof options === 'boolean' ? options : options?.texture;

        if (destroyTexture)
        {
            const destroyTextureSource = typeof options === 'boolean' ? options : options?.textureSource;

            this._texture.destroy(destroyTextureSource);
        }

        this._texture = null;
        this._bounds = null;
        this._sourceBounds = null;
    }
}
