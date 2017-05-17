///<reference path="../PIXI.d.ts"/>

module PixiTest {

    declare var PIXI:any;

    export class Game {

        private stage:PIXI.Stage;
        private renderer:PIXI.IRenderer;
        private count:number = 0;
        private tilingSprite:PIXI.TilingSprite;

        constructor() {

            // create an new instance of a pixi stage
            this.stage = new PIXI.Stage(0x97c56e, true);

            // create a renderer instance
            this.renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight);

            // add the renderer view element to the DOM
            document.body.appendChild(this.renderer.view);
            this.renderer.view.style.position = "absolute";
            this.renderer.view.style.top = "0px";
            this.renderer.view.style.left = "0px";

            requestAnimationFrame(this.animate.bind(this));
           
           // create a texture from an image path
            var texture:PIXI.Texture = PIXI.Texture.fromImage("../../examples/example 9 - Tiling Texture/p2.jpeg");
            
            // create a tiling sprite..
            // requires a texture, width and height
            // to work in webGL the texture size must be a power of two
            this.tilingSprite = new PIXI.TilingSprite(texture, window.innerWidth, window.innerHeight)

            this.stage.addChild(this.tilingSprite);
        }

        private animate() {            
            
            requestAnimationFrame(this.animate.bind(this));
            

            this.count += 0.005
            this.tilingSprite.tileScale.x = 2 + Math.sin(this.count);
            this.tilingSprite.tileScale.y = 2 + Math.cos(this.count);
        
            this.tilingSprite.tilePosition.x += 1;
            this.tilingSprite.tilePosition.y += 1;


            // render the stage   
            this.renderer.render(this.stage);
            
        }
    }
}
