///<reference path="../PIXI.d.ts"/>

module PixiTest {

    declare var PIXI:any;

    export class Game {

        private stage:PIXI.Stage;
        private renderer:PIXI.IRenderer;

        constructor() {

            // create an array of assets to load
            var assetsToLoader:string[] = ["../../examples/example 12 - Spine/data/spineboy.json", "../../examples/example 12 - Spine/data/spineboySpineData.json"];

            // create a new loader
            var loader:PIXI.AssetLoader = new PIXI.AssetLoader(assetsToLoader);

            // use callback
            loader.onComplete = () => {
               this.onAssetsLoaded();
            };

            //begin load
            loader.load();

            // create an new instance of a pixi stage
            this.stage = new PIXI.Stage(0xFFFFFF, true);

            // create a renderer instance
            this.renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight);

            // set the canvas width and height to fill the screen
            this.renderer.view.style.display = "block";

            // add the renderer view element to the DOM
            document.body.appendChild(this.renderer.view);
        }

        private onAssetsLoaded() {
            
           // create a spine boy
            var spineBoy:PIXI.Spine = new PIXI.Spine("../../examples/example 12 - Spine/data/spineboySpineData.json");
            
            // set the position
            spineBoy.position.x = window.innerWidth/2;
            spineBoy.position.y = window.innerHeight;
            
            spineBoy.scale.x = spineBoy.scale.y = window.innerHeight / 400;
        
            // set up the mixes!
            spineBoy.stateData.setMixByName("walk", "jump", 0.2);
            spineBoy.stateData.setMixByName("jump", "walk", 0.4);
            
            // play animation
            spineBoy.state.setAnimationByName("walk", true);
            
            
            this.stage.addChild(spineBoy);
            
            this.stage.click = function()
            {
                spineBoy.state.setAnimationByName("jump", false);
                spineBoy.state.addAnimationByName("walk", true);
                
            }
            
            var logo = PIXI.Sprite.fromImage("../../logo_small.png")
            this.stage.addChild(logo);
            
            
            logo.anchor.x = 1;
            logo.position.x = window.innerWidth
            logo.scale.x = logo.scale.y = 0.5;
            logo.position.y = window.innerHeight - 70;
            logo.setInteractive(true);
            logo.buttonMode = true;
            logo.click = logo.tap = function()
            {
                window.open("https://github.com/GoodBoyDigital/pixi.js", "_blank")
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