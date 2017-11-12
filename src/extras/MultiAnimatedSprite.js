import * as core from '../core';

import AnimatedSprite from './AnimatedSprite';

/**
 * An MultiMultiAnimatedSprite can display several animations depicted by a map containing a list of textures.
 *
 * ```js
 * let walk = ['image_sequence_01.png','image_sequence_02.png','image_sequence_03.png','image_sequence_04.png'];
 *
 * for (let i=0; i < 4; i++)
 * {
 *     walk[i] = PIXI.Texture.fromImage(walk[i]);
 * }
 *
 * let stop = [walk[1]];
 *
 * let mc = new PIXI.MultiAnimatedSprite({walk, stop},'stop');
 *
 * mc.play('walk')
 *
 * ```
 *
 * @class
 * @extends PIXI.extras.AnimatedSprite
 * @memberof PIXI.extras
 */
export default class MultiAnimatedSprite extends AnimatedSprite
{
    /**
     * @param {object} animationMap - a map of named animations, each animation is
     * an array of {PIXI.Texture[]|FrameObject[]} textures.
     * @param {string} initialAnimation - name of the initial animation. must exist inside the animationMap
     * @param {boolean} [autoUpdate=true] - Whether to use PIXI.ticker.shared to auto update animation time.
     */
    constructor(animationMap, initialAnimation, autoUpdate)
    {
        super(animationMap[initialAnimation], autoUpdate);

        /**
         * map containing named animations. each key is a list of textures or images
         *
         * @member {object}
         */
        this.animationMap = animationMap;

        /**
         * current animation name executing
         *
         * @member {string}
         */
        this.currentAnimation = initialAnimation;

        /**
         * the initial animation name
         *
         * @member {string}
         */
        this.initialAnimation = initialAnimation;
    }

    /**
     * Plays the requested animation from MultiAnimatedSprite
     *
     * @param {string} animation - animation from animation map to be played.
     * It will simply play current animation if no named animation is sent
     */
    play(animation)
    {
        if (this.currentAnimation === animation || !animation)
        {
            return;
        }

        this.currentAnimation = animation;
        this.textures = this.animationMap[animation];

        this.playing = true;
        if (this._autoUpdate)
        {
            core.ticker.shared.add(this.update, this, core.UPDATE_PRIORITY.HIGH);
        }
    }
}
