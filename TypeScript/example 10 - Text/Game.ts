///<reference path="../PIXI.d.ts"/>

module PixiTest {

    declare var PIXI:any;

    export class Game {

        private stage:PIXI.Stage;
        private renderer:PIXI.IRenderer;

        private spinningText:PIXI.Text;
        private countingText:PIXI.Text;

        private count:number = 0;
        private score:number = 0;

        constructor() {

             var assetsToLoader:string[] = ["../../examples/example 10 - Text/desyrel.fnt"];

            // create a new loader
            var loader:PIXI.AssetLoader = new PIXI.AssetLoader(assetsToLoader);

            // use callback
            loader.onComplete = () => {
               this.onAssetsLoaded();
            };

            //begin load
            loader.load();

            // create an new instance of a pixi stage
            this.stage = new PIXI.Stage(0x66FF99);

            // add a shiney background..
            var background:PIXI.Sprite = PIXI.Sprite.fromImage("../../examples/example 10 - Text/textDemoBG.jpg");
            this.stage.addChild(background);

            // create a renderer instance
            this.renderer = PIXI.autoDetectRenderer(620, 400);

            // add the renderer view element to the DOM
            document.body.appendChild(this.renderer.view);

            requestAnimationFrame(this.animate.bind(this));

            // create some white text using the Snippet webfont
            var textSample:PIXI.Text = new PIXI.Text("Pixi.js can has\nmultiline text!", {font: "35px Snippet", fill: "white", align: "left"});
            textSample.position.x = 20;
            textSample.position.y = 20;

            // create a text object with a nice stroke
            this.spinningText = new PIXI.Text("I'm fun!", {font: "bold 60px Podkova", fill: "#cc00ff", align: "center", stroke: "#FFFFFF", strokeThickness: 6});
            // setting the anchor point to 0.5 will center align the text... great for spinning!
            this.spinningText.anchor.x = this.spinningText.anchor.y = 0.5;
            this.spinningText.position.x = 620 / 2;
            this.spinningText.position.y = 400 / 2;

            // create a text object that will be updated..
            this.countingText = new PIXI.Text("COUNT 4EVAR: 0", {font: "bold italic 60px Arvo", fill: "#3e1707", align: "center", stroke: "#a4410e", strokeThickness: 7});
            this.countingText.position.x = 620 / 2;
            this.countingText.position.y = 320;
            this.countingText.anchor.x = 0.5;
            
            this.stage.addChild(textSample);
            this.stage.addChild(this.spinningText);
            this.stage.addChild(this.countingText);
        }

        private onAssetsLoaded() {

            var bitmapFontText:PIXI.BitmapText = new PIXI.BitmapText("bitmap fonts are\n now supported!", {font: "35px Desyrel", align: "right"});
            bitmapFontText.position.x = 620 - bitmapFontText.width - 20;
            bitmapFontText.position.y = 20;

            this.stage.addChild(bitmapFontText);
        }

        private animate() {            
            // just for fun, lets rotate mr rabbit a little
            requestAnimationFrame(this.animate.bind(this));
            
            this.count++;
            if(this.count == 50)
            {
                this.count = 0;
                this.score++;
                // update the text...
                this.countingText.setText("COUNT 4EVAR: " + this.score);
                
            }
            // just for fun, lets rotate the text
            this.spinningText.rotation += 0.03;

            // render the stage   
            this.renderer.render(this.stage);
            
        }
    }
}
