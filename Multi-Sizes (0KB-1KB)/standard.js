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

Seriously.plugin('VEGASAddNoise', {
title: 'VEGAS Add Noise',
inPlace: true,
inputs: {
amount: { type: 'number', min: 0, max: 1, defaultValue: 0.2 },
size: { type: 'number', min: 0, max: 10, defaultValue: 1 },
color: { type: 'number', min: 0, max: 1, defaultValue: 0.5 }
},
shader: function () {
return {
fragment: [
'precision mediump float;',
'varying vec2 vTexCoord;',
'uniform sampler2D source;',
'uniform float amount;',
'uniform float size;',
'uniform float color;',
'float rand(vec2 co){',
'return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);',
'}',
'void main(void){',
'vec4 tex = texture2D(source, vTexCoord);',
'float noise = rand(vTexCoord * size);',
'vec3 n = mix(vec3(noise), vec3(rand(vTexCoord*2.0),rand(vTexCoord*3.0),rand(vTexCoord*4.0)), color);',
'gl_FragColor = vec4(tex.rgb + n * amount, tex.a);',
'}'
].join('\n')
};
}
});

Seriously.plugin('VEGASBlur', {
title: 'VEGAS Blur',
inPlace: true,
inputs: {
radius: { type: 'number', min: 0, max: 20, defaultValue: 5 }
},
shader: function () {
return {
fragment: [
'precision mediump float;',
'varying vec2 vTexCoord;',
'uniform sampler2D source;',
'uniform float radius;',
'void main(void){',
'vec4 sum = vec4(0.0);',
'for (float x=-4.0;x<=4.0;x++){',
'for (float y=-4.0;y<=4.0;y++){',
'sum += texture2D(source, vTexCoord + vec2(x,y)*radius/512.0);',
'}',
'}',
'gl_FragColor = sum/81.0;',
'}'
].join('\n')
};
}
});

Seriously.plugin('VEGASColorCorrect', {
title: 'VEGAS Color Correct',
inPlace: true,
inputs: {
brightness: { type: 'number', min: -1, max: 1, defaultValue: 0 },
contrast: { type: 'number', min: 0, max: 3, defaultValue: 1 },
saturation: { type: 'number', min: 0, max: 3, defaultValue: 1 }
},
shader: function () {
return {
fragment: [
'precision mediump float;',
'varying vec2 vTexCoord;',
'uniform sampler2D source;',
'uniform float brightness;',
'uniform float contrast;',
'uniform float saturation;',
'void main(void){',
'vec4 col = texture2D(source, vTexCoord);',
'col.rgb += brightness;',
'col.rgb = (col.rgb - 0.5) * contrast + 0.5;',
'float luma = dot(col.rgb, vec3(0.299,0.587,0.114));',
'col.rgb = mix(vec3(luma), col.rgb, saturation);',
'gl_FragColor = col;',
'}'
].join('\n')
};
}
});

Seriously.plugin('VEGASGlow', {
title: 'VEGAS Glow',
inPlace: true,
inputs: {
intensity: { type: 'number', min: 0, max: 5, defaultValue: 1 },
threshold: { type: 'number', min: 0, max: 1, defaultValue: 0.7 }
},
shader: function () {
return {
fragment: [
'precision mediump float;',
'varying vec2 vTexCoord;',
'uniform sampler2D source;',
'uniform float intensity;',
'uniform float threshold;',
'void main(void){',
'vec4 col = texture2D(source, vTexCoord);',
'float bright = max(max(col.r,col.g),col.b);',
'float glow = smoothstep(threshold,1.0,bright)*intensity;',
'gl_FragColor = vec4(col.rgb + glow, col.a);',
'}'
].join('\n')
};
}
});

Seriously.plugin('VEGASSharpen', {
title: 'VEGAS Sharpen',
inPlace: true,
inputs: {
amount: { type: 'number', min: 0, max: 5, defaultValue: 1 }
},
shader: function () {
return {
fragment: [
'precision mediump float;',
'varying vec2 vTexCoord;',
'uniform sampler2D source;',
'uniform float amount;',
'void main(void){',
'vec2 off = vec2(1.0/512.0);',
'vec4 col = texture2D(source, vTexCoord);',
'vec4 blur = (',
'texture2D(source, vTexCoord + off) +',
'texture2D(source, vTexCoord - off) +',
'texture2D(source, vTexCoord + vec2(off.x,-off.y)) +',
'texture2D(source, vTexCoord + vec2(-off.x,off.y))',
')/4.0;',
'gl_FragColor = vec4(col.rgb + (col.rgb - blur.rgb)*amount, col.a);',
'}'
].join('\n')
};
}
});

Seriously.plugin('VEGASWave', {
title: 'VEGAS Wave',
inPlace: true,
inputs: {
amplitude: { type: 'number', min: 0, max: 0.1, defaultValue: 0.02 },
frequency: { type: 'number', min: 0, max: 50, defaultValue: 10 },
time: { type: 'number', min: 0, max: 100, defaultValue: 0 }
},
shader: function () {
return {
fragment: [
'precision mediump float;',
'varying vec2 vTexCoord;',
'uniform sampler2D source;',
'uniform float amplitude;',
'uniform float frequency;',
'uniform float time;',
'void main(void){',
'vec2 uv = vTexCoord;',
'uv.y += sin(uv.x * frequency + time) * amplitude;',
'gl_FragColor = texture2D(source, uv);',
'}'
].join('\n')
};
}
});

})); 
