///<reference path="../PIXI.d.ts"/>

module PixiTest {

    declare var PIXI:any;

    export class Game {

        private stage:PIXI.Stage;
        private renderer:PIXI.IRenderer;
        private alienContainer:PIXI.DisplayObjectContainer;
        private count:number = 0;
        private aliens:PIXI.Sprite[] = [];
        private alienFrames:string[] = ["eggHead.png", "flowerTop.png", "helmlok.png", "skully.png"];

        constructor() {

            // create an array of assets to load
            var assetsToLoader:string[] = ["../../examples/example 2 - SpriteSheet/SpriteSheet.json"];

            // create a new loader
            var loader:PIXI.AssetLoader = new PIXI.AssetLoader(assetsToLoader);

            // use callback
            loader.onComplete = () => {
               this.onAssetsLoaded();
            };

            //begin load
            loader.load();

            // create an new instance of a pixi stage
            this.stage = new PIXI.Stage(0xFFFFFF);

            // create a renderer instance
            this.renderer = PIXI.autoDetectRenderer(800, 600);

            // add the renderer view element to the DOM
            document.body.appendChild(this.renderer.view);

            // create an empty container
            this.alienContainer = new PIXI.DisplayObjectContainer();
            this.alienContainer.position.x = 400;
            this.alienContainer.position.y = 300;
            
            this.stage.addChild(this.alienContainer);
        }

        private onAssetsLoaded() {
            
            // create a texture from an image path
            // add a bunch of aliens
            for (var i:number = 0; i < 100; i++) 
            {
                var frameName:string = this.alienFrames[i % 4];
                
                // create an alien using the frame name..
                var alien:PIXI.Sprite = PIXI.Sprite.fromFrame(frameName);
                
                /*
                 * fun fact for the day :)
                 * another way of doing the above would be
                 * var texture:PIXI.Texture = PIXI.Texture.fromFrame(frameName);
                 * var alien:PIXI.Sprite = new PIXI.Sprite(texture);
                 */
                
                alien.position.x = Math.random() * 800 - 400;
                alien.position.y = Math.random() * 600 - 300;
                alien.anchor.x = 0.5;
                alien.anchor.y = 0.5;
                this.aliens.push(alien);
                this.alienContainer.addChild(alien);
            }
            
            // start animating
            requestAnimationFrame(this.animate.bind(this));
        }

        private animate() {

            requestAnimationFrame(this.animate.bind(this));

            for (var i = 0; i < 100; i++)  {
                var alien:PIXI.Sprite = this.aliens[i];
                alien.rotation += 0.1;
            }
        
            this.count += 0.01;
            this.alienContainer.scale.x = Math.sin(this.count)
            this.alienContainer.scale.y = Math.sin(this.count)
            
            this.alienContainer.rotation += 0.01
            
            // render the stage   
            this.renderer.render(this.stage);
            
        }
    }
}