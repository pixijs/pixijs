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

    describe('.sign', function () {
        it('should return 0 for 0', function () {
            expect(PIXI.utils.sign(0))
                .to.be.equal(0);
        });

        it('should return -1 for negative numbers', function () {
            for (var i = 0;i<10;i+=1){
                expect(PIXI.utils.sign(-Math.random()))
                    .to.be.equal(-1);
            }
        });

        it('should return 1 for positive numbers', function () {
            for (var i = 0;i<10;i+=1){
                expect(PIXI.utils.sign(Math.random() + 0.000001))
                    .to.be.equal(1);
            }
        });
    });

    describe('.removeItems', function () {
        var arr;

        beforeEach(function () {
            arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        });

        it('should return if the start index is greater than or equal to the length of the array', function () {
            PIXI.utils.removeItems(arr, arr.length+1, 5);
            expect(arr.length).to.be.equal(10);
        });

        it('should return if the remove count is 0', function () {
            PIXI.utils.removeItems(arr, 2, 0);
            expect(arr.length).to.be.equal(10);
        });

        it('should remove the number of elements specified from the array, starting from the start index', function () {
            var res = [ 1, 2, 3, 8, 9, 10 ];
            PIXI.utils.removeItems(arr, 3, 4);
            expect(arr).to.be.deep.equal(res);
        });

        it('should remove rest of elements if the delete count is > than the number of elements after start index', function () {
            var res = [ 1, 2, 3, 4, 5, 6, 7 ];
            PIXI.utils.removeItems(arr, 7, 10);
            expect(arr).to.be.deep.equal(res);
        });
    });
});
