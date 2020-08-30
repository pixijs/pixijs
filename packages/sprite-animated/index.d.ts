import type { IDestroyOptions } from '@pixi/display';
import { Sprite } from '@pixi/sprite';
import { Texture } from '@pixi/core';

/**
 * An AnimatedSprite is a simple way to display an animation depicted by a list of textures.
 *
 * ```js
 * let alienImages = ["image_sequence_01.png","image_sequence_02.png","image_sequence_03.png","image_sequence_04.png"];
 * let textureArray = [];
 *
 * for (let i=0; i < 4; i++)
 * {
 *      let texture = PIXI.Texture.from(alienImages[i]);
 *      textureArray.push(texture);
 * };
 *
 * let animatedSprite = new PIXI.AnimatedSprite(textureArray);
 * ```
 *
 * The more efficient and simpler way to create an animated sprite is using a {@link PIXI.Spritesheet}
 * containing the animation definitions:
 *
 * ```js
 * PIXI.Loader.shared.add("assets/spritesheet.json").load(setup);
 *
 * function setup() {
 *   let sheet = PIXI.Loader.shared.resources["assets/spritesheet.json"].spritesheet;
 *   animatedSprite = new PIXI.AnimatedSprite(sheet.animations["image_sequence"]);
 *   ...
 * }
 * ```
 *
 * @class
 * @extends PIXI.Sprite
 * @memberof PIXI
 */
export declare class AnimatedSprite extends Sprite {
    animationSpeed: number;
    loop: boolean;
    updateAnchor: boolean;
    onComplete: () => void;
    onFrameChange: (currentFrame: number) => void;
    onLoop: () => void;
    private _playing;
    private _textures;
    private _durations;
    private _autoUpdate;
    private _isConnectedToTicker;
    private _currentTime;
    private _previousFrame;
    /**
     * @param {PIXI.Texture[]|PIXI.AnimatedSprite.FrameObject[]} textures - An array of {@link PIXI.Texture} or frame
     *  objects that make up the animation.
     * @param {boolean} [autoUpdate=true] - Whether to use PIXI.Ticker.shared to auto update animation time.
     */
    constructor(textures: Texture[] | FrameObject[], autoUpdate?: boolean);
    /**
     * Stops the AnimatedSprite.
     *
     */
    stop(): void;
    /**
     * Plays the AnimatedSprite.
     *
     */
    play(): void;
    /**
     * Stops the AnimatedSprite and goes to a specific frame.
     *
     * @param {number} frameNumber - Frame index to stop at.
     */
    gotoAndStop(frameNumber: number): void;
    /**
     * Goes to a specific frame and begins playing the AnimatedSprite.
     *
     * @param {number} frameNumber - Frame index to start at.
     */
    gotoAndPlay(frameNumber: number): void;
    /**
     * Updates the object transform for rendering.
     *
     * @param {number} deltaTime - Time since last tick.
     */
    update(deltaTime: number): void;
    /**
     * Updates the displayed texture to match the current frame index.
     *
     * @private
     */
    private updateTexture;
    /**
     * Stops the AnimatedSprite and destroys it.
     *
     * @param {object|boolean} [options] - Options parameter. A boolean will act as if all options
     *  have been set to that value.
     * @param {boolean} [options.children=false] - If set to true, all the children will have their destroy
     *      method called as well. 'options' will be passed on to those calls.
     * @param {boolean} [options.texture=false] - Should it destroy the current texture of the sprite as well.
     * @param {boolean} [options.baseTexture=false] - Should it destroy the base texture of the sprite as well.
     */
    destroy(options: IDestroyOptions | boolean): void;
    /**
     * A short hand way of creating an AnimatedSprite from an array of frame ids.
     *
     * @static
     * @param {string[]} frames - The array of frames ids the AnimatedSprite will use as its texture frames.
     * @return {PIXI.AnimatedSprite} The new animated sprite with the specified frames.
     */
    static fromFrames(frames: string[]): AnimatedSprite;
    /**
     * A short hand way of creating an AnimatedSprite from an array of image ids.
     *
     * @static
     * @param {string[]} images - The array of image urls the AnimatedSprite will use as its texture frames.
     * @return {PIXI.AnimatedSprite} The new animate sprite with the specified images as frames.
     */
    static fromImages(images: string[]): AnimatedSprite;
    /**
     * The total number of frames in the AnimatedSprite. This is the same as number of textures
     * assigned to the AnimatedSprite.
     *
     * @readonly
     * @member {number}
     * @default 0
     */
    get totalFrames(): number;
    /**
     * The array of textures used for this AnimatedSprite.
     *
     * @member {PIXI.Texture[]}
     */
    get textures(): Texture[] | FrameObject[];
    set textures(value: Texture[] | FrameObject[]);
    /**
    * The AnimatedSprites current frame index.
    *
    * @member {number}
    * @readonly
    */
    get currentFrame(): number;
    /**
     * Indicates if the AnimatedSprite is currently playing.
     *
     * @member {boolean}
     * @readonly
     */
    get playing(): boolean;
    /**
     * Whether to use PIXI.Ticker.shared to auto update animation time
     *
     * @member {boolean}
     */
    get autoUpdate(): boolean;
    set autoUpdate(value: boolean);
}

export declare interface FrameObject {
    texture: Texture;
    time: number;
}

export { }
