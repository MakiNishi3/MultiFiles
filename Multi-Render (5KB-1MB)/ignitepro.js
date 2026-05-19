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

Seriously.plugin('IgniteBrightnessContrast', {
title: 'Ignite Brightness Contrast',
inputs: {
source: { type: 'image' },
brightness: { type: 'number', min: -1, max: 1, defaultValue: 0 },
contrast: { type: 'number', min: -1, max: 1, defaultValue: 0 }
},
shader: function () {
return {
uniforms: {
source: null,
brightness: 0,
contrast: 0
},
fragment: [
'precision mediump float;',
'uniform sampler2D source;',
'uniform float brightness;',
'uniform float contrast;',
'varying vec2 vTexCoord;',
'void main() {',
'vec4 color = texture2D(source, vTexCoord);',
'color.rgb += brightness;',
'color.rgb = (color.rgb - 0.5) * (contrast + 1.0) + 0.5;',
'gl_FragColor = color;',
'}'
].join('\n')
};
}
});

Seriously.plugin('IgniteHueSaturation', {
title: 'Ignite Hue Saturation',
inputs: {
source: { type: 'image' },
hue: { type: 'number', min: -3.14, max: 3.14, defaultValue: 0 },
saturation: { type: 'number', min: -1, max: 1, defaultValue: 0 }
},
shader: function () {
return {
uniforms: {
source: null,
hue: 0,
saturation: 0
},
fragment: [
'precision mediump float;',
'uniform sampler2D source;',
'uniform float hue;',
'uniform float saturation;',
'varying vec2 vTexCoord;',
'vec3 rgb2hsv(vec3 c){',
'vec4 K = vec4(0., -1./3., 2./3., -1.);',
'vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));',
'vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));',
'float d = q.x - min(q.w, q.y);',
'float e = 1e-10;',
'return vec3(abs(q.z + (q.w - q.y) / (6. * d + e)), d / (q.x + e), q.x);',
'}',
'vec3 hsv2rgb(vec3 c){',
'vec4 K = vec4(1., 2./3., 1./3., 3.);',
'vec3 p = abs(fract(c.xxx + K.xyz) * 6. - K.www);',
'return c.z * mix(K.xxx, clamp(p - K.xxx, 0., 1.), c.y);',
'}',
'void main(){',
'vec4 col = texture2D(source, vTexCoord);',
'vec3 hsv = rgb2hsv(col.rgb);',
'hsv.x += hue;',
'hsv.y += saturation;',
'col.rgb = hsv2rgb(hsv);',
'gl_FragColor = col;',
'}'
].join('\n')
};
}
});

Seriously.plugin('IgniteZoomBlur', {
title: 'Ignite Zoom Blur',
inputs: {
source: { type: 'image' },
strength: { type: 'number', min: 0, max: 1, defaultValue: 0.3 },
centerX: { type: 'number', min: 0, max: 1, defaultValue: 0.5 },
centerY: { type: 'number', min: 0, max: 1, defaultValue: 0.5 }
},
shader: function () {
return {
uniforms: {
source: null,
strength: 0.3,
center: [0.5, 0.5]
},
fragment: [
'precision mediump float;',
'uniform sampler2D source;',
'uniform float strength;',
'uniform vec2 center;',
'varying vec2 vTexCoord;',
'void main(){',
'vec4 color = vec4(0.0);',
'float total = 0.0;',
'for(float i = 0.0; i < 20.0; i++){',
'float t = i / 20.0;',
'vec2 dir = vTexCoord - center;',
'color += texture2D(source, center + dir * (1.0 - t * strength));',
'total += 1.0;',
'}',
'gl_FragColor = color / total;',
'}'
].join('\n')
};
}
});

Seriously.plugin('IgniteGlow', {
title: 'Ignite Glow',
inputs: {
source: { type: 'image' },
intensity: { type: 'number', min: 0, max: 3, defaultValue: 1 },
radius: { type: 'number', min: 0, max: 10, defaultValue: 4 }
},
shader: function () {
return {
uniforms: {
source: null,
intensity: 1,
radius: 4
},
fragment: [
'precision mediump float;',
'uniform sampler2D source;',
'uniform float intensity;',
'uniform float radius;',
'varying vec2 vTexCoord;',
'void main(){',
'vec4 sum = vec4(0.0);',
'for(int x=-4;x<=4;x++){',
'for(int y=-4;y<=4;y++){',
'sum += texture2D(source, vTexCoord + vec2(float(x),float(y))*0.002*radius);',
'}',
'}',
'vec4 base = texture2D(source, vTexCoord);',
'gl_FragColor = base + (sum / 81.0) * intensity;',
'}'
].join('\n')
};
}
});

Seriously.plugin('IgniteVignette', {
title: 'Ignite Vignette',
inputs: {
source: { type: 'image' },
amount: { type: 'number', min: 0, max: 1, defaultValue: 0.5 }
},
shader: function () {
return {
uniforms: {
source: null,
amount: 0.5
},
fragment: [
'precision mediump float;',
'uniform sampler2D source;',
'uniform float amount;',
'varying vec2 vTexCoord;',
'void main(){',
'vec2 pos = vTexCoord - 0.5;',
'float len = length(pos);',
'vec4 color = texture2D(source, vTexCoord);',
'color.rgb *= smoothstep(0.8, amount * 0.799, len);',
'gl_FragColor = color;',
'}'
].join('\n')
};
}
});

Seriously.plugin('IgniteSharpen', {
title: 'Ignite Sharpen',
inputs: {
source: { type: 'image' },
strength: { type: 'number', min: 0, max: 2, defaultValue: 1 }
},
shader: function () {
return {
uniforms: {
source: null,
strength: 1
},
fragment: [
'precision mediump float;',
'uniform sampler2D source;',
'uniform float strength;',
'varying vec2 vTexCoord;',
'void main(){',
'vec2 texel = vec2(1.0/512.0);',
'vec4 col = texture2D(source, vTexCoord) * (1.0 + 4.0 * strength);',
'col -= texture2D(source, vTexCoord + texel * vec2(1,0)) * strength;',
'col -= texture2D(source, vTexCoord + texel * vec2(-1,0)) * strength;',
'col -= texture2D(source, vTexCoord + texel * vec2(0,1)) * strength;',
'col -= texture2D(source, vTexCoord + texel * vec2(0,-1)) * strength;',
'gl_FragColor = col;',
'}'
].join('\n')
};
}
});

})); 
