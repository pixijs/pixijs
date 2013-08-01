///<reference path="../PIXI.d.ts"/>

module PixiTest {

    declare var PIXI:any;

    export class Game {

        private stage:PIXI.Stage;
        private renderer:PIXI.IRenderer;

        constructor() {

            // create an array of assets to load
            var assetsToLoader:string[] = ["../../examples/example 3 - MovieClip/SpriteSheet.json"];

            // create a new loader
            var loader:PIXI.AssetLoader = new PIXI.AssetLoader(assetsToLoader);

            // use callback
            loader.onComplete = () => {
               this.onAssetsLoaded(this);
            };

            //begin load
            loader.load();

            // create an new instance of a pixi stage
            this.stage = new PIXI.Stage(0xFFFFFF);

            // create a renderer instance
            this.renderer = PIXI.autoDetectRenderer(800, 600);

            // add the renderer view element to the DOM
            document.body.appendChild(this.renderer.view);
        }

        private onAssetsLoaded(that:any) {
            
            // create an array to store the textures
            var explosionTextures:PIXI.Texture[] = [];
            
            for (var i:number = 0; i < 26; i++) 
            {
                var texture:PIXI.Texture = PIXI.Texture.fromFrame("Explosion_Sequence_A " + (i+1) + ".png");
                explosionTextures.push(texture);
            };
            
            // create a texture from an image path
            // add a bunch of aliens
            for (var i:number = 0; i < 50; i++) 
            {
                // create an explosion MovieClip
                var explosion:PIXI.MovieClip = new PIXI.MovieClip(explosionTextures);
            
                explosion.position.x = Math.random() * 800;
                explosion.position.y = Math.random() * 600;
                explosion.anchor.x = 0.5;
                explosion.anchor.y = 0.5;
                
                explosion.rotation = Math.random() * Math.PI;
                explosion.scale.x = explosion.scale.y = 0.75 + Math.random() * 0.5
                
                explosion.gotoAndPlay(Math.random() * 27);
                
                that.stage.addChild(explosion);
            }
            
            // start animating
            requestAnimationFrame(this.animate.bind(this));
        }

        private animate() {

            requestAnimationFrame(this.animate.bind(this));

            // render the stage   
            this.renderer.render(this.stage);
            
        }
    }
}