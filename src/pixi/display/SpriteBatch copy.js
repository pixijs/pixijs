

PIXI.ParticleBatch = function(texture)
{
    PIXI.DisplayObjectContainer.call( this);

    this.textureThing = texture;

    this.ready = false;
}

PIXI.ParticleBatch.prototype = Object.create( PIXI.DisplayObjectContainer.prototype );
PIXI.ParticleBatch.constructor = PIXI.ParticleBatch;

PIXI.ParticleBatch.prototype.initWebGL = function(gl)
{
   
    var vecShaderSrc = [
        
        "attribute vec2 aVertexPosition;",
        "attribute vec2 aMovement;",
        "attribute vec2 aTexture;",
        
        "uniform mat3 translationMatrix;",

        "uniform float time;",
     //   "uniform float pos;",

        "uniform vec2 projectionVector;",
        "varying vec2 vTextureCoord;",
        "const float PI = 3.14159265358;",

        "void main(void) {",
       
        "vec2 v = aVertexPosition;",
         "float x = aMovement.x * 0.01;",
         "vec2 scaledVertex = aVertexPosition;",
         "v.x = (scaledVertex.x) * cos(x) - (scaledVertex.y) * sin(x);",
         "v.y = (scaledVertex.x) * sin(x) + (scaledVertex.y) * cos(x);",

         //"float pos = p * p * ((this._p1 + 1) * p - this._p1);"
         
         //"v.y = sin(-time*PI * 2.0) * -aMovement.y;",
        "v += aMovement;",

      //  "v += aVertexPosition;",
       //  "v.y *= 1.0 + smoothstep(time, 0.5, 1.0) * 3.0;",
        // "v.y += aMovement.y * time + aVertexPosition.y;",
        //  "v.y = time * aMovement.y;;",
        //  "v.y += aVertexPosition.y;",
         //"v.x += aMovement.x ;",

 //      "v.y *= -1.0;",

         "v.x += 1280.0/2.0;",
         "v.y += 800.0/2.0;",


          "gl_Position = vec4( v.x / projectionVector.x -1.0, v.y / projectionVector.y + 1.0 , 0.0, 1.0);",
         
        //  "gl_Position = vec4(aVertexPosition, 0.0, 1.0);",
          "vTextureCoord = aTexture;",
      
        "}"

    ];

    var fragShaderSrc = [
        "precision lowp float;",
        "varying vec2 vTextureCoord;",
        
        "uniform sampler2D uSampler;",
        "void main(void) {",
            "gl_FragColor = texture2D(uSampler, vTextureCoord);",
        "}"
    ];




    this.program = PIXI.compileProgram(gl, vecShaderSrc, fragShaderSrc)
    
    gl.useProgram(this.program);
    

    this.translationMatrix = gl.getUniformLocation(this.program, "translationMatrix");
    this.projectionVector = gl.getUniformLocation(this.program, "projectionVector");
    this.time = gl.getUniformLocation(this.program, "time");


    this.aVertexPosition = gl.getAttribLocation(this.program, "aVertexPosition");
    this.aMovement = gl.getAttribLocation(this.program, "aMovement");
    this.aTexture = gl.getAttribLocation(this.program, "aTexture");

   // console.log(":::" + this.aMovement)
    this.totalItems = 10000;


    this.verticies = new Float32Array( this.totalItems * 8 );
    this.movement = new Float32Array( this.totalItems * 8 );

    this.posData = new Float32Array( this.totalItems * 3 );

    this.texture = new Float32Array( this.totalItems * 8 );

    this.indices = new Uint16Array( this.totalItems * 6);

    for (var i = 0; i < this.totalItems * 8; i+=8) {
        
        var scale = 1// + Math.random()
        // position..
        this.verticies[i]   = -20 * scale;
        this.verticies[i+1] = -20 * scale;

        this.verticies[i+2] = 20 * scale;
        this.verticies[i+3] = -20 * scale;

        this.verticies[i+4] = 20 * scale;
        this.verticies[i+5] = 20 * scale;

        this.verticies[i+6] = -20 * scale;
        this.verticies[i+7] = 20 * scale;
    };

    var fullWidth = 142;
    var fullHeight= 157;
    
    var simpleFrame = new PIXI.Rectangle(0, 0, 142, 157);

    var gemCount = 0;

    for (var i = 0; i < this.totalItems * 8; i+=8) {
      
        gemCount++
        var gemFrame = this.texture.frame || simpleFrame;//this.gems[gemCount % this.gems.length].frame;
      //  console.log(gemFrame);
        // position..

        var xoff = gemFrame.x / fullWidth;
        var yoff = gemFrame.y / fullHeight;

        this.texture[i]   = xoff;
        this.texture[i+1] = yoff;

        this.texture[i+2] = xoff  + gemFrame.width / fullWidth;
        this.texture[i+3] = yoff;

        this.texture[i+4] = xoff + gemFrame.width / fullWidth;
        this.texture[i+5] = yoff +  gemFrame.height / fullHeight;

        this.texture[i+6] = xoff;
        this.texture[i+7] = yoff + gemFrame.height / fullHeight;



        // 

    };

    for (var i = 0; i < this.totalItems* 8; i+=8) {
        
        var pos = 0//Math.random() * 200;

        var angle = Math.random() * Math.PI * 2;

        var speed = (0.3 + Math.random() * 0.9) * 0.01;

        var pos = Math.sin(angle) *  speed;//Math.random() * 10 - 5;
        var posY = Math.cos(angle) * speed;

        var scale = 1;
//         var posY = 0.5 + Math.random()// * 200

      //  console.log(pos);
        this.movement[i]   = pos;
        this.movement[i+1] = posY;

        this.movement[i+2] = scale;
        this.movement[i+3] = scale;

        this.movement[i+4] = rotation;
        
        this.movement[i+5] = scale;

        this.movement[i+2] = pos;
        this.movement[i+3] = posY;

        this.movement[i+4] = pos;
        this.movement[i+5] = posY;

        this.movement[i+6] = pos;
        this.movement[i+7] = posY;
    }    

    this.reset();

    for (var i = 0; i < this.totalItems * 6; i+=6) {

          var i3 = (i / 6) * 4;

          this.indices[i] = i3;
          this.indices[i+1] = i3+1;
          this.indices[i+2] = i3+2;
          this.indices[i+3] = i3;
          this.indices[i+4] = i3+2;
          this.indices[i+5] = i3+3;

    }

  // console.log(this);
    this.vertexBuffer = gl.createBuffer();
    this.textureBuffer = gl.createBuffer();
    this.movementBuffer = gl.createBuffer();

    this.indexBuffer = gl.createBuffer();
   
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.verticies, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.texture, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.movementBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.movement, gl.DYNAMIC_DRAW);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    this.count = 0;
    this.speed = 18;
    this.posy = 0;

    this.ready = true;
  //  alert("!")
}

