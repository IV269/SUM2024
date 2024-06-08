/* FILE NAME: render.js
 * PROGRAMMER: IV2
 * DATE: 08.06.2024
 * PURPOSE: rendering module.
 */

import { Timer } from "./lib.js";

class Render {
  constructor(canvas) {
    this.canvas = canvas;

    this.gl = canvas.getContext("webgl2");
    gl.clearColor(0.8, 0.37, 0.42, 1);

    this.gl.enable(this.gl.DEPTH_TEST);

    let rect = canvas.getBoundingClientRect();
    this.height = rect.bottom - rect.top + 1;
    this.width = rect.right - rect.left + 1;

    let vs_txt = `#version 300 es
    precision highp float;
    in vec3 InPosition;
    in vec3 InNormal;
        
    out vec3 DrawPos;
    out vec3 DrawNormal;

    uniform float Time;
    uniform mat4 MatrProj;
    uniform mat4 MatrW;
    
    void main( void )
    {
        gl_Position = MatrProj * vec4(InPosition, 1.0);
        DrawPos = vec3(MatrW * vec4(InPosition.xyz, 1.0));
        DrawNormal = mat3(transpose(inverse(MatrW))) * InNormal;
    }
    `;

    let fs_txt = `#version 300 es
    precision highp float;
    
    out vec4 OutColor;
    
    in vec3 DrawPos;
    in vec3 DrawNormal;

    uniform float Time;

    void main( void )
    {
        vec3 L = normalize(vec3(0.1, 0.4, 1.0));
        vec3 N = normalize(DrawNormal);
        
        N = faceforward(N, normalize(DrawPos), N);
        
        float k = dot(L, normalize(N));

        OutColor = vec4(k * vec3(0.2, 0.9, 0.3), 1.0);
    }
    `;

    let vs = this.loadShader(this.gl.VERTEX_SHADER, vs_txt),
      fs = this.loadShader(this.gl.FRAGMENT_SHADER, fs_txt),
      prg = this.gl.createProgram();

    this.gl.attachShader(prg, vs);
    this.gl.attachShader(prg, fs);
    this.gl.linkProgram(prg);

    if (!gl.getProgramParameter(prg, gl.LINK_STATUS)) {
      let buf = gl.getProgramInfoLog(prg);
      console.log("Shader program link fail: " + buf);
    }
    this.prg = prg;

    this.timeLoc = this.gl.getUniformLocation(this.prg, "Time");
    this.posLoc = this.gl.getAttribLocation(this.prg, "InPosition");
    this.normLoc = this.gl.getAttribLocation(this.prg, "InNormal");
    this.matrProjLoc = this.gl.getUniformLocation(this.prg, "MatrProj");
    this.matrWLoc = this.gl.getUniformLocation(this.prg, "MatrW");

    this.Timer = new Timer();
    this.gl.useProgram(this.prg);
  } // End of 'constructor' function

  loadShader(type, source) {
    let shader = this.gl.createShader(type);

    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      let buf = this.gl.getShaderInfoLog(shader);
      console.log("Shader compile fail: " + buf);
    }
    return shader;
  } // End of 'loadShader' function

  render() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.gl.clear(this.gl.DEPTH_BUFFER_BIT);

    if (this.timeLoc != -1) {
      const date = new Date();
      this.Timer.response();

      let t = this.Timer.localTime;
      this.gl.uniform1f(this.timeLoc, t);
    }
  } // End of 'render' function
}

export function initGL() {
  canvas = document.getElementById("tetrahedron");
  gl = canvas.getContext("webgl2");
  let prg = gl.createProgram();

  gl.linkProgram(prg);

  gl.clearColor(0.8, 0.37, 0.42, 1);
  //gl.clearColor(0.3, 0.47, 0.8, 1);
  //timeLoc = gl.getUniformLocation(prg, "Time");
  //gl.useProgram(prg);
} // End of 'initGL' function

export function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);

  /*
  if (timeLoc != -1) {
    const date = new Date();
    let t =
      date.getMinutes() * 60 +
      date.getSeconds() +
      date.getMilliseconds() / 1000;

    gl.uniform1f(timeLoc, t);
  }
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  */
} // End of 'render' function

/* END OF 'render.js' FILE */
