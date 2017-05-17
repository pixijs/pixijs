var PixiTest;
(function (PixiTest) {
    var Game = (function () {
        function Game() {
            var _this = this;
            var assetsToLoader = ["../../examples/example 3 - MovieClip/SpriteSheet.json"];

            var loader = new PIXI.AssetLoader(assetsToLoader);

            loader.onComplete = function () {
                _this.onAssetsLoaded();
            };

            loader.load();

            this.stage = new PIXI.Stage(0xFFFFFF);

            this.renderer = PIXI.autoDetectRenderer(800, 600);

            document.body.appendChild(this.renderer.view);
        }
        Game.prototype.onAssetsLoaded = function () {
            var explosionTextures = [];

            for (var i = 0; i < 26; i++) {
                var texture = PIXI.Texture.fromFrame("Explosion_Sequence_A " + (i + 1) + ".png");
                explosionTextures.push(texture);
            }
            ;

            for (var i = 0; i < 50; i++) {
                var explosion = new PIXI.MovieClip(explosionTextures);

                explosion.position.x = Math.random() * 800;
                explosion.position.y = Math.random() * 600;
                explosion.anchor.x = 0.5;
                explosion.anchor.y = 0.5;

                explosion.rotation = Math.random() * Math.PI;
                explosion.scale.x = explosion.scale.y = 0.75 + Math.random() * 0.5;

                explosion.gotoAndPlay(Math.random() * 27);

                this.stage.addChild(explosion);
            }

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
