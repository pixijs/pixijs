



var WebGLState = function(gl)
{
	this.activeState = new Uint8Array(16);
	this.defaultState = new Uint8Array(16);
	
	// default blend mode..
	this.defaultState[0] = 1;

	this.stackIndex = 0;

	this.stack = [];

	this.gl = gl;

	this.maxAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);

	// check we have vao..
	this.nativeVaoExtension = (
      gl.getExtension('OES_vertex_array_object') ||
      gl.getExtension('MOZ_OES_vertex_array_object') ||
      gl.getExtension('WEBKIT_OES_vertex_array_object')
    );
}

WebGLState.prototype.push = function()
{
	// next state..
	var state = this.state[++this.stackIndex];

	if(!state)
	{
		state = this.state[this.stackIndex] = new Uint8Array(16);
	}

	// copy state..
	// set active state so we can force overrides of gl state
	for (var i = 0; i < this.activeState.length; i++) 
	{
		this.activeState[i] = state[i];
	};
}

var BLEND = 0,
	DEPTH_TEST = 1,
	FRONT_FACE = 2,
	CULL_FACE = 3;

WebGLState.prototype.pop = function()
{
	var state =  this.state[--this.stackIndex];
	this.setState(state);
}

WebGLState.prototype.setState = function(state)
{
	this.setBlend(state[BLEND]);
	this.setDepthTest(state[DEPTH_TEST]);
	this.setDepthTest(state[FRONT_FACE]);
	this.setDepthTest(state[CULL_FACE]);
}

WebGLState.prototype.setBlendMode = function(blendMode)
{
	
}

WebGLState.prototype.setBlend = function(value)
{
	if(this.activeState[BLEND] === value|0)return;

	this.activeState[BLEND] = value|0;
	
	var gl = this.gl;

	if(value)
	{
		gl.enable(gl.BLEND);	
	}
	else
	{
		gl.disable(gl.BLEND);		
	}
}

WebGLState.prototype.setDepthTest = function(value)
{
	if(this.activeState[DEPTH_TEST] === value|0)return;

	this.activeState[DEPTH_TEST] = value|0;

	var gl = this.gl;

	if(value)
	{
		gl.enable(gl.DEPTH_TEST);	
	}
	else
	{
		gl.disable(gl.DEPTH_TEST);		
	}
}

WebGLState.prototype.setCullFace = function(value)
{
	if(this.activeState[CULL_FACE] === value|0)return;

	this.activeState[CULL_FACE] = value|0;

	var gl = this.gl;

	if(value)
	{
		gl.enable(gl.CULL_FACE);	
	}
	else
	{
		gl.disable(gl.CULL_FACE);		
	}
}

WebGLState.prototype.setFrontFace = function(value)
{
	if(this.activeState[FRONT_FACE] === value|0)return;

	this.activeState[FRONT_FACE] = value|0;

	var gl = this.gl;

	if(value)
	{
		gl.frontFace(gl.CW);	
	}
	else
	{
		gl.frontFace(gl.CCW);		
	}
}

WebGLState.prototype.resetAttributes = function(value)
{
	var gl = this.gl;
	
	// im going to assume one is always active for performance reasons.
	for (i = 1; i < this.maxAttribs; i++)
    {
		gl.disableVertexAttribArray(i);
    }
}

//used
WebGLState.prototype.resetToDefault = function()
{
	// unbind any VAO if they exist..
	if(this.nativeVaoExtension)
	{
		this.nativeVaoExtension.bindVertexArrayOES(null);
	}

	// reset all attributs..
	this.resetAttributes();

	// set active state so we can force overrides of gl state
	for (var i = 0; i < this.activeState.length; i++) 
	{
		this.activeState[i] = 2;
	};

	this.setState(this.defaultState);
}

module.exports = WebGLState;
