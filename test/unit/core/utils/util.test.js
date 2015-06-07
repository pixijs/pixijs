describe('PIXI.utils', function () {
    describe('.uid', function () {
        it('should exist', function () {
            expect(PIXI.utils.uid)
                .to.be.a('function');
        });

        it('should return a number', function () {
            expect(PIXI.utils.uid())
                .to.be.a('number');
        });
    });

    describe('.hex2rgb', function () {
        it('should exist', function () {
            expect(PIXI.utils.hex2rgb)
                .to.be.a('function');
        });

        it('should properly convert number to rgb array');
    });

    describe('.hex2string', function () {
        it('should exist', function () {
            expect(PIXI.utils.hex2string)
                .to.be.a('function');
        });

        it('should properly convert number to hex color string');
    });

    describe('.rgb2hex', function () {
        it('should exist', function () {
            expect(PIXI.utils.rgb2hex)
                .to.be.a('function');
        });

        it('should properly convert rgb array to hex color string');
    });

    describe('.getNextPowerOfTwo', function () {
        it('should exist', function () {
            expect(PIXI.utils.getNextPowerOfTwo)
                .to.be.a('function');
        });

        it('should return the next POT for a number');
    });

    describe('.isPowerOfTwo', function () {
        it('should exist', function () {
            expect(PIXI.utils.isPowerOfTwo)
                .to.be.a('function');
        });

        it('should return true if a number is a POT');
        it('should return false if a number is not a POT');
    });

    describe('.getResolutionOfUrl', function () {
        it('should exist', function () {
            expect(PIXI.utils.getResolutionOfUrl)
                .to.be.a('function');
        });

        it('should return the correct resolution based on a URL');
    });

    describe('.canUseNewCanvasBlendModes', function () {
        it('should exist', function () {
            expect(PIXI.utils.canUseNewCanvasBlendModes)
                .to.be.a('function');
        });
    });

    describe('.sayHello', function () {
        it('should exist', function () {
            expect(PIXI.utils.sayHello)
                .to.be.a('function');
        });
    });

    describe('.isWebGLSupported', function () {
        it('should exist', function () {
            expect(PIXI.utils.isWebGLSupported)
                .to.be.a('function');
        });
    });
});
