import AccessibilityManager from './AccessibilityManager';

/**
 * Application plugin for AccessibilityManager
 * @example
 * import {AccessibilityManager} from '@pixi/accessibility';
 * import {Application} from '@pixi/app';
 * Application.registerPlugin(AccessibilityManager);
 * @class
 * @memberof PIXI.accessibility
 */
export default class AccessibilityPlugin
{
    /**
     * Initialize the plugin, scoped to the application instance
     * @private
     */
    static init()
    {
        this.accessibility = new AccessibilityManager(this.renderer);
    }

    /**
     * Destroy the plugin, scoped to the application instance
     * @private
     */
    static destroy()
    {
        this.accessibility.destroy();
        this.accessibility = null;
    }
}
