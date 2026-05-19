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

function clamp(v, min, max) {
return Math.min(max, Math.max(min, v));
}

function createShader(gl, type, src) {
const shader = gl.createShader(type);
gl.shaderSource(shader, src);
gl.compileShader(shader);
return shader;
}

function createProgram(gl, vsrc, fsrc) {
const program = gl.createProgram();
const vs = createShader(gl, gl.VERTEX_SHADER, vsrc);
const fs = createShader(gl, gl.FRAGMENT_SHADER, fsrc);
gl.attachShader(program, vs);
gl.attachShader(program, fs);
gl.linkProgram(program);
return program;
}

function baseVertexShader() {
return `
attribute vec2 position;
varying vec2 vTexCoord;
void main() {
vTexCoord = (position + 1.0) * 0.5;
gl_Position = vec4(position, 0.0, 1.0);
}
`;
}

function baseFragmentHeader() {
return `
precision mediump float;
varying vec2 vTexCoord;
uniform sampler2D source;
`;
}

function brightnessContrastFragment() {
return baseFragmentHeader() + `
uniform float brightness;
uniform float contrast;

void main() {
vec4 color = texture2D(source, vTexCoord);
color.rgb += brightness;
if (contrast > 0.0) {
color.rgb = (color.rgb - 0.5) / (1.0 - contrast) + 0.5;
} else {
color.rgb = (color.rgb - 0.5) * (1.0 + contrast) + 0.5;
}
gl_FragColor = color;
}
`;
}

function hueShiftFragment() {
return baseFragmentHeader() + `
uniform float hue;

vec3 rgb2hsv(vec3 c) {
vec4 K = vec4(0.0, -1.0/3.0, 2.0/3.0, -1.0);
vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
float d = q.x - min(q.w, q.y);
float e = 1.0e-10;
return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c) {
vec3 p = abs(fract(c.xxx + vec3(0.0, 2.0/3.0, 1.0/3.0)) * 6.0 - 3.0);
return c.z * mix(vec3(1.0), clamp(p - 1.0, 0.0, 1.0), c.y);
}

void main() {
vec4 color = texture2D(source, vTexCoord);
vec3 hsv = rgb2hsv(color.rgb);
hsv.x += hue;
color.rgb = hsv2rgb(hsv);
gl_FragColor = color;
}
`;
}

function invertFragment() {
return baseFragmentHeader() + `
void main() {
vec4 color = texture2D(source, vTexCoord);
gl_FragColor = vec4(1.0 - color.rgb, color.a);
}
`;
}

function saturationFragment() {
return baseFragmentHeader() + `
uniform float saturation;

vec3 rgb2hsv(vec3 c) {
vec4 K = vec4(0.0, -1.0/3.0, 2.0/3.0, -1.0);
vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
float d = q.x - min(q.w, q.y);
float e = 1.0e-10;
return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c) {
vec3 p = abs(fract(c.xxx + vec3(0.0, 2.0/3.0, 1.0/3.0)) * 6.0 - 3.0);
return c.z * mix(vec3(1.0), clamp(p - 1.0, 0.0, 1.0), c.y);
}

void main() {
vec4 color = texture2D(source, vTexCoord);
vec3 hsv = rgb2hsv(color.rgb);
hsv.y *= saturation;
color.rgb = hsv2rgb(hsv);
gl_FragColor = color;
}
`;
}

function registerPlugin(name, uniforms, fragment) {
Seriously.plugin(name, {
shader: true,
uniforms: uniforms,
create: function (options) {
return {
draw: function (gl, input, target, uniformsValues) {
const program = createProgram(gl, baseVertexShader(), fragment);
gl.useProgram(program);
}
};
}
});
}

registerPlugin('Other - brightnessandcontrast', {
brightness: 0,
contrast: 0
}, brightnessContrastFragment());

registerPlugin('Other - hueshift', {
hue: 0
}, hueShiftFragment());

registerPlugin('Other - invert', {}, invertFragment());

registerPlugin('Other - saturationandvibrance', {
saturation: 1
}, saturationFragment());

registerPlugin('Other - channelremaphsv', {
hue: 0,
saturation: 1,
value: 1
}, baseFragmentHeader() + `
uniform float hue;
uniform float saturation;
uniform float value;

void main() {
vec4 color = texture2D(source, vTexCoord);
color.rgb *= value;
gl_FragColor = color;
}
`);

registerPlugin('Other - channelremaprgb', {
r: 1,
g: 1,
b: 1
}, baseFragmentHeader() + `
uniform float r;
uniform float g;
uniform float b;

void main() {
vec4 color = texture2D(source, vTexCoord);
color.r *= r;
color.g *= g;
color.b *= b;
gl_FragColor = color;
}
`);

registerPlugin('Other - copybackground', {}, baseFragmentHeader() + `
void main() {
vec4 color = texture2D(source, vTexCoord);
gl_FragColor = color;
}
`);

}));
