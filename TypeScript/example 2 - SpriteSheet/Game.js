var PixiTest;
(function (PixiTest) {
    var Game = (function () {
        function Game() {
            this.count = 0;
            var assetsToLoader = ["../../examples/example 2 - SpriteSheet/SpriteSheet.json"];

            var loader = new PIXI.AssetLoader(assetsToLoader);

            this.aliens = [];

            loader.onComplete = this.onAssetsLoaded;

            console.log(this.aliens);

            loader.load();

            this.alienFrames = ["eggHead.png", "flowerTop.png", "helmlok.png", "skully.png"];

            var count = 0;

            this.stage = new PIXI.Stage(0xFFFFFF);

            this.renderer = PIXI.autoDetectRenderer(800, 600);

            document.body.appendChild(this.renderer.view);

            this.alienContainer = new PIXI.DisplayObjectContainer();
            this.alienContainer.position.x = 400;
            this.alienContainer.position.y = 300;

            this.stage.addChild(this.alienContainer);
        }
        Game.prototype.onAssetsLoaded = function () {
            for (var i = 0; i < 100; i++) {
                var alien = PIXI.Sprite.fromFrame("eggHead.png");

                alien.position.x = Math.random() * 800 - 400;
                alien.position.y = Math.random() * 600 - 300;
                alien.anchor.x = 0.5;
                alien.anchor.y = 0.5;
                this.aliens.push(alien);
                this.alienContainer.addChild(alien);
            }

            requestAnimationFrame(this.animate.bind(this));
        };

        Game.prototype.animate = function () {
            requestAnimationFrame(this.animate.bind(this));

            for (var i = 0; i < 100; i++) {
                var alien = this.aliens[i];
                alien.rotation += 0.1;
            }

            this.count += 0.01;
            this.alienContainer.scale.x = Math.sin(this.count);
            this.alienContainer.scale.y = Math.sin(this.count);

            this.alienContainer.rotation += 0.01;

            this.renderer.render(this.stage);
        };
        return Game;
    })();
    PixiTest.Game = Game;
})(PixiTest || (PixiTest = {}));
