///<reference path="../PIXI.d.ts"/>

module PixiTest {

    declare var PIXI:any;

    export class Game {

        private stage:PIXI.Stage;
        private renderer:PIXI.IRenderer;
        private bunny:PIXI.Sprite;

        constructor() {

            // create an new instance of a pixi stage
            this.stage = new PIXI.Stage(0x66FF99);

            // create a renderer instance
            this.renderer = PIXI.autoDetectRenderer(400, 300);

            // add the renderer view element to the DOM
            document.body.appendChild(this.renderer.view);// add the renderer view element to the DOM

            requestAnimationFrame(this.animate.bind(this));

            // create a texture from an image path
            var texture:PIXI.Texture = PIXI.Texture.fromImage("../../examples/example 1 - Basics/bunny.png");
            // create a new Sprite using the texture
            this.bunny = new PIXI.Sprite(texture);

            // center the sprites anchor point
            this.bunny.anchor.x = 0.5;
            this.bunny.anchor.y = 0.5;

            // move the sprite t the center of the screen
            this.bunny.position.x = 200;
            this.bunny.position.y = 150;

            this.stage.addChild(this.bunny);
        }

        private animate() {            
            // just for fun, lets rotate mr rabbit a little
            requestAnimationFrame(this.animate.bind(this));
            this.bunny.rotation += 0.1;

            // render the stage   
            this.renderer.render(this.stage);
            
        }
    }
}
