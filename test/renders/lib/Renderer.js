'use strict';

const md5 = require('js-md5');
const path = require('path');
const ImageDiff = require('./ImageDiff');

/**
 * Class to create and validate solutions.
 * @class Renderer
 */
class Renderer
{
    /**
     * @constructor
     * @param {HTMLCanvasElement} [viewWebGL] Optional canvas element for webgl
     * @param {HTMLCanvasElement} [viewContext2d] Optional canvas element for context2d
     * @param {HTMLElement} [parentNode] container, defaults to `document.body`
     */
    constructor(viewWebGL, viewContext2d, parentNode)
    {
        viewWebGL = viewWebGL || document.createElement('canvas');
        viewContext2d = viewContext2d || document.createElement('canvas');

        /**
         * The container node to add the canvas elements.
         * @name parentNode
         * @type {HTMLElement}
         */
        this.parentNode = parentNode || document.body;

        if (!viewWebGL.parentNode)
        {
            this.parentNode.appendChild(viewWebGL);
        }
        if (!viewContext2d.parentNode)
        {
            this.parentNode.appendChild(viewContext2d);
        }

        /**
         * The container for the display objects.
         * @name stage
         * @type {PIXI.Container}
         */
        this.stage = new PIXI.Container();

        /**
         * If the current browser supports WebGL.
         * @name hasWebGL
         * @type {Boolean}
         */
        this.hasWebGL = PIXI.utils.isWebGLSupported();

        if (this.hasWebGL)
        {
            /**
             * The WebGL PIXI renderer.
             * @name webgl
             * @type {PIXI.WebGLRenderer}
             */
            this.webgl = new PIXI.WebGLRenderer(Renderer.WIDTH, Renderer.HEIGHT, {
                view: viewWebGL,
                backgroundColor: 0xffffff,
                antialias: false,
                preserveDrawingBuffer: true,
            });
        }

        /**
         * The Canvas PIXI renderer.
         * @name webgl
         * @type {PIXI.WebGLRenderer}
         */
        this.canvas = new PIXI.CanvasRenderer(Renderer.WIDTH, Renderer.HEIGHT, {
            view: viewContext2d,
            backgroundColor: 0xffffff,
            antialias: false,
            preserveDrawingBuffer: true,
            roundPixels: true,
        });
        this.canvas.smoothProperty = null;
        this.render();

        /**
         * Library for comparing images diffs.
         * @name imagediff
         * @type {ImageDiff}
         */
        this.imagediff = new ImageDiff(
            Renderer.WIDTH,
            Renderer.HEIGHT,
            Renderer.TOLERANCE
        );
    }

    /**
     * Rerender the stage
     * @method render
     */
    render()
    {
        if (this.hasWebGL)
        {
            this.webgl.render(this.stage);
        }
        this.canvas.render(this.stage);
    }

    /**
     * Clear the stage
     * @method clear
     */
    clear()
    {
        this.stage.children.forEach(function (child)
        {
            child.destroy(true);
        });
        this.render();
    }

    /**
     * Run the solution renderer
     * @method run
     * @param {String} filePath Fully resolved path to javascript.
     * @param {Function} callback Takes error and result as arguments.
     */
    run(filePath, callback)
    {
        delete require.cache[path.resolve(filePath)];
        let data;
        const code = require(filePath); // eslint-disable-line global-require

        if (typeof code !== 'function' && !code.async)
        {
            callback(new Error('Invalid JS format, make sure file is '
                + 'CommonJS compatible, e.g. "module.exports = function(){};"'));
        }
        else
        {
            this.clear();
            const done = () =>
            {
                if (!this.stage.children.length)
                {
                    callback(new Error('Stage has no children, make sure to '
                        + 'add children in your test, e.g. "module.exports = function(){};"'));
                }
                else
                {
                    // Generate the result
                    const result = {
                        webgl: {},
                        canvas: {},
                    };

                    this.render();
                    if (this.hasWebGL)
                    {
                        data = this.webgl.view.toDataURL();
                        result.webgl.image = data;
                        result.webgl.hash = md5(data);
                    }
                    data = this.canvas.view.toDataURL();
                    result.canvas.image = data;
                    result.canvas.hash = md5(data);

                    callback(null, result);
                }
            };

            // Support for asynchronous tests
            if (code.async)
            {
                code.async.call(this, done);
            }
            else
            {
                // Just run the test synchronously
                code.call(this);
                done();
            }
        }
    }

    /**
     * Compare a file with a solution.
     * @method compare
     * @param {String} filePath The file to load.
     * @param {String} solutionPath The path to the solution file.
     * @param {Array<String>} solution.webgl Solution for webgl
     * @param {Array<String>} solution.canvas Solution for canvas
     * @param {Function} callback Complete callback, takes err as an error and success boolean as args.
     */
    compare(filePath, solutionPath, callback)
    {
        this.run(filePath, (err, result) =>
        {
            const solution = require(solutionPath); // eslint-disable-line global-require

            if (!solution.webgl || !solution.canvas)
            {
                callback(new Error('Invalid solution'));
            }
            else if (err)
            {
                callback(err);
            }
            else if (this.hasWebGL && !this.compareResult(solution.webgl, result.webgl))
            {
                callback(new Error('WebGL results do not match.'));
            }
            else if (!this.compareResult(solution.canvas, result.canvas))
            {
                callback(new Error('Canvas results do not match.'));
            }
            else
            {
                callback(null, true);
            }
        });
    }

    /**
     * Compare two arrays of frames
     * @method compareResult
     * @private
     * @param {Array} a First result to compare
     * @param {Array} b Second result to compare
     * @return {Boolean} If we're equal
     */
    compareResult(a, b)
    {
        if (a === b)
        {
            return true;
        }
        if (a === null || b === null)
        {
            return false;
        }
        if (a.hash !== b.hash)
        {
            if (!this.imagediff.compare(a.image, b.image))
            {
                return false;
            }
        }

        return true;
    }

    /**
     * Destroy and don't use after this.
     * @method destroy
     */
    destroy()
    {
        this.clear();
        this.stage.destroy(true);
        this.parentNode = null;
        this.canvas.destroy(true);
        this.canvas = null;

        if (this.hasWebGL)
        {
            this.webgl.destroy(true);
            this.webgl = null;
        }
    }
}

/**
 * The width of the render.
 * @static
 * @type {int}
 * @name WIDTH
 * @default 32
 */
Renderer.WIDTH = 32;

/**
 * The height of the render.
 * @static
 * @type {int}
 * @name HEIGHT
 * @default 32
 */
Renderer.HEIGHT = 32;

/**
 * The tolerance when comparing image solutions.
 * for instance 0.01 would mean any difference greater
 * than 1% would be consider not the same.
 * @static
 * @type {Number}
 * @name TOLERANCE
 * @default 0.01
 */
Renderer.TOLERANCE = 0.01;

module.exports = Renderer;
