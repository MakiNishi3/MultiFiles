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

Seriously.plugin('Blur - UnsharpMask', {
	shader: function () {
		return [
			'precision mediump float;',
			'varying vec2 vTexCoord;',
			'uniform sampler2D source;',
			'uniform float strength;',
			'void main(void) {',
			'vec4 color = texture2D(source, vTexCoord);',
			'vec4 blur = (texture2D(source, vTexCoord + vec2(0.001)) + texture2D(source, vTexCoord - vec2(0.001))) * 0.5;',
			'gl_FragColor = mix(color, color + (color - blur), strength);',
			'}'
		].join('\n');
	},
	inputs: {
		source: { type: 'image' },
		strength: { type: 'number', min: 0, max: 5, defaultValue: 1 }
	}
});

Seriously.plugin('Blur - BoxBlur', {
	shader: function () {
		return [
			'precision mediump float;',
			'varying vec2 vTexCoord;',
			'uniform sampler2D source;',
			'uniform float radius;',
			'void main(void){',
			'vec4 sum = vec4(0.0);',
			'sum += texture2D(source, vTexCoord + vec2(-radius, -radius));',
			'sum += texture2D(source, vTexCoord + vec2(radius, -radius));',
			'sum += texture2D(source, vTexCoord + vec2(-radius, radius));',
			'sum += texture2D(source, vTexCoord + vec2(radius, radius));',
			'gl_FragColor = sum * 0.25;',
			'}'
		].join('\n');
	},
	inputs: {
		source: { type: 'image' },
		radius: { type: 'number', min: 0, max: 0.02, defaultValue: 0.005 }
	}
});

Seriously.plugin('Blur - InnerBlur', {
	shader: function () {
		return [
			'precision mediump float;',
			'varying vec2 vTexCoord;',
			'uniform sampler2D source;',
			'uniform float amount;',
			'void main(void){',
			'vec4 c = texture2D(source, vTexCoord);',
			'vec4 b = texture2D(source, vTexCoord * (1.0 - amount));',
			'gl_FragColor = mix(c, b, amount);',
			'}'
		].join('\n');
	},
	inputs: {
		source: { type: 'image' },
		amount: { type: 'number', min: 0, max: 1, defaultValue: 0.2 }
	}
});

Seriously.plugin('Blur - LensBlur', {
	shader: function () {
		return [
			'precision mediump float;',
			'varying vec2 vTexCoord;',
			'uniform sampler2D source;',
			'uniform float radius;',
			'void main(void){',
			'vec4 sum = vec4(0.0);',
			'sum += texture2D(source, vTexCoord + vec2(radius, 0.0));',
			'sum += texture2D(source, vTexCoord + vec2(-radius, 0.0));',
			'sum += texture2D(source, vTexCoord + vec2(0.0, radius));',
			'sum += texture2D(source, vTexCoord + vec2(0.0, -radius));',
			'gl_FragColor = sum * 0.25;',
			'}'
		].join('\n');
	},
	inputs: {
		source: { type: 'image' },
		radius: { type: 'number', min: 0, max: 0.02, defaultValue: 0.003 }
	}
});

Seriously.plugin('Blur - GaussianBlur', {
	shader: function () {
		return [
			'precision mediump float;',
			'varying vec2 vTexCoord;',
			'uniform sampler2D source;',
			'uniform float radius;',
			'void main(void){',
			'vec4 color = texture2D(source, vTexCoord) * 0.4;',
			'color += texture2D(source, vTexCoord + vec2(radius, 0.0)) * 0.3;',
			'color += texture2D(source, vTexCoord - vec2(radius, 0.0)) * 0.3;',
			'gl_FragColor = color;',
			'}'
		].join('\n');
	},
	inputs: {
		source: { type: 'image' },
		radius: { type: 'number', min: 0, max: 0.02, defaultValue: 0.002 }
	}
});

Seriously.plugin('Blur - Sharpen', {
	shader: function () {
		return [
			'precision mediump float;',
			'varying vec2 vTexCoord;',
			'uniform sampler2D source;',
			'uniform float amount;',
			'void main(void){',
			'vec4 c = texture2D(source, vTexCoord);',
			'vec4 blur = texture2D(source, vTexCoord + vec2(0.001));',
			'gl_FragColor = c + (c - blur) * amount;',
			'}'
		].join('\n');
	},
	inputs: {
		source: { type: 'image' },
		amount: { type: 'number', min: 0, max: 5, defaultValue: 1 }
	}
});

Seriously.plugin('Blur - MotionBlur', {
	shader: function () {
		return [
			'precision mediump float;',
			'varying vec2 vTexCoord;',
			'uniform sampler2D source;',
			'uniform float angle;',
			'uniform float distance;',
			'void main(void){',
			'vec2 dir = vec2(cos(angle), sin(angle)) * distance;',
			'vec4 sum = texture2D(source, vTexCoord);',
			'sum += texture2D(source, vTexCoord + dir);',
			'sum += texture2D(source, vTexCoord - dir);',
			'gl_FragColor = sum / 3.0;',
			'}'
		].join('\n');
	},
	inputs: {
		source: { type: 'image' },
		angle: { type: 'number', min: 0, max: 6.283, defaultValue: 0 },
		distance: { type: 'number', min: 0, max: 0.02, defaultValue: 0.005 }
	}
});

Seriously.plugin('Blur - Bloom', {
	shader: function () {
		return [
			'precision mediump float;',
			'varying vec2 vTexCoord;',
			'uniform sampler2D source;',
			'uniform float intensity;',
			'void main(void){',
			'vec4 c = texture2D(source, vTexCoord);',
			'float bright = max(max(c.r, c.g), c.b);',
			'vec4 glow = vec4(vec3(bright), 1.0);',
			'gl_FragColor = c + glow * intensity;',
			'}'
		].join('\n');
	},
	inputs: {
		source: { type: 'image' },
		intensity: { type: 'number', min: 0, max: 3, defaultValue: 0.8 }
	}
});

}));
