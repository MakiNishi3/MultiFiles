/* global define, require */
(function (root, factory) {
'use strict';

if (typeof define === 'function' && define.amd) {
  define(['seriously'], factory);
} else if (typeof exports === 'object') {
  factory(require('seriously'));
} else {
  if (!root.Seriously) {
    root.Seriously = { plugin: function (name, opt) { this[name] = opt; } };
  }
  factory(root.Seriously);
}
}(window, function (Seriously) {
'use strict';

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

function createProgram(gl, vertexSrc, fragmentSrc) {
  const vs = createShader(gl, gl.VERTEX_SHADER, vertexSrc);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentSrc);
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  return program;
}

const vertexShader = `
attribute vec2 position;
varying vec2 vTexCoord;
void main() {
  vTexCoord = (position + 1.0) * 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

function baseFragment(mainBody) {
  return `
precision mediump float;
varying vec2 vTexCoord;
uniform float time;
float rand(vec2 co){
  return fract(sin(dot(co.xy, vec2(12.9898,78.233))) * 43758.5453);
}
${mainBody}
void main() {
  vec2 uv = vTexCoord;
  gl_FragColor = effect(uv);
}
`;
}

Seriously.plugin('Procedural-noise', {
  shader: function (gl) {
    const frag = baseFragment(`
    float noise(vec2 p){
      return rand(p);
    }
    vec4 effect(vec2 uv){
      float n = noise(uv * 10.0 + time);
      return vec4(vec3(n),1.0);
    }`);
    return createProgram(gl, vertexShader, frag);
  },
  draw: function (shader, uniforms) {
    shader.uniforms.time = uniforms.time || 0;
  }
});

Seriously.plugin('Procedural-blocknoise', {
  shader: function (gl) {
    const frag = baseFragment(`
    float block(vec2 uv){
      vec2 gv = floor(uv * 20.0);
      return rand(gv);
    }
    vec4 effect(vec2 uv){
      float b = block(uv);
      return vec4(vec3(b),1.0);
    }`);
    return createProgram(gl, vertexShader, frag);
  }
});

Seriously.plugin('Procedural-clouds', {
  shader: function (gl) {
    const frag = baseFragment(`
    float cloud(vec2 uv){
      float n = 0.0;
      n += rand(uv * 1.0);
      n += rand(uv * 2.0) * 0.5;
      n += rand(uv * 4.0) * 0.25;
      return n;
    }
    vec4 effect(vec2 uv){
      float c = cloud(uv + time * 0.05);
      return vec4(vec3(c),1.0);
    }`);
    return createProgram(gl, vertexShader, frag);
  }
});

Seriously.plugin('Procedural-voronoicells', {
  shader: function (gl) {
    const frag = baseFragment(`
    vec2 random2(vec2 p){
      return vec2(rand(p), rand(p + 1.0));
    }
    vec4 effect(vec2 uv){
      vec2 i_uv = floor(uv * 10.0);
      vec2 f_uv = fract(uv * 10.0);
      float minDist = 1.0;
      for(int y=-1;y<=1;y++){
        for(int x=-1;x<=1;x++){
          vec2 neighbor = vec2(float(x),float(y));
          vec2 point = random2(i_uv + neighbor);
          vec2 diff = neighbor + point - f_uv;
          float dist = length(diff);
          minDist = min(minDist, dist);
        }
      }
      return vec4(vec3(minDist),1.0);
    }`);
    return createProgram(gl, vertexShader, frag);
  }
});

Seriously.plugin('Procedural-plasma', {
  shader: function (gl) {
    const frag = baseFragment(`
    vec4 effect(vec2 uv){
      float v = sin(uv.x * 10.0 + time) +
                sin(uv.y * 10.0 + time) +
                sin((uv.x+uv.y)*10.0);
      v = v * 0.33 + 0.5;
      return vec4(vec3(v),1.0);
    }`);
    return createProgram(gl, vertexShader, frag);
  }
});

Seriously.plugin('Procedural-chromaspiraltexture', {
  shader: function (gl) {
    const frag = baseFragment(`
    vec4 effect(vec2 uv){
      vec2 center = uv - 0.5;
      float angle = atan(center.y, center.x);
      float radius = length(center);
      float spiral = sin(10.0 * radius + angle * 5.0 + time);
      float r = 0.5 + 0.5 * sin(spiral);
      float g = 0.5 + 0.5 * sin(spiral + 2.0);
      float b = 0.5 + 0.5 * sin(spiral + 4.0);
      return vec4(r,g,b,1.0);
    }`);
    return createProgram(gl, vertexShader, frag);
  }
});

})); 
