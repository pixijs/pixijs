import { settings, utils } from '@pixi/core';
import { BasePrepare } from './BasePrepare';

Object.defineProperties(settings, {
    /**
     * Default number of uploads per frame using prepare plugin.
     * @static
     * @memberof PIXI.settings
     * @name UPLOADS_PER_FRAME
     * @deprecated since 7.1.0
     * @see PIXI.BasePrepare.uploadsPerFrame
     * @type {number}
     */
    UPLOADS_PER_FRAME:
    {
        get()
        {
            return BasePrepare.uploadsPerFrame;
        },
        set(value: number)
        {
            if (process.env.DEBUG)
            {
                // eslint-disable-next-line max-len
                utils.deprecation('7.1.0', 'settings.UPLOADS_PER_FRAME is deprecated, use prepare.BasePrepare.uploadsPerFrame');
            }
            BasePrepare.uploadsPerFrame = value;
        },
    },
});

export { settings };
