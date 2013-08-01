var PixiTest;
(function (PixiTest) {
    var Game = (function () {
        function Game() {
            this.stage = new PIXI.Stage(0xFFFFFF, true);

            this.renderer = PIXI.autoDetectRenderer(620, 400);

            document.body.appendChild(this.renderer.view);

            requestAnimationFrame(this.animate.bind(this));

            var background = PIXI.Sprite.fromImage("../../examples/example 6 - Interactivity/button_test_BG.jpg");

            this.stage.addChild(background);

            var textureButton = PIXI.Texture.fromImage("../../examples/example 6 - Interactivity/button.png");
            var textureButtonDown = PIXI.Texture.fromImage("../../examples/example 6 - Interactivity/buttonDown.png");
            var textureButtonOver = PIXI.Texture.fromImage("../../examples/example 6 - Interactivity/buttonOver.png");

            var buttons = [];

            var buttonPositions = [
                175,
                75,
                600 - 145,
                75,
                600 / 2 - 20,
                400 / 2 + 10,
                175,
                400 - 75,
                600 - 115,
                400 - 95
            ];

            for (var i = 0; i < 5; i++) {
                var button = new PIXI.Sprite(textureButton);
                button.buttonMode = true;

                button.anchor.x = 0.5;
                button.anchor.y = 0.5;

                button.position.x = buttonPositions[i * 2];
                button.position.y = buttonPositions[i * 2 + 1];

                button.setInteractive(true);

                button.mousedown = button.touchstart = function (data) {
                    this.isdown = true;
                    this.setTexture(textureButtonDown);
                    this.alpha = 1;
                };

                button.mouseup = button.touchend = button.mouseupoutside = button.touchendoutside = function (data) {
                    this.isdown = false;

                    if (this.isOver) {
                        this.setTexture(textureButtonOver);
                    } else {
                        this.setTexture(textureButton);
                    }
                };

                button.mouseover = function (data) {
                    this.isOver = true;

                    if (this.isdown)
                        return;

                    this.setTexture(textureButtonOver);
                };

                button.mouseout = function (data) {
                    this.isOver = false;
                    if (this.isdown)
                        return;
                    this.setTexture(textureButton);
                };

                button.click = function (data) {
                    console.log("CLICK!");
                };

                button.tap = function (data) {
                    console.log("TAP!!");
                };

                this.stage.addChild(button);

                buttons.push(button);
            }

            buttons[0].scale.x = 1.2;

            buttons[1].scale.y = 1.2;

            buttons[2].rotation = Math.PI / 10;

            buttons[3].scale.x = 0.8;
            buttons[3].scale.y = 0.8;

            buttons[4].scale.x = 0.8;
            buttons[4].scale.y = 1.2;
            buttons[4].rotation = Math.PI;

            var pixiLogo = PIXI.Sprite.fromImage("../../examples/example 6 - Interactivity/pixi.png");
            this.stage.addChild(pixiLogo);

            pixiLogo.position.x = 620 - 56;
            pixiLogo.position.y = 400 - 32;

            pixiLogo.setInteractive(true);

            pixiLogo.click = pixiLogo.tap = function () {
                var win = window.open("https://github.com/GoodBoyDigital/pixi.js", '_blank');
            };
        }
        Game.prototype.animate = function () {
            requestAnimationFrame(this.animate.bind(this));

            this.renderer.render(this.stage);
        };
        return Game;
    })();
    PixiTest.Game = Game;
})(PixiTest || (PixiTest = {}));
