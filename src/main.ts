import "./style.css";
import { Slider } from "./slider";

const vertexShaderSourceCode = `#version 300 es
precision mediump float;

in vec2 vertexPosition;
in vec4 a_color;

uniform vec2 offset;

out vec4 color;

void main () {
  vec2 position = vertexPosition + offset;
  gl_Position = vec4(position, 0.0, 1.0);
  color = a_color;
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
    0.0, 0.5,
    -0.5, -0.5,
    0.5, -0.5
  ];
  const verticesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  const colors = [
    255, 0, 0,
    0, 255, 0,
    0, 0, 255
  ];
  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
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

  const offsetLocation = gl.getUniformLocation(program, "offset");
  if (!offsetLocation) {
    throw new Error("offset uniform not found");
  }

  const offsetXSlider = new Slider("Offset X", 0);
  const offsetYSlider = new Slider("Offset Y", 0);

  const setOffset = () => {
    gl.uniform2fv(offsetLocation, [ offsetXSlider.value, offsetYSlider.value ]);
  }

  offsetXSlider.bind(() => {
    setOffset();
    draw();
  });
  offsetYSlider.bind(() => {
    setOffset();
    draw();
  });

  const colorAttributeLocation = gl.getAttribLocation(program, "a_color");

  if (colorAttributeLocation < 0) {
    throw new Error("Color attribute not found");
  }

  const viewportWidthSlider = new Slider("Viewport width", canvas.clientWidth, 100, canvas.clientWidth);
  const viewportHeightSlider = new Slider("Viewport height", canvas.clientHeight, 100, canvas.clientHeight);

  const draw = () => {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.viewport(0, 0, viewportWidthSlider.value, viewportHeightSlider.value);

    gl.useProgram(program);
    gl.enableVertexAttribArray(vertexPositionAttribLocation);
    gl.enableVertexAttribArray(colorAttributeLocation);

    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.vertexAttribPointer(
      vertexPositionAttribLocation,
      2,
      gl.FLOAT,
      false,
      0,
      0
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(
      colorAttributeLocation,
      3,
      gl.UNSIGNED_BYTE,
      true,
      0,
      0
    );

    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2);
  }

  viewportWidthSlider.bind(draw);
  viewportHeightSlider.bind(draw);

  draw();
}

main();