/**
 * @Instructions
 * 		@task1 : Complete the setTexture function to handle non power of 2 sized textures
 * 		@task2 : Implement the lighting by modifying the fragment shader, constructor,
 */

// Mukremin Berkay Can 29313

function GetModelViewProjection(projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY) {
	
	var trans1 = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];
	var rotatXCos = Math.cos(rotationX);
	var rotatXSin = Math.sin(rotationX);

	var rotatYCos = Math.cos(rotationY);
	var rotatYSin = Math.sin(rotationY);

	var rotatx = [
		1, 0, 0, 0,
		0, rotatXCos, -rotatXSin, 0,
		0, rotatXSin, rotatXCos, 0,
		0, 0, 0, 1
	]

	var rotaty = [
		rotatYCos, 0, -rotatYSin, 0,
		0, 1, 0, 0,
		rotatYSin, 0, rotatYCos, 0,
		0, 0, 0, 1
	]

	var test1 = MatrixMult(rotaty, rotatx);
	var test2 = MatrixMult(trans1, test1);
	var mvp = MatrixMult(projectionMatrix, test2);

	return mvp;
}


class MeshDrawer {
	// The constructor is a good place for taking care of the necessary initializations.
	constructor() {
        this.prog = InitShaderProgram(meshVS, meshFS);
        gl.useProgram(this.prog);
    
        // Uniform locations
        this.mvpLoc = gl.getUniformLocation(this.prog, 'mvp');
        this.showTexLoc = gl.getUniformLocation(this.prog, 'showTex');
        this.colorLoc = gl.getUniformLocation(this.prog, 'color');
        this.lightPosLoc = gl.getUniformLocation(this.prog, 'lightPos');
        this.enableLightingLoc = gl.getUniformLocation(this.prog, 'enableLighting');
        this.ambientLoc = gl.getUniformLocation(this.prog, 'ambient');
        this.specularLoc = gl.getUniformLocation(this.prog, 'specular');
        this.blendFactorLoc = gl.getUniformLocation(this.prog, 'blendFactor');
    
        // Attribute locations
        this.vertPosLoc = gl.getAttribLocation(this.prog, 'pos');
        this.texCoordLoc = gl.getAttribLocation(this.prog, 'texCoord');
        this.normalLoc = gl.getAttribLocation(this.prog, 'normal');
    
        // Buffers
        this.vertbuffer = gl.createBuffer();
        this.texbuffer = gl.createBuffer();
        this.normalBuffer = gl.createBuffer();
    
        this.numTriangles = 0;
    }
    
