import EventEmitter from 'eventemitter3';
import { deprecation } from '../../../../utils/logging/deprecation';
import { createIdFromString } from '../utils/createIdFromString';

import type { BindResource } from '../../gpu/shader/BindResource';
import type { COMPARE_FUNCTION, SCALE_MODE, WRAP_MODE } from './const';

export interface TextureStyleOptions extends Partial<TextureStyle>
{
    /** setting this will set wrapModeU,wrapModeV and wrapModeW all at once! */
    addressMode?: WRAP_MODE;
    /** */
    addressModeU?: WRAP_MODE;
    /** */
    addressModeV?: WRAP_MODE;
    /** Specifies the {{GPUAddressMode|address modes}} for the texture width, height, and depth coordinates, respectively. */
    addressModeW?: WRAP_MODE;

    /** setting this will set magFilter,minFilter and mipmapFilter all at once!  */
    scaleMode?: SCALE_MODE;
    /** Specifies the sampling behavior when the sample footprint is smaller than or equal to one texel. */

    magFilter?: SCALE_MODE;
    /** Specifies the sampling behavior when the sample footprint is larger than one texel. */
    minFilter?: SCALE_MODE;
    /** Specifies behavior for sampling between mipmap levels. */
    mipmapFilter?: SCALE_MODE;

    /** */
    lodMinClamp?: number;
    /** Specifies the minimum and maximum levels of detail, respectively, used internally when sampling a texture. */
    lodMaxClamp?: number;
    /**
     * When provided the sampler will be a comparison sampler with the specified
     * {@link GPUCompareFunction}.
     * Note: Comparison samplers may use filtering, but the sampling results will be
     * implementation-dependent and may differ from the normal filtering rules.
     */
    compare?: COMPARE_FUNCTION;
    /**
     * Specifies the maximum anisotropy value clamp used by the sampler.
     * Note: Most implementations support {@link GPUSamplerDescriptor#maxAnisotropy} values in range
     * between 1 and 16, inclusive. The used value of {@link GPUSamplerDescriptor#maxAnisotropy} will
     * be clamped to the maximum value that the platform supports.
     *
     * setting this to anything higher than 1 will set scale modes to 'linear'
     */
    maxAnisotropy?: number;

}

export class TextureStyle extends EventEmitter<{
    change: TextureStyle,
    destroy: TextureStyle,
}> implements BindResource
{
    public _resourceType = 'textureSampler';
    public _touched = 0;
    private _sharedResourceId: number;

    // override to set styles globally
    public static readonly defaultOptions: TextureStyleOptions = {
        addressMode: 'clamp-to-edge',
        scaleMode: 'linear'
    };

    /** */
    public addressModeU?: WRAP_MODE;
    /** */
    public addressModeV?: WRAP_MODE;
    /** Specifies the {{GPUAddressMode|address modes}} for the texture width, height, and depth coordinates, respectively. */
    public addressModeW?: WRAP_MODE;
    /** Specifies the sampling behavior when the sample footprint is smaller than or equal to one texel. */
    public magFilter?: SCALE_MODE;
    /** Specifies the sampling behavior when the sample footprint is larger than one texel. */
    public minFilter?: SCALE_MODE;
    /** Specifies behavior for sampling between mipmap levels. */
    public mipmapFilter?: SCALE_MODE;
    /** */
    public lodMinClamp?: number;
    /** Specifies the minimum and maximum levels of detail, respectively, used internally when sampling a texture. */
    public lodMaxClamp?: number;
    /**
     * When provided the sampler will be a comparison sampler with the specified
     * {@link GPUCompareFunction}.
     * Note: Comparison samplers may use filtering, but the sampling results will be
     * implementation-dependent and may differ from the normal filtering rules.
     */
    public compare?: COMPARE_FUNCTION;
    /**
     * Specifies the maximum anisotropy value clamp used by the sampler.
     * Note: Most implementations support {@link GPUSamplerDescriptor#maxAnisotropy} values in range
     * between 1 and 16, inclusive. The used value of {@link GPUSamplerDescriptor#maxAnisotropy} will
     * be clamped to the maximum value that the platform supports.
     * @internal
     */
    public _maxAnisotropy?: number = 1;

    constructor(options: TextureStyleOptions = {})
    {
        super();

        options = { ...TextureStyle.defaultOptions, ...options };

        this.addressMode = options.addressMode;

        this.addressModeU = options.addressModeU ?? this.addressModeU;
        this.addressModeV = options.addressModeV ?? this.addressModeV;
        this.addressModeW = options.addressModeW ?? this.addressModeW;

        this.scaleMode = options.scaleMode;

        this.magFilter = options.magFilter ?? this.magFilter;
        this.minFilter = options.minFilter ?? this.minFilter;
        this.mipmapFilter = options.mipmapFilter ?? this.mipmapFilter;

        this.lodMinClamp = options.lodMinClamp;
        this.lodMaxClamp = options.lodMaxClamp;

        this.compare = options.compare;

        this.maxAnisotropy = options.maxAnisotropy ?? 1;
    }

    set addressMode(value: WRAP_MODE)
    {
        this.addressModeU = value;
        this.addressModeV = value;
        this.addressModeW = value;
    }

    get addressMode(): WRAP_MODE
    {
        return this.addressModeU;
    }

    set wrapMode(value: WRAP_MODE)
    {
        deprecation('8', 'TextureStyle.wrapMode is now TextureStyle.addressMode');
        this.addressMode = value;
    }

    get wrapMode(): WRAP_MODE
    {
        return this.addressMode;
    }

    set scaleMode(value: SCALE_MODE)
    {
        this.magFilter = value;
        this.minFilter = value;
        this.mipmapFilter = value;
    }

    get scaleMode(): SCALE_MODE
    {
        return this.magFilter;
    }

    set maxAnisotropy(value: number)
    {
        this._maxAnisotropy = Math.min(value, 16);

        if (this._maxAnisotropy > 1)
        {
            this.scaleMode = 'linear';
        }
    }

    get maxAnisotropy(): number
    {
        return this._maxAnisotropy;
    }

    // TODO - move this to WebGL?
    get _resourceId(): number
    {
        return this._sharedResourceId || this._generateResourceId();
    }

    public update()
    {
        // manage the resource..
        this.emit('change', this);
        this._sharedResourceId = null;
    }

    private _generateResourceId(): number
    {
        // eslint-disable-next-line max-len
        const bigKey = `${this.addressModeU}-${this.addressModeV}-${this.addressModeW}-${this.magFilter}-${this.minFilter}-${this.mipmapFilter}-${this.lodMinClamp}-${this.lodMaxClamp}-${this.compare}-${this._maxAnisotropy}`;

        this._sharedResourceId = createIdFromString(bigKey, 'sampler');

        return this._resourceId;
    }

    /** Destroys the style */
    public destroy()
    {
        this.emit('destroy', this);

        this.removeAllListeners();
    }
}