PIXI.ParticleBatch.prototype.addChild = function(child)
{
    PIXI.DisplayObjectContainer.prototype.addChild.call(child);


}

PIXI.ParticleBatch.prototype.reset = function()
{
    for (var i = 0; i < this.totalItems* 4; i+=4) {

         this.posData[i]     = 0; // pos x
         this.posData[i + 1] = 0; // pos y
         
        var angle = Math.random() * Math.PI * 2;

        var speed = 10 + Math.random() * 15;

        var pos = Math.sin(angle) *  speed;//Math.random() * 10 - 5;
        var posY = Math.cos(angle) *speed;


         this.posData[i + 2] = pos; // speed x
         this.posData[i + 3] = posY - 10; // speed y
    }

}

PIXI.ParticleBatch.prototype._renderWebGL = function(renderSession)
{
    if(!this.visible)return;

    renderSession.shaderManager.deactivateDefaultShader()
    if(!this.ready)this.initWebGL( renderSession.gl );
    
    renderSession.spriteBatch.stop();
    
    this.speed -= 0.4;

    this.count += this.speed;


    var gl = renderSession.gl;
    var glTexture = this.textureThing.baseTexture._glTextures[gl.id] || PIXI.createWebGLTexture(this.textureThing.baseTexture, gl)
  
    gl.useProgram(this.program);


    gl.enableVertexAttribArray(this.aVertexPosition);
    gl.enableVertexAttribArray(this.aMovement);
    gl.enableVertexAttribArray(this.aTexture);

   
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, glTexture);
    
    gl.uniform1f(this.time, this.count);
    gl.uniform2f(this.projectionVector, renderSession.projection.x, renderSession.projection.y);
  

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(this.aVertexPosition, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer);
    gl.vertexAttribPointer(this.aTexture, 2, gl.FLOAT, false, 0, 0);



    for (var i = 0; i < this.totalItems* 8; i+=8) {
        
        var val = ( i / 8 ) * 4;

        this.posData[val + 3] += 0.02;

       this.posData[val] += this.posData[val + 2];
        this.posData[val + 1] += this.posData[val + 3];

        var pos = this.posData[val];
        var posY = this.posData[val + 1];

        //pos += this.posData[val + 2];
        //posY += this.posData[val + 3];

        this.movement[i]   = pos;
        this.movement[i+1] = posY;

        this.movement[i+2] = pos;
        this.movement[i+3] = posY;

        this.movement[i+4] = pos;
        this.movement[i+5] = posY;

        this.movement[i+6] = pos;
        this.movement[i+7] = posY;
    }    

    gl.bindBuffer(gl.ARRAY_BUFFER, this.movementBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.movement);

    gl.vertexAttribPointer(this.aMovement, 2, gl.FLOAT, false, 0, 0);
    
    //gl.bindBuffer(gl.ARRAY_BUFFER, this.movementBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    gl.drawElements(gl.TRIANGLES, 6 * this.totalItems , gl.UNSIGNED_SHORT, 0);
    
  // not sure if both needed? but ya have for now!
  // override!
    // disable the current stuff..


 // gl.disableVertexAttribArray(PIXI.stripShader.aVertexPosition);
  //gl.disableVertexAttribArray(PIXI.stripShader.colorAttribute);
  //gl.disableVertexAttribArray(PIXI.stripShader.aTextureCoord);
  gl.disableVertexAttribArray(this.aVertexPosition);
  gl.disableVertexAttribArray(this.aMovement);
  gl.disableVertexAttribArray(this.aTexture);


  renderSession.shaderManager.activateDefaultShader()
  
  renderSession.spriteBatch.start();
  /*
  gl.useProgram(PIXI.defaultShader.program);

  gl.enableVertexAttribArray(PIXI.defaultShader.aVertexPosition);
  gl.enableVertexAttribArray(PIXI.defaultShader.colorAttribute);
  gl.enableVertexAttribArray(PIXI.defaultShader.aTextureCoord);
*/
   
}