	setMesh(vertPos, texCoords, normalCoords) {
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
		this.numTriangles = vertPos.length / 3;
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalCoords), gl.STATIC_DRAW);
	}

	draw(trans) {
        gl.useProgram(this.prog);
    
        gl.uniformMatrix4fv(this.mvpLoc, false, trans);
        gl.uniform3f(this.lightPosLoc, lightX, lightY, 1.0);
    
        const enableAttribute = (buffer, location, size, type) => {
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.enableVertexAttribArray(location);
            gl.vertexAttribPointer(location, size, type, false, 0, 0);
        };
    
        enableAttribute(this.vertbuffer, this.vertPosLoc, 3, gl.FLOAT); 
        enableAttribute(this.texbuffer, this.texCoordLoc, 2, gl.FLOAT); 
        enableAttribute(this.normalBuffer, this.normalLoc, 3, gl.FLOAT); 
    
        // Bind textures
        const bindTexture = (unit, texture) => {
            gl.activeTexture(gl[`TEXTURE${unit}`]);
            gl.bindTexture(gl.TEXTURE_2D, texture);
        };
    
        bindTexture(0, this.texture);
        bindTexture(1, this.texture2);
    
        // Update lighting position and draw
        updateLightPos();
        gl.drawArrays(gl.TRIANGLES, 0, this.numTriangles);
    }
    
	setTexture(img) {
		const texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGB,
			gl.RGB,
			gl.UNSIGNED_BYTE,
			img);
		if (isPowerOf2(img.width) && isPowerOf2(img.height)) {
			gl.generateMipmap(gl.TEXTURE_2D);
		} else {
            // no need for consol output innit? :)
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

		}
		gl.useProgram(this.prog); 
		this.texture = texture;
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		const sampler = gl.getUniformLocation(this.prog, 'tex');
		gl.uniform1i(sampler, 0);
	}

    //same as above just to handle second texture
	setTexture2(img) {
		const texture2 = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture2);
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGB,
			gl.RGB,
			gl.UNSIGNED_BYTE,
			img
		);
		if (isPowerOf2(img.width) && isPowerOf2(img.height)) {
			gl.generateMipmap(gl.TEXTURE_2D);
		} else {
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		}
		gl.useProgram(this.prog);
		this.texture2 = texture2;
		this.setBlendFactor(0.5); 
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, texture2);
		const sampler2 = gl.getUniformLocation(this.prog, 'tex2');
		gl.uniform1i(sampler2, 1);
	} 

	showTexture(show) {
		gl.useProgram(this.prog);
		gl.uniform1i(this.showTexLoc, show);
	}
    // if lighing is enabled by the user, we need to arrange basic lighting. 
	enableLighting(show) {
		gl.useProgram(this.prog);
        // ambient light range(0-1), specular range(0-100) mid values are set
		if (show){
			gl.uniform1i(this.enableLightingLoc, 1);
				this.setAmbientLight(0.50); 
				this.setSpecularLight(50.0); 
		}
		else{
			gl.uniform1i(this.enableLightingLoc, 0);
		}

	}
	setAmbientLight(ambient) {
		gl.useProgram(this.prog);
		gl.uniform1f(this.ambientLoc, ambient);

	}
	setSpecularLight(specular) {
		gl.useProgram(this.prog);
		gl.uniform1f(this.specularLoc, specular);
	}

    setBlendFactor(factor) {
		gl.useProgram(this.prog);
		gl.uniform1f(this.blendFactorLoc, factor);
	}
}
function isPowerOf2(value) {
	return (value & (value - 1)) == 0;
}
function normalize(v, dst) {
	dst = dst || new Float32Array(3);
	var length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
	// make sure we don't divide by 0.
	if (length > 0.00001) {
		dst[0] = v[0] / length;
		dst[1] = v[1] / length;
		dst[2] = v[2] / length;
	}
	return dst;
}
const meshVS = `
			attribute vec3 pos; 
			attribute vec2 texCoord; 
			attribute vec3 normal;

			uniform mat4 mvp; 

			varying vec2 v_texCoord; 
			varying vec3 v_normal; 

			void main()
			{
				v_texCoord = texCoord;
				v_normal = mat3(mvp)*normal; 

				gl_Position = mvp * vec4(pos,1);
			}`;

const meshFS = `
			precision mediump float;

			uniform bool showTex;
			uniform bool enableLighting;
			uniform sampler2D tex,tex2;
			uniform vec3 color; 
			uniform vec3 lightPos;
			uniform float ambient,specular,blendFactor;

			varying vec2 v_texCoord;
			varying vec3 v_normal;

			void main()
			{
				if(showTex && enableLighting){
					vec4 blendedTexture = mix(texture2D(tex, v_texCoord), texture2D(tex2, v_texCoord), blendFactor);

					vec3 lightColor = vec3(1.0,1.0,1.0),normal = normalize(v_normal),lightDir = normalize(-lightPos),viewDir = normalize(vec3(0.0, 0.0, -1.0));  
					//task 2:
					vec3 ambientLight = ambient * lightColor ;
					float light = max(dot(normal, lightDir), 0.0);  
					vec3 diffuseLight = light * lightColor ;

					//task3: 
					vec3 reflectDir = reflect(-lightDir,  normal); 
					float specValue = 0.0;
					if (light > 0.0) { 
						specValue = pow(max(dot(viewDir, reflectDir), 0.0), specular); 
					}
					vec3 specularLight = specValue *  lightColor ; 
					vec3 finalLighting = (ambientLight + diffuseLight + specularLight) * blendedTexture.rgb; 
					gl_FragColor = vec4(finalLighting, blendedTexture.a) ; 

				}
				else if(showTex){
                    vec4 blendedTexture = mix(texture2D(tex, v_texCoord), texture2D(tex2, v_texCoord), blendFactor);
					gl_FragColor = blendedTexture;
				}
				else{
					gl_FragColor =  vec4(1.0, 0, 0, 1.0);
				}
			}`;

var lightX = 1;
var lightY = 1;

const keys = {};
function updateLightPos() {
	const translationSpeed = 0.1; // 1 was so fast
	if (keys['ArrowUp']) lightY -= translationSpeed;
	if (keys['ArrowDown']) lightY += translationSpeed;
	if (keys['ArrowRight']) lightX -= translationSpeed;
	if (keys['ArrowLeft']) lightX += translationSpeed;
}
///////////////////////////////////////////////////////////////////////////////////