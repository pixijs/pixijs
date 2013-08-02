var PixiTest;
(function (PixiTest) {
    var Game = (function () {
        function Game() {
            var _this = this;
            var assetsToLoader = ["../../examples/example 12 - Spine/data/spineboy.json", "../../examples/example 12 - Spine/data/spineboySpineData.json"];

            var loader = new PIXI.AssetLoader(assetsToLoader);

            loader.onComplete = function () {
                _this.onAssetsLoaded();
            };

            loader.load();

            this.stage = new PIXI.Stage(0xFFFFFF, true);

            this.renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight);

            this.renderer.view.style.display = "block";

            document.body.appendChild(this.renderer.view);
        }
        Game.prototype.onAssetsLoaded = function () {
            var spineBoy = new PIXI.Spine("../../examples/example 12 - Spine/data/spineboySpineData.json");

            spineBoy.position.x = window.innerWidth / 2;
            spineBoy.position.y = window.innerHeight;

            spineBoy.scale.x = spineBoy.scale.y = window.innerHeight / 400;

            spineBoy.stateData.setMixByName("walk", "jump", 0.2);
            spineBoy.stateData.setMixByName("jump", "walk", 0.4);

            spineBoy.state.setAnimationByName("walk", true);

            this.stage.addChild(spineBoy);

            this.stage.click = function () {
                spineBoy.state.setAnimationByName("jump", false);
                spineBoy.state.addAnimationByName("walk", true);
            };

            var logo = PIXI.Sprite.fromImage("../../logo_small.png");
            this.stage.addChild(logo);

            logo.anchor.x = 1;
            logo.position.x = window.innerWidth;
            logo.scale.x = logo.scale.y = 0.5;
            logo.position.y = window.innerHeight - 70;
            logo.setInteractive(true);
            logo.buttonMode = true;
            logo.click = logo.tap = function () {
                window.open("https://github.com/GoodBoyDigital/pixi.js", "_blank");
            };

            requestAnimationFrame(this.animate.bind(this));
        };

        Game.prototype.animate = function () {
            requestAnimationFrame(this.animate.bind(this));

            this.renderer.render(this.stage);
        };
        return Game;
    })();
    PixiTest.Game = Game;
})(PixiTest || (PixiTest = {}));
