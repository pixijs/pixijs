import type { Container } from '../scene/container/Container';

/**
 * The type of the pointer event to listen for.
 * @category accessibility
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/pointer-events
 */
export type PointerEvents = 'auto'
| 'none'
| 'visiblePainted'
| 'visibleFill'
| 'visibleStroke'
| 'visible'
| 'painted'
| 'fill'
| 'stroke'
| 'all'
| 'inherit';

/**
 * When `accessible` is enabled on any display object, these properties will affect its accessibility.
 * @example
 * const container = new Container();
 * container.accessible = true;
 * container.accessibleTitle = 'My Container';
 * container.accessibleHint = 'This is a container';
 * container.tabIndex = 0;
 * @category accessibility
 */
export interface AccessibleOptions
{
    /**
     * Flag for if the object is accessible. If true AccessibilityManager will overlay a
     * shadow div with attributes set
     * @default false
     */
    accessible: boolean;
    /**
     * Sets the title attribute of the shadow div
     * If accessibleTitle AND accessibleHint has not been this will default to 'container [tabIndex]'
     * @member {string}
     */
    accessibleTitle: string | null;
    /**
     * Sets the aria-label attribute of the shadow div
     * @default null
     */
    accessibleHint: string | null;
    /**
     * Sets the tabIndex of the shadow div. You can use this to set the order of the
     * elements when using the tab key to navigate.
     * @default 0
     */
    tabIndex: number;
    /**
     * Specify the type of div the accessible layer is. Screen readers treat the element differently
     * depending on this type. Defaults to button.
     * @default 'button'
     * @type {string}
     */
    accessibleType: keyof HTMLElementTagNameMap;
    /**
     * Specify the pointer-events the accessible div will use
     * Defaults to auto.
     * @default 'auto'
     * @type {accessibility.PointerEvents}
     */
    accessiblePointerEvents: PointerEvents;

    /**
     * Sets the text content of the shadow
     * @default null
     */
    accessibleText: string | null;

    /**
     * Setting to false will prevent any children inside this container to
     * be accessible. Defaults to true.
     * @default true
     */
    accessibleChildren: boolean;
}

/**
 * The Accessibility object is attached to the {@link Container}.
 * @private
 */
export interface AccessibleTarget extends AccessibleOptions
{
    /** @private */
    _accessibleActive: boolean;
    /** @private */
    _accessibleDiv: AccessibleHTMLElement | null;
    /** @private */
    _renderId: number;
}

export interface AccessibleHTMLElement extends HTMLElement
{
    type?: string;
    container?: Container;
}

/**
 * Default property values of accessible objects
 * used by {@link AccessibilitySystem}.
 * @example
 * import { accessibleTarget } from 'pixi.js';
 *
 * function MyObject() {}
 * Object.assign(MyObject.prototype, accessibleTarget);
 */
export const accessibilityTarget: AccessibleTarget = {
    /**
     * Flag for if the object is accessible. If true AccessibilityManager will overlay a
     * shadow div with attributes set
     * @member {boolean}
     * @memberof Container#
     */
    accessible: false,

    /**
     * Sets the title attribute of the shadow div
     * If accessibleTitle AND accessibleHint has not been this will default to 'container [tabIndex]'
     * @member {string}
     * @memberof Container#
     */
    accessibleTitle: null,

    /**
     * Sets the aria-label attribute of the shadow div
     * @member {string}
     * @memberof Container
     */
    accessibleHint: null,

    /**
     * @member {number}
     * @memberof Container#
     * @todo Needs docs.
     */
    tabIndex: 0,

    /**
     * @member {boolean}
     * @memberof Container#
     * @private
     */
    _accessibleActive: false,

    /**
     * @memberof Container#
     * @private
     */
    _accessibleDiv: null,

    /**
     * Specify the type of div the accessible layer is. Screen readers treat the element differently
     * depending on this type. Defaults to button.
     * @member {string}
     * @memberof Container#
     * @default 'button'
     */
    accessibleType: 'button',

    /**
     * Sets the text content of the shadow div
     * @member {string}
     * @memberof Container#
     */
    accessibleText: null,

    /**
     * Specify the pointer-events the accessible div will use
     * Defaults to auto.
     * @type {PointerEvents}
     * @memberof Container#
     * @default 'auto'
     */
    accessiblePointerEvents: 'auto',

    /**
     * Setting to false will prevent any children inside this container to
     * be accessible. Defaults to true.
     * @member {boolean}
     * @memberof Container#
     * @default true
     */
    accessibleChildren: true,

    /**
     * @member {number}
     * @memberof Container#
     * @private
     */
    _renderId: -1,
};
