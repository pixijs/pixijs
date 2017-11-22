import { Application } from '@pixi/app';
import { Loader } from '@pixi/loaders';

Application.prototype._loader = null;

/**
 * Loader instance to help with asset loading.
 * @name PIXI.Application#loader
 * @type {PIXI.Loader}
 */
Object.defineProperties(Application.prototype, {
    loader: {
        get()
        {
            if (!this._loader && this._options)
            {
                const { sharedLoader } = this._options;

                this._loader = sharedLoader ? Loader.shared : new Loader();
            }

            return this._loader;
        },
    },
});

// Override the destroy function
// making sure to destroy the current Loader
Application.prototype._parentDestroy = Application.prototype.destroy;
Application.prototype.destroy = function destroy(removeView)
{
    if (this._loader)
    {
        this._loader.destroy();
        this._loader = null;
    }
    this._parentDestroy(removeView);
};
