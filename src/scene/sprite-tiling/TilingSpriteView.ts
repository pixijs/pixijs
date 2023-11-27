import { ObservablePoint } from '../../maths/point/ObservablePoint';
import { Texture } from '../../rendering/renderers/shared/texture/Texture';
import { emptyViewObserver } from '../../rendering/renderers/shared/view/View';
import { uid } from '../../utils/data/uid';
import { Transform } from '../../utils/misc/Transform';

import type { PointData } from '../../maths/point/PointData';
import type { View } from '../../rendering/renderers/shared/view/View';
import type { Bounds, SimpleBounds } from '../container/bounds/Bounds';
import type { TextureDestroyOptions, TypeOrBool } from '../container/destroyTypes';

/**
 * Options for the {@link scene.TilingSprite} constructor.
 * @memberof scene
 */
export interface TilingSpriteViewOptions
{
    /**
     * The texture to use for the sprite.
     * @default Texture.WHITE
     */
    texture?: Texture
    /**
     * The width of the tiling sprite. #
     * @default 256
     */
    width?: number
    /**
     * The height of the tiling sprite.
     * @default 256
     */
    height?: number
    // TODO needs a better name..
    /**
     * @todo
     * @default false
     */
    applyAnchorToTexture?: boolean
}

export class TilingSpriteView implements View
{
    public static defaultOptions: TilingSpriteViewOptions = {
        texture: Texture.EMPTY,
        width: 256,
        height: 256,
        applyAnchorToTexture: false,
    };

    public readonly owner = emptyViewObserver;
    public readonly uid = uid('tilingSpriteView');
    public readonly renderPipeId = 'tilingSprite';
    public batched = true;
    public anchor: ObservablePoint;

    /** @internal */
    public _tileTransform: Transform;
    /** @internal */
    public _texture: Texture;
    /** @internal */
    public _applyAnchorToTexture: boolean;
    /** @internal */
    public _didUpdate: boolean;

    public roundPixels: 0 | 1 = 0;

    private _bounds: SimpleBounds = { left: 0, right: 1, top: 0, bottom: 0 };
    private _boundsDirty = true;
    private _width: number;
    private _height: number;

    constructor(options: TilingSpriteViewOptions)
    {
        options = { ...TilingSpriteView.defaultOptions, ...options };

        this.anchor = new ObservablePoint(this, 0, 0);

        this._applyAnchorToTexture = options.applyAnchorToTexture;

        this.texture = options.texture;
        this._width = options.width;
        this._height = options.height;
        this._tileTransform = new Transform({ observer: this });
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

    set texture(value: Texture)
    {
        if (this._texture === value) return;

        this._texture = value;

        this.onUpdate();
    }

    get texture()
    {
        return this._texture;
    }

    set width(value: number)
    {
        this._width = value;
        this.onUpdate();
    }

    get width()
    {
        return this._width;
    }

    set height(value: number)
    {
        this._height = value;
        this.onUpdate();
    }

    get height()
    {
        return this._height;
    }

    private _updateBounds()
    {
        const bounds = this._bounds;

        const anchor = this.anchor;

        const width = this._width;
        const height = this._height;

        bounds.right = -anchor._x * width;
        bounds.left = bounds.right + width;

        bounds.bottom = -anchor._y * height;
        bounds.top = bounds.bottom + height;
    }

    public addBounds(bounds: Bounds)
    {
        const _bounds = this.bounds;

        bounds.addFrame(
            _bounds.left,
            _bounds.top,
            _bounds.right,
            _bounds.bottom,
        );
    }

    public containsPoint(point: PointData)
    {
        const width = this.bounds.left;
        const height = this.bounds.top;
        const x1 = -width * this.anchor.x;
        let y1 = 0;

        if (point.x >= x1 && point.x <= x1 + width)
        {
            y1 = -height * this.anchor.y;

            if (point.y >= y1 && point.y <= y1 + height) return true;
        }

        return false;
    }

    /**
     * @internal
     */
    public onUpdate()
    {
        this._boundsDirty = true;
        this._didUpdate = true;
        this.owner.onViewUpdate();
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
        this._tileTransform = null;
        this._bounds = null;

        const destroyTexture = typeof options === 'boolean' ? options : options?.texture;

        if (destroyTexture)
        {
            const destroyTextureSource = typeof options === 'boolean' ? options : options?.textureSource;

            this._texture.destroy(destroyTextureSource);
        }

        this._texture = null;
    }
}
