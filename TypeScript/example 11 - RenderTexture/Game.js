var PixiTest;
(function (PixiTest) {
    var Game = (function () {
        function Game() {
            this.items = [];
            this.count = 0;
            this.stage = new PIXI.Stage(0x000000);

            this.renderer = PIXI.autoDetectRenderer(800, 600);

            this.renderer.view.style.width = window.innerWidth + "px";
            this.renderer.view.style.height = window.innerHeight + "px";
            this.renderer.view.style.display = "block";

            document.body.appendChild(this.renderer.view);

            this.renderTexture = new PIXI.RenderTexture(800, 600);
            this.renderTexture2 = new PIXI.RenderTexture(800, 600);
            var currentTexture = this.renderTexture;

            this.outputSprite = new PIXI.Sprite(currentTexture);

            this.outputSprite.position.x = 800 / 2;
            this.outputSprite.position.y = 600 / 2;
            this.outputSprite.anchor.x = 0.5;
            this.outputSprite.anchor.y = 0.5;

            this.stage.addChild(this.outputSprite);

            this.stuffContainer = new PIXI.DisplayObjectContainer();

            this.stuffContainer.position.x = 800 / 2;
            this.stuffContainer.position.y = 600 / 2;

            this.stage.addChild(this.stuffContainer);

            var fruits = [
                "../../examples/example 11 - RenderTexture/spinObj_01.png",
                "../../examples/example 11 - RenderTexture/spinObj_02.png",
                "../../examples/example 11 - RenderTexture/spinObj_03.png",
                "../../examples/example 11 - RenderTexture/spinObj_04.png",
                "../../examples/example 11 - RenderTexture/spinObj_05.png",
                "../../examples/example 11 - RenderTexture/spinObj_06.png",
                "../../examples/example 11 - RenderTexture/spinObj_07.png",
                "../../examples/example 11 - RenderTexture/spinObj_08.png"
            ];

            for (var i = 0; i < 20; i++) {
                var item = PIXI.Sprite.fromImage(fruits[i % fruits.length]);
                item.position.x = Math.random() * 400 - 200;
                item.position.y = Math.random() * 400 - 200;

                item.anchor.x = 0.5;
                item.anchor.y = 0.5;

                this.stuffContainer.addChild(item);
                this.items.push(item);
            }
            ;

            requestAnimationFrame(this.animate.bind(this));
        }
        Game.prototype.animate = function () {
            requestAnimationFrame(this.animate.bind(this));

            for (var i = 0; i < this.items.length; i++) {
                var item = this.items[i];
                item.rotation += 0.1;
            }
            ;

            this.count += 0.01;

            var temp = this.renderTexture;
            this.renderTexture = this.renderTexture2;
            this.renderTexture2 = temp;

            this.outputSprite.setTexture(this.renderTexture);

            this.stuffContainer.rotation -= 0.01;
            this.outputSprite.scale.x = this.outputSprite.scale.y = 1 + Math.sin(this.count) * 0.2;

            this.renderTexture2.render(this.stage, true);

            this.renderer.render(this.stage);
        };
        return Game;
    })();
    PixiTest.Game = Game;
})(PixiTest || (PixiTest = {}));
