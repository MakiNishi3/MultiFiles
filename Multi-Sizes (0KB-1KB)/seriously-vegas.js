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

	Seriously.plugin('kitchen-sink', {
		commonShader: true,
		shader: function (inputs) {
			return {
				fragment: [
					'precision mediump float;',
					'uniform sampler2D source;',
					'uniform float gain;',
					'uniform float bias;',
					'uniform float invert;',
					'varying vec2 vTexCoord;',
					'void main(void) {',
					'vec4 color = texture2D(source, vTexCoord);',
					'color.rgb = color.rgb * gain + bias;',
					'color.rgb = mix(color.rgb, 1.0 - color.rgb, invert);',
					'gl_FragColor = color;',
					'}'
				].join('\n')
			};
		},
		inputs: {
			source: {
				type: 'image'
			},
			gain: {
				type: 'number',
				defaultValue: 1,
				min: 0,
				max: 5
			},
			bias: {
				type: 'number',
				defaultValue: 0,
				min: -1,
				max: 1
			},
			invert: {
				type: 'number',
				defaultValue: 0,
				min: 0,
				max: 1
			}
		}
	});

	Seriously.plugin('checkerboard-generator', {
		commonShader: true,
		shader: function () {
			return {
				fragment: [
					'precision mediump float;',
					'uniform vec2 resolution;',
					'uniform float size;',
					'uniform vec3 color1;',
					'uniform vec3 color2;',
					'varying vec2 vTexCoord;',
					'void main(void) {',
					'vec2 coord = vTexCoord * resolution / size;',
					'float checker = mod(floor(coord.x) + floor(coord.y), 2.0);',
					'vec3 color = mix(color1, color2, checker);',
					'gl_FragColor = vec4(color, 1.0);',
					'}'
				].join('\n')
			};
		},
		inputs: {
			resolution: {
				type: 'vector',
				dimensions: 2,
				defaultValue: [640, 480]
			},
			size: {
				type: 'number',
				defaultValue: 32,
				min: 2,
				max: 256
			},
			color1: {
				type: 'color',
				defaultValue: [1, 1, 1]
			},
			color2: {
				type: 'color',
				defaultValue: [0, 0, 0]
			}
		}
	});

	Seriously.plugin('time-slice', {
		commonShader: true,
		shader: function () {
			return {
				fragment: [
					'precision mediump float;',
					'uniform sampler2D source;',
					'uniform float time;',
					'uniform float slices;',
					'varying vec2 vTexCoord;',
					'void main(void) {',
					'float slice = floor(vTexCoord.y * slices);',
					'float offset = mod(slice + time, slices) / slices;',
					'vec2 coord = vec2(vTexCoord.x, offset);',
					'gl_FragColor = texture2D(source, coord);',
					'}'
				].join('\n')
			};
		},
		inputs: {
			source: {
				type: 'image'
			},
			time: {
				type: 'number',
				defaultValue: 0,
				min: 0,
				max: 1000
			},
			slices: {
				type: 'number',
				defaultValue: 10,
				min: 1,
				max: 100
			}
		}
	});

}));
