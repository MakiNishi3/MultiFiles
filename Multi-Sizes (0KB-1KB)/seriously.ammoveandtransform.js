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

	function makePlugin(name, options) {
		Seriously.plugin(name, {
			shader: options.shader,
			inplace: true,
			params: options.params,
			apply: options.apply
		});
	}

	makePlugin('MoveTransformMoveAlongPath', {
		params: {
			progress: { type: 'number', defaultValue: 0 },
			offsetX: { type: 'number', defaultValue: 0 },
			offsetY: { type: 'number', defaultValue: 0 }
		},
		apply: function (source, target, params) {
			let x = params.offsetX + params.progress * 100;
			let y = params.offsetY + params.progress * 50;
			target.transform = 'translate(' + x + 'px,' + y + 'px)';
		}
	});

	makePlugin('MoveTransformSpin', {
		params: {
			angle: { type: 'number', defaultValue: 0 },
			speed: { type: 'number', defaultValue: 1 }
		},
		apply: function (source, target, params) {
			let a = params.angle + (params.speed * 360);
			target.transform = 'rotate(' + a + 'deg)';
		}
	});

	makePlugin('MoveTransformStretchAxis', {
		params: {
			scaleX: { type: 'number', defaultValue: 1 },
			scaleY: { type: 'number', defaultValue: 1 }
		},
		apply: function (source, target, params) {
			target.transform = 'scale(' + params.scaleX + ',' + params.scaleY + ')';
		}
	});

	makePlugin('MoveTransformAutoShake', {
		params: {
			intensity: { type: 'number', defaultValue: 5 },
			speed: { type: 'number', defaultValue: 1 }
		},
		apply: function (source, target, params) {
			let t = Date.now() * 0.001 * params.speed;
			let x = Math.sin(t) * params.intensity;
			let y = Math.cos(t) * params.intensity;
			target.transform = 'translate(' + x + 'px,' + y + 'px)';
		}
	});

	makePlugin('MoveTransformRandomJitter', {
		params: {
			amount: { type: 'number', defaultValue: 10 }
		},
		apply: function (source, target, params) {
			let x = (Math.random() - 0.5) * params.amount;
			let y = (Math.random() - 0.5) * params.amount;
			target.transform = 'translate(' + x + 'px,' + y + 'px)';
		}
	});

	makePlugin('MoveTransformOscillate', {
		params: {
			amplitude: { type: 'number', defaultValue: 20 },
			frequency: { type: 'number', defaultValue: 1 }
		},
		apply: function (source, target, params) {
			let t = Date.now() * 0.001 * params.frequency;
			let x = Math.sin(t) * params.amplitude;
			target.transform = 'translateX(' + x + 'px)';
		}
	});

	makePlugin('MoveTransformSpinScale', {
		params: {
			angle: { type: 'number', defaultValue: 0 },
			scale: { type: 'number', defaultValue: 1 }
		},
		apply: function (source, target, params) {
			target.transform = 'rotate(' + params.angle + 'deg) scale(' + params.scale + ')';
		}
	});

	makePlugin('MoveTransformDrift', {
		params: {
			speedX: { type: 'number', defaultValue: 1 },
			speedY: { type: 'number', defaultValue: 1 }
		},
		apply: function (source, target, params) {
			let t = Date.now() * 0.001;
			let x = t * params.speedX * 10;
			let y = t * params.speedY * 10;
			target.transform = 'translate(' + x + 'px,' + y + 'px)';
		}
	});

	makePlugin('MoveTransformElastic', {
		params: {
			stiffness: { type: 'number', defaultValue: 0.1 },
			damping: { type: 'number', defaultValue: 0.8 }
		},
		apply: function (source, target, params) {
			let t = Date.now() * 0.001;
			let x = Math.sin(t * params.stiffness) * 50 * params.damping;
			let y = Math.cos(t * params.stiffness) * 50 * params.damping;
			target.transform = 'translate(' + x + 'px,' + y + 'px)';
		}
	});

	makePlugin('MoveTransformWave', {
		params: {
			amplitude: { type: 'number', defaultValue: 20 },
			wavelength: { type: 'number', defaultValue: 2 }
		},
		apply: function (source, target, params) {
			let t = Date.now() * 0.001;
			let y = Math.sin(t * params.wavelength) * params.amplitude;
			target.transform = 'translateY(' + y + 'px)';
		}
	});

}));
