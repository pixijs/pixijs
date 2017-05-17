///<reference path="../PIXI.d.ts"/>

module PixiTest {

    declare var PIXI:any;

    export class Game {

        private stage:PIXI.Stage;
        private renderer:PIXI.IRenderer;

        constructor() {

            // create an new instance of a pixi stage, the second parameter is interactivity.
            this.stage = new PIXI.Stage(0xFFFFFF, true);

            // create a renderer instance
            this.renderer = PIXI.autoDetectRenderer(620, 400);

            // add the renderer view element to the DOM
            document.body.appendChild(this.renderer.view);

            requestAnimationFrame(this.animate.bind(this));

            // create a background..
            var background:PIXI.Sprite = PIXI.Sprite.fromImage("../../examples/example 6 - Interactivity/button_test_BG.jpg");
            
            // add background to stage..
            this.stage.addChild(background);
            
            // create some textures from an image path
            var textureButton:PIXI.Texture = PIXI.Texture.fromImage("../../examples/example 6 - Interactivity/button.png");
            var textureButtonDown:PIXI.Texture = PIXI.Texture.fromImage("../../examples/example 6 - Interactivity/buttonDown.png");
            var textureButtonOver:PIXI.Texture = PIXI.Texture.fromImage("../../examples/example 6 - Interactivity/buttonOver.png");
            
            var buttons:PIXI.Sprite[] = [];
            
            var buttonPositions:number[] = [175,75,
                                   600-145, 75,
                                   600/2 - 20, 400/2 + 10,
                                   175, 400-75,
                                   600-115, 400-95];

            for (var i:number = 0; i < 5; i++) 
            {
                var button:PIXI.Sprite = new PIXI.Sprite(textureButton);
                button.buttonMode = true;
                
                button.anchor.x = 0.5;
                button.anchor.y = 0.5;
                
                button.position.x = buttonPositions[i*2];
                button.position.y = buttonPositions[i*2 + 1];
                
                // make the button interactive..        
                button.setInteractive(true);
                
                // set the mousedown and touchstart callback..
                button.mousedown = button.touchstart = function(data){
                    
                    this.isdown = true;
                    this.setTexture(textureButtonDown);
                    this.alpha = 1;
                }
                
                // set the mouseup and touchend callback..
                button.mouseup = button.touchend = button.mouseupoutside = button.touchendoutside = function(data){
                    this.isdown = false;
                    
                    if(this.isOver)
                    {
                        this.setTexture(textureButtonOver);
                    }
                    else
                    {
                        this.setTexture(textureButton);
                    }
                }
                
                // set the mouseover callback..
                button.mouseover = function(data){
                    
                    this.isOver = true;
                    
                    if(this.isdown)return
                    
                    this.setTexture(textureButtonOver)
                }
                
                // set the mouseout callback..
                button.mouseout = function(data){
                    
                    this.isOver = false;
                    if(this.isdown)return
                    this.setTexture(textureButton)
                }
                
                button.click = function(data){
                    // click!
                    console.log("CLICK!");
                //  alert("CLICK!")
                }
                
                button.tap = function(data){
                    // click!
                    console.log("TAP!!");
                    //this.alpha = 0.5;
                }
                
                // add it to the stage
                this.stage.addChild(button);
                
                // add button to array
                buttons.push(button);
            }

            // set some silly values..
    
            buttons[0].scale.x = 1.2;
             
            buttons[1].scale.y = 1.2;
              
            buttons[2].rotation = Math.PI/10;
            
            buttons[3].scale.x = 0.8;
            buttons[3].scale.y = 0.8;
            
            buttons[4].scale.x = 0.8;
            buttons[4].scale.y = 1.2;
            buttons[4].rotation = Math.PI;

            // add a logo!
            var pixiLogo:PIXI.Sprite = PIXI.Sprite.fromImage("../../examples/example 6 - Interactivity/pixi.png");
            this.stage.addChild(pixiLogo);
            
            pixiLogo.position.x = 620 - 56;
            pixiLogo.position.y = 400- 32;
            
            pixiLogo.setInteractive(true);
            
            pixiLogo.click = pixiLogo.tap = function(){
                
                var win=window.open("https://github.com/GoodBoyDigital/pixi.js", '_blank');
                
            }
        }

        private animate() {

            requestAnimationFrame(this.animate.bind(this));

            // render the stage   
            this.renderer.render(this.stage);
        }
    }
}