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

Seriously.plugin('Drawing/Edge-halftonecmyk', {
shader: function (inputs, shaderSource) {
shaderSource.fragment = '\
precision mediump float;\
varying vec2 vTexCoord;\
uniform sampler2D source;\
uniform float size;\
void main(void){\
vec4 color = texture2D(source, vTexCoord);\
float c = 1.0 - color.r;\
float m = 1.0 - color.g;\
float y = 1.0 - color.b;\
float k = min(c, min(m, y));\
c = (c - k) / (1.0 - k + 0.00001);\
m = (m - k) / (1.0 - k + 0.00001);\
y = (y - k) / (1.0 - k + 0.00001);\
float pattern = step(0.5, fract(vTexCoord.x * size) * fract(vTexCoord.y * size));\
gl_FragColor = vec4(c * pattern, m * pattern, y * pattern, 1.0);\
}';
return shaderSource;
},
inputs: {
source: { type: 'image' },
size: { type: 'number', defaultValue: 40, min: 1, max: 200 }
}
});

Seriously.plugin('Drawing/Edge-edgedetect', {
shader: function (inputs, shaderSource) {
shaderSource.fragment = '\
precision mediump float;\
varying vec2 vTexCoord;\
uniform sampler2D source;\
uniform float strength;\
void main(void){\
vec2 texel = vec2(1.0/512.0, 1.0/512.0);\
float gx = 0.0;\
float gy = 0.0;\
gx += -1.0 * texture2D(source, vTexCoord + texel * vec2(-1.0,-1.0)).r;\
gx += -2.0 * texture2D(source, vTexCoord + texel * vec2(-1.0, 0.0)).r;\
gx += -1.0 * texture2D(source, vTexCoord + texel * vec2(-1.0, 1.0)).r;\
gx += 1.0 * texture2D(source, vTexCoord + texel * vec2(1.0,-1.0)).r;\
gx += 2.0 * texture2D(source, vTexCoord + texel * vec2(1.0, 0.0)).r;\
gx += 1.0 * texture2D(source, vTexCoord + texel * vec2(1.0, 1.0)).r;\
gy += -1.0 * texture2D(source, vTexCoord + texel * vec2(-1.0,-1.0)).r;\
gy += -2.0 * texture2D(source, vTexCoord + texel * vec2(0.0,-1.0)).r;\
gy += -1.0 * texture2D(source, vTexCoord + texel * vec2(1.0,-1.0)).r;\
gy += 1.0 * texture2D(source, vTexCoord + texel * vec2(-1.0,1.0)).r;\
gy += 2.0 * texture2D(source, vTexCoord + texel * vec2(0.0,1.0)).r;\
gy += 1.0 * texture2D(source, vTexCoord + texel * vec2(1.0,1.0)).r;\
float g = length(vec2(gx, gy)) * strength;\
gl_FragColor = vec4(vec3(g), 1.0);\
}';
return shaderSource;
},
inputs: {
source: { type: 'image' },
strength: { type: 'number', defaultValue: 2, min: 0, max: 10 }
}
});

Seriously.plugin('Drawing/Edge-cartoon', {
shader: function (inputs, shaderSource) {
shaderSource.fragment = '\
precision mediump float;\
varying vec2 vTexCoord;\
uniform sampler2D source;\
uniform float levels;\
void main(void){\
vec4 color = texture2D(source, vTexCoord);\
color.rgb = floor(color.rgb * levels) / levels;\
gl_FragColor = color;\
}';
return shaderSource;
},
inputs: {
source: { type: 'image' },
levels: { type: 'number', defaultValue: 4, min: 2, max: 16 }
}
});

Seriously.plugin('Drawing/Edge-charcoal', {
shader: function (inputs, shaderSource) {
shaderSource.fragment = '\
precision mediump float;\
varying vec2 vTexCoord;\
uniform sampler2D source;\
uniform float intensity;\
void main(void){\
vec4 color = texture2D(source, vTexCoord);\
float gray = dot(color.rgb, vec3(0.3,0.59,0.11));\
float edge = step(0.5, gray);\
gl_FragColor = vec4(vec3(edge * intensity), 1.0);\
}';
return shaderSource;
},
inputs: {
source: { type: 'image' },
intensity: { type: 'number', defaultValue: 1, min: 0, max: 5 }
}
});

Seriously.plugin('Drawing/Edge-hexagonpixelate', {
shader: function (inputs, shaderSource) {
shaderSource.fragment = '\
precision mediump float;\
varying vec2 vTexCoord;\
uniform sampler2D source;\
uniform float scale;\
void main(void){\
vec2 uv = vTexCoord;\
uv = floor(uv * scale) / scale;\
gl_FragColor = texture2D(source, uv);\
}';
return shaderSource;
},
inputs: {
source: { type: 'image' },
scale: { type: 'number', defaultValue: 40, min: 1, max: 200 }
}
});

Seriously.plugin('Drawing/Edge-outlineedges', {
shader: function (inputs, shaderSource) {
shaderSource.fragment = '\
precision mediump float;\
varying vec2 vTexCoord;\
uniform sampler2D source;\
uniform float threshold;\
void main(void){\
vec4 c = texture2D(source, vTexCoord);\
float edge = step(threshold, length(c.rgb));\
gl_FragColor = vec4(vec3(edge), 1.0);\
}';
return shaderSource;
},
inputs: {
source: { type: 'image' },
threshold: { type: 'number', defaultValue: 0.5, min: 0, max: 1 }
}
});

Seriously.plugin('Drawing/Edge-glowscan', {
shader: function (inputs, shaderSource) {
shaderSource.fragment = '\
precision mediump float;\
varying vec2 vTexCoord;\
uniform sampler2D source;\
uniform float glow;\
void main(void){\
vec4 color = texture2D(source, vTexCoord);\
float g = sin(vTexCoord.y * 200.0) * glow;\
gl_FragColor = vec4(color.rgb + g, 1.0);\
}';
return shaderSource;
},
inputs: {
source: { type: 'image' },
glow: { type: 'number', defaultValue: 0.2, min: 0, max: 2 }
}
});

Seriously.plugin('Drawing/Edge-outline', {
shader: function (inputs, shaderSource) {
shaderSource.fragment = '\
precision mediump float;\
varying vec2 vTexCoord;\
uniform sampler2D source;\
uniform float width;\
void main(void){\
vec2 texel = vec2(width/512.0);\
float sum = 0.0;\
sum += texture2D(source, vTexCoord + vec2(-texel.x, 0.0)).r;\
sum += texture2D(source, vTexCoord + vec2(texel.x, 0.0)).r;\
sum += texture2D(source, vTexCoord + vec2(0.0, -texel.y)).r;\
sum += texture2D(source, vTexCoord + vec2(0.0, texel.y)).r;\
float edge = step(0.2, sum);\
gl_FragColor = vec4(vec3(edge), 1.0);\
}';
return shaderSource;
},
inputs: {
source: { type: 'image' },
width: { type: 'number', defaultValue: 2, min: 1, max: 10 }
}
});

})); 
