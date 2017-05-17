var PixiTest;
(function (PixiTest) {
    var Game = (function () {
        function Game() {
            var _this = this;
            this.count = 0;
            this.score = 0;
            var assetsToLoader = ["../../examples/example 10 - Text/desyrel.fnt"];

            var loader = new PIXI.AssetLoader(assetsToLoader);

            loader.onComplete = function () {
                _this.onAssetsLoaded();
            };

            loader.load();

            this.stage = new PIXI.Stage(0x66FF99);

            var background = PIXI.Sprite.fromImage("../../examples/example 10 - Text/textDemoBG.jpg");
            this.stage.addChild(background);

            this.renderer = PIXI.autoDetectRenderer(620, 400);

            document.body.appendChild(this.renderer.view);

            requestAnimationFrame(this.animate.bind(this));

            var textSample = new PIXI.Text("Pixi.js can has\nmultiline text!", { font: "35px Snippet", fill: "white", align: "left" });
            textSample.position.x = 20;
            textSample.position.y = 20;

            this.spinningText = new PIXI.Text("I'm fun!", { font: "bold 60px Podkova", fill: "#cc00ff", align: "center", stroke: "#FFFFFF", strokeThickness: 6 });

            this.spinningText.anchor.x = this.spinningText.anchor.y = 0.5;
            this.spinningText.position.x = 620 / 2;
            this.spinningText.position.y = 400 / 2;

            this.countingText = new PIXI.Text("COUNT 4EVAR: 0", { font: "bold italic 60px Arvo", fill: "#3e1707", align: "center", stroke: "#a4410e", strokeThickness: 7 });
            this.countingText.position.x = 620 / 2;
            this.countingText.position.y = 320;
            this.countingText.anchor.x = 0.5;

            this.stage.addChild(textSample);
            this.stage.addChild(this.spinningText);
            this.stage.addChild(this.countingText);
        }
        Game.prototype.onAssetsLoaded = function () {
            var bitmapFontText = new PIXI.BitmapText("bitmap fonts are\n now supported!", { font: "35px Desyrel", align: "right" });
            bitmapFontText.position.x = 620 - bitmapFontText.width - 20;
            bitmapFontText.position.y = 20;

            this.stage.addChild(bitmapFontText);
        };

        Game.prototype.animate = function () {
            requestAnimationFrame(this.animate.bind(this));

            this.count++;
            if (this.count == 50) {
                this.count = 0;
                this.score++;

                this.countingText.setText("COUNT 4EVAR: " + this.score);
            }

            this.spinningText.rotation += 0.03;

            this.renderer.render(this.stage);
        };
        return Game;
    })();
    PixiTest.Game = Game;
})(PixiTest || (PixiTest = {}));
