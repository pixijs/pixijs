///<reference path="../PIXI.d.ts"/>

module PixiTest {

    declare var PIXI:any;

    export class Game {

        private stage:PIXI.Stage;
        private renderer:PIXI.IRenderer;

        private renderTexture:PIXI.RenderTexture;
        private renderTexture2:PIXI.RenderTexture;

        private items:PIXI.Sprite[] = []; // create an array of items

        private stuffContainer:PIXI.DisplayObjectContainer;
        private outputSprite:PIXI.Sprite;

        private count:number = 0; // used for spinning!

        constructor() {

            // create an new instance of a pixi stage
            this.stage = new PIXI.Stage(0x000000);

            // create a renderer instance
            this.renderer = PIXI.autoDetectRenderer(800, 600);

            // set the canvas width and height to fill the screen
            this.renderer.view.style.width = window.innerWidth + "px";
            this.renderer.view.style.height = window.innerHeight + "px";
            this.renderer.view.style.display = "block";

            // add the renderer view element to the DOM
            document.body.appendChild(this.renderer.view);

            // OOH! SHINY!
            // create two render textures.. these dynamic textures will be used to draw the scene into itself
            this.renderTexture = new PIXI.RenderTexture(800, 600);
            this.renderTexture2 = new PIXI.RenderTexture(800, 600);
            var currentTexture:PIXI.RenderTexture = this.renderTexture;
            
            // create a new sprite that uses the render texture we created above
            this.outputSprite = new PIXI.Sprite(currentTexture);
            
            // align the sprite
            this.outputSprite.position.x = 800/2;
            this.outputSprite.position.y = 600/2;
            this.outputSprite.anchor.x = 0.5;
            this.outputSprite.anchor.y = 0.5;

            // add to stage
            this.stage.addChild(this.outputSprite);
            
            this.stuffContainer = new PIXI.DisplayObjectContainer();
            
            this.stuffContainer.position.x = 800/2;
            this.stuffContainer.position.y = 600/2;
            
            this.stage.addChild(this.stuffContainer);
            
            // create an array of image ids.. 
            var fruits:string[] = ["../../examples/example 11 - RenderTexture/spinObj_01.png", "../../examples/example 11 - RenderTexture/spinObj_02.png",
                            "../../examples/example 11 - RenderTexture/spinObj_03.png", "../../examples/example 11 - RenderTexture/spinObj_04.png",
                            "../../examples/example 11 - RenderTexture/spinObj_05.png", "../../examples/example 11 - RenderTexture/spinObj_06.png",
                            "../../examples/example 11 - RenderTexture/spinObj_07.png", "../../examples/example 11 - RenderTexture/spinObj_08.png"];
            
            // now create some items and randomly position them in the stuff container
            for (var i:number = 0; i < 20; i++) 
            {
                var item:PIXI.Sprite = PIXI.Sprite.fromImage(fruits[i % fruits.length]);
                item.position.x = Math.random() * 400 - 200;
                item.position.y = Math.random() * 400 - 200;
                
                item.anchor.x = 0.5;
                item.anchor.y = 0.5;
                
                this.stuffContainer.addChild(item);
                this.items.push(item);
            };

            requestAnimationFrame(this.animate.bind(this));
        }

        private animate() {            
            // just for fun, lets rotate mr rabbit a little
            requestAnimationFrame(this.animate.bind(this));
            
            for (var i:number = 0; i < this.items.length; i++) 
            {
                // rotate each item
                var item:PIXI.Sprite = this.items[i];
                item.rotation += 0.1;
            };
            
            this.count += 0.01;
            
            // swap the buffers..
            var temp:PIXI.RenderTexture = this.renderTexture;
            this.renderTexture = this.renderTexture2;
            this.renderTexture2 = temp;
            
            
            // set the new texture
            this.outputSprite.setTexture(this.renderTexture);
            
            // twist this up!
            this.stuffContainer.rotation -= 0.01
            this.outputSprite.scale.x = this.outputSprite.scale.y  = 1 + Math.sin(this.count) * 0.2;
            
            // render the stage to the texture
            // the true clears the texture before content is rendered
            this.renderTexture2.render(this.stage, true);

            // render the stage   
            this.renderer.render(this.stage);
            
        }
    }
}
