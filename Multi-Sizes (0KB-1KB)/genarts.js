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

Seriously.plugin('S_genarts_aurora', {
shader: function () {
return [
'precision mediump float;',
'varying vec2 vTexCoord;',
'uniform sampler2D source;',
'uniform float intensity;',
'uniform float speed;',
'uniform float spread;',
'void main(void){',
'vec2 uv = vTexCoord;',
'float wave = sin((uv.y + speed) * 20.0) * spread;',
'vec4 color = texture2D(source, uv + vec2(wave,0.0));',
'gl_FragColor = color * intensity;',
'}'
].join('\n');
},
inPlace: true,
inputs: {
source: { type: 'image' },
intensity: { type: 'number', min: 0, max: 5, defaultValue: 1 },
speed: { type: 'number', min: -10, max: 10, defaultValue: 0.5 },
spread: { type: 'number', min: 0, max: 1, defaultValue: 0.2 }
}
});

Seriously.plugin('S_genarts_blur', {
shader: function () {
return [
'precision mediump float;',
'varying vec2 vTexCoord;',
'uniform sampler2D source;',
'uniform float radius;',
'void main(void){',
'vec4 sum = vec4(0.0);',
'sum += texture2D(source, vTexCoord + vec2(-radius, -radius));',
'sum += texture2D(source, vTexCoord + vec2( radius, -radius));',
'sum += texture2D(source, vTexCoord + vec2(-radius,  radius));',
'sum += texture2D(source, vTexCoord + vec2( radius,  radius));',
'gl_FragColor = sum * 0.25;',
'}'
].join('\n');
},
inPlace: true,
inputs: {
source: { type: 'image' },
radius: { type: 'number', min: 0, max: 0.02, defaultValue: 0.005 }
}
});

Seriously.plugin('S_genarts_glow', {
shader: function () {
return [
'precision mediump float;',
'varying vec2 vTexCoord;',
'uniform sampler2D source;',
'uniform float strength;',
'void main(void){',
'vec4 color = texture2D(source, vTexCoord);',
'vec4 glow = color * strength;',
'gl_FragColor = color + glow;',
'}'
].join('\n');
},
inPlace: true,
inputs: {
source: { type: 'image' },
strength: { type: 'number', min: 0, max: 3, defaultValue: 1 }
}
});

Seriously.plugin('S_genarts_distort', {
shader: function () {
return [
'precision mediump float;',
'varying vec2 vTexCoord;',
'uniform sampler2D source;',
'uniform float amount;',
'void main(void){',
'vec2 uv = vTexCoord;',
'uv.x += sin(uv.y * 10.0) * amount;',
'uv.y += cos(uv.x * 10.0) * amount;',
'gl_FragColor = texture2D(source, uv);',
'}'
].join('\n');
},
inPlace: true,
inputs: {
source: { type: 'image' },
amount: { type: 'number', min: 0, max: 0.1, defaultValue: 0.02 }
}
});

Seriously.plugin('S_genarts_sharpen', {
shader: function () {
return [
'precision mediump float;',
'varying vec2 vTexCoord;',
'uniform sampler2D source;',
'uniform float strength;',
'void main(void){',
'vec2 offset = vec2(0.001);',
'vec4 color = texture2D(source, vTexCoord) * (1.0 + 4.0 * strength);',
'color -= texture2D(source, vTexCoord + vec2(offset.x,0.0)) * strength;',
'color -= texture2D(source, vTexCoord - vec2(offset.x,0.0)) * strength;',
'color -= texture2D(source, vTexCoord + vec2(0.0,offset.y)) * strength;',
'color -= texture2D(source, vTexCoord - vec2(0.0,offset.y)) * strength;',
'gl_FragColor = color;',
'}'
].join('\n');
},
inPlace: true,
inputs: {
source: { type: 'image' },
strength: { type: 'number', min: 0, max: 2, defaultValue: 0.5 }
}
});

Seriously.plugin('S_genarts_colorcorrect', {
shader: function () {
return [
'precision mediump float;',
'varying vec2 vTexCoord;',
'uniform sampler2D source;',
'uniform float brightness;',
'uniform float contrast;',
'void main(void){',
'vec4 color = texture2D(source, vTexCoord);',
'color.rgb += brightness;',
'color.rgb = (color.rgb - 0.5) * contrast + 0.5;',
'gl_FragColor = color;',
'}'
].join('\n');
},
inPlace: true,
inputs: {
source: { type: 'image' },
brightness: { type: 'number', min: -1, max: 1, defaultValue: 0 },
contrast: { type: 'number', min: 0, max: 3, defaultValue: 1 }
}
});

Seriously.plugin('S_genarts_zebrafycolor', {
shader: function () {
return [
'precision mediump float;',
'varying vec2 vTexCoord;',
'uniform sampler2D source;',
'uniform float frequency;',
'void main(void){',
'vec4 color = texture2D(source, vTexCoord);',
'float zebra = step(0.5, fract(color.r * frequency));',
'gl_FragColor = vec4(vec3(zebra), color.a);',
'}'
].join('\n');
},
inPlace: true,
inputs: {
source: { type: 'image' },
frequency: { type: 'number', min: 1, max: 50, defaultValue: 10 }
}
});

}));
