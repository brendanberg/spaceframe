const punycode = require('punycode');

function makeTransform(dict) {
	return function(elt) {
		const type = elt.constructor.name;

		if (dict[type]) {
			return dict[type](elt);
		} else {
			return elt;
		}
	}
}

function Node(opts) {
	this.opts = Object.assign({}, opts || {});
}

Node.prototype = {
	gmapt: function(fn) {
		return this;
	},
	pullUp: function(fn) {
		return fn(this.gmapt((x) => { return x.pullUp(fn); }));
	},
	pushDown: function(fn) {
		return fn(this).gmapt((x) => { return x.pushDown(fn); });
	},
	toString: function() {
		const xform = {
			Integer: (e) => { return e.value.toString(); },
			Text: (e) => {
				const repr = punycode.ucs2.encode(e.value).replace(/[\n\t\\]/g,
					function(match) {
						return ({
							"\n": "\\n",
							"\t": "\\t",
							"\\": "\\\\"
						})[match];
					}
				);

				if (repr.indexOf("'") !== -1) {
					if (repr.indexOf('"') !== -1) {
						// Text contains both ' and ".
						return "'" + repr.replace(/'/g, "\\'") + "'";
					} else {
						return '"' + repr.replace(/"/g, '\\"') + '"';
					}
				} else {
					return "'" + repr + "'";
				}
			},
			Operator: (e) => { return e.label; },
			Symbol: (e) => { return '.' + e.label; },
			Identifier: (e) => { return e.label + (e.modifier || ''); },
			Parens: (e) => { return '(' + e.exprs.join(', ') + ')'; },
			Expression: (e) => { return e.terms.join(' '); },
			Brackets: (e) => { return '[' + e.exprs.join(', ') + ']'; },
			Braces: (e) => {
				if (e.opts.source === 'module') {
					return e.exprs.join('\n');
				} else {
					return '{' + e.exprs.join('\n') + '}';
				}
			},
			Complex: (e) => { return (e.real ? e.real + ' + ' : '') + e.imaginary + 'j'; },
			Comment: (e) => {
				if (e.opts.source === 'inline') {
					return '#-' + e.text + '-#';
				} else {
					return '#' + e.text;
				}
			}
		};
		return this.pullUp(skel.makeTransform(xform));
	}
};

module.exports = {
	makeTransform: makeTransform,
	Node: Node
};

