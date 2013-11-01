/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */



PIXI.BlurFilter = function()
{
    
	this.blurXFilter = new PIXI.BlurXFilter();
	this.blurYFilter = new PIXI.BlurYFilter();

	this.passes =[this.blurXFilter, this.blurYFilter];
	
}

Object.defineProperty(PIXI.BlurFilter.prototype, 'blur', {
    get: function() {
        return this.blurX.blur;
    },
    set: function(value) {
  		this.blurXFilter.blur = this.blurYFilter.blur = value;
    }
});


Object.defineProperty(PIXI.BlurFilter.prototype, 'blurX', {
    get: function() {
        return this.blurXFilter.blur;
    },
    set: function(value) {
    	this.blurXFilter.blur = value;
    }
});

Object.defineProperty(PIXI.BlurFilter.prototype, 'blurY', {
    get: function() {
        return this.blurYFilter.blur;
    },
    set: function(value) {
    	this.blurYFilter.blur = value;
    }
});
