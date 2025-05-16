import { extensions } from '../extensions/Extensions';
import { ResizePlugin } from './ResizePlugin';
import { TickerPlugin } from './TickerPlugin';

extensions.add(ResizePlugin);
extensions.add(TickerPlugin);

/**
 * @module
 * @categoryDescription app
 * The app module provides a set of classes to use as a starting point when building applications.
 *
 * <aside>This module has a mixin for <code>TickerPlugin</code> and <code>ResizePlugin</code>.
 * These will need to be imported if you are managing your own renderer.</aside>
 *
 * ```js
 * import { Application } from 'pixi.js';
 *
 * const app = new Application();
 *
 * await app.init({ backgroundColor: '#1099bb' });
 *
 * // don't forget to add the canvas to the DOM
 * document.body.appendChild(app.canvas);
 * ```
 */
