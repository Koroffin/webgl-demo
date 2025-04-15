import "./style.css";
import { Slider } from "./slider";
import { glMatrix, mat4, vec3 } from "gl-matrix";

const vertexShaderSourceCode = `#version 300 es
precision mediump float;

in vec3 vertexPosition;
in vec3 a_color;

uniform mat4 matWorld;
uniform mat4 matViewProj;

out vec4 color;

void main () {
  gl_Position = matViewProj * matWorld * vec4(vertexPosition, 1.0);
  color = vec4(a_color, 1.0);
}`;

const fragmentShaderSourceCode = `#version 300 es
precision mediump float;

in vec4 color;
out vec4 frag_color;

void main () {
  frag_color = color;
}`;


const main = () => {
  const canvas = document.getElementById("mainCanvas");

  if (!canvas) {
    throw new Error("Canvas not found");
  }

  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error("mainCanvas should be a canvas");
  }

  const gl = canvas.getContext("webgl2");

  if (!gl) {
    throw new Error("WebGL2 is not supported");
  }

  const vertices = [
    // Front face
    -1.0, -1.0, 1.0,
    1.0, -1.0, 1.0,  
    1.0, 1.0, 1.0, 
    -1.0, 1.0, 1.0,
  
    // Back face
    -1.0, -1.0, -1.0,
    -1.0, 1.0, -1.0,
    1.0, 1.0, -1.0,
    1.0, -1.0, -1.0,
  
    // Top face
    -1.0, 1.0, -1.0,
    -1.0, 1.0, 1.0,
    1.0, 1.0, 1.0,
    1.0, 1.0, -1.0,
  
    // Bottom face
    -1.0, -1.0, -1.0,
    1.0, -1.0, -1.0,
    1.0, -1.0, 1.0,
    -1.0, -1.0, 1.0,
  
    // Right face
    1.0, -1.0, -1.0,
    1.0, 1.0, -1.0,
    1.0, 1.0, 1.0,
    1.0, -1.0, 1.0,
  
    // Left face
    -1.0, -1.0, -1.0,
    -1.0, -1.0, 1.0,
    -1.0, 1.0, 1.0,
    -1.0, 1.0, -1.0,
  ];
  const verticesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  const indicies = [
    0, 1, 2,
    0, 2, 3,
    4, 5, 6,
    4, 6, 7,
    8, 9, 10,
    8, 10, 11,
    12, 13, 14,
    12, 14, 15,
    16, 17, 18,
    16, 18, 19,
    20, 21, 22,
    20, 22, 23,
  ];
  const indiciesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indiciesBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indicies), gl.STATIC_DRAW);

  const colors = [
    100, 0, 100,
    100, 0, 100,
    100, 0, 100,
    100, 0, 100,
    
    255, 0, 0,
    255, 0, 0,
    255, 0, 0,
    255, 0, 0,

    255, 255, 0,
    255, 255, 0,
    255, 255, 0,
    255, 255, 0,

    255, 255, 255,
    255, 255, 255,
    255, 255, 255,
    255, 255, 255,

    0, 255, 0,
    0, 255, 0,
    0, 255, 0,
    0, 255, 0,

    0, 255, 255,
    0, 255, 255,
    0, 255, 255,
    0, 255, 255,
  ];
  const colorsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(colors), gl.STATIC_DRAW);

  const vertexShader = gl.createShader(gl.VERTEX_SHADER);

  if (!vertexShader) {
    throw new Error("Cannot create vertex shader");
  }

  gl.shaderSource(vertexShader, vertexShaderSourceCode);
  gl.compileShader(vertexShader);

  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    throw new Error(`Vertex shader compile error: ${gl.getShaderInfoLog(vertexShader)}`);
  }

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

  if (!fragmentShader) {
    throw new Error("Cannot create fragment shader");
  }

  gl.shaderSource(fragmentShader, fragmentShaderSourceCode);
  gl.compileShader(fragmentShader);

  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    throw new Error(`Fragment shader compile error: ${gl.getShaderInfoLog(fragmentShader)}`);
  }

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`Cannot link the program: ${gl.getProgramInfoLog(program)}`);
  }

  const vertexPositionAttribLocation = gl.getAttribLocation(program, "vertexPosition");
  if (vertexPositionAttribLocation < 0) {
    throw new Error("vertexPosition attribute not found");
  }

  const colorAttributeLocation = gl.getAttribLocation(program, "a_color");

  if (colorAttributeLocation < 0) {
    throw new Error("Color attribute not found");
  }

  const matViewProjUniformLocation = gl.getUniformLocation(program, "matViewProj");

  if (!matViewProjUniformLocation) {
    throw new Error("matViewProj uniform not found");
  }

  const matWorldUniformLocation = gl.getUniformLocation(program, "matWorld");

  if (!matWorldUniformLocation) {
    throw new Error("matWorld uniform not found");
  }

  const viewportWidthSlider = new Slider("Viewport width", canvas.clientWidth, 100, canvas.clientWidth);
  const viewportHeightSlider = new Slider("Viewport height", canvas.clientHeight, 100, canvas.clientHeight);

  const draw = () => {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    gl.viewport(0, 0, viewportWidthSlider.value, viewportHeightSlider.value);

    gl.useProgram(program);
    gl.enableVertexAttribArray(vertexPositionAttribLocation);
    gl.enableVertexAttribArray(colorAttributeLocation);

    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.vertexAttribPointer(
      vertexPositionAttribLocation,
      3,
      gl.FLOAT,
      false,
      0,
      0
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
    gl.vertexAttribPointer(
      colorAttributeLocation,
      3,
      gl.UNSIGNED_BYTE,
      true,
      0,
      0
    );

    const matView = mat4.create();
    const matProj = mat4.create();
    const matWorld = mat4.create();
    const matViewProj = mat4.create();

    mat4.lookAt(
      matView,
      vec3.fromValues(5, 5, 5),
      vec3.fromValues(0, 0, 0),
      vec3.fromValues(0, 1, 0)
    );
    mat4.perspective(
      matProj,
      glMatrix.toRadian(80),
      canvas.width / canvas.height,
      0.1, 100
    );

    mat4.multiply(matViewProj, matProj, matView);

    gl.uniformMatrix4fv(matViewProjUniformLocation, false, matViewProj);
    gl.uniformMatrix4fv(matWorldUniformLocation, false, matWorld);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indiciesBuffer);

    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
  }

  viewportWidthSlider.bind(draw);
  viewportHeightSlider.bind(draw);

  draw();
}

main();