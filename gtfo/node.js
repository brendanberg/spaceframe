"use strict";

const punycode = require('punycode');

function makeTransform(dict) {
	return function(elt) {
		const type = elt.constructor.name;

		if (dict[type]) {
			return dict[type](elt);
		} else {
			return elt;
		}
	};
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
			Braces: (e) => {
				if (e.opts.source === 'module') {
					return e.exprs.join('\n');
				} else {
					return '{' + e.exprs.join('\n') + '}';
				}
			},
			AngleBars: (e) => {
				return '<| ' + e.exprs.join(', ') + ' |>';
			},
			AngleBrackets: (e) => {
				return '<[ ' + e.exprs.join(', ') + ' ]>';
			},
			Brackets: (e) => { return '[' + e.exprs.join(', ') + ']'; },
			Parens: (e) => { return '(' + e.exprs.join(', ') + ')'; },
			Expression: (e) => { return e.terms.join(' '); },
			Identifier: (e) => { return e.label + (e.modifier || ''); },
			Symbol: (e) => { return '.' + e.label; },
			Operator: (e) => { return e.label; },
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

				if (repr.indexOf("'") !== -1 && repr.indexOf('"') === -1) {
					// Text contains ' but not "
					return '"' + repr.replace(/"/g, '\\"') + '"';
				} else {
					return "'" + repr.replace(/'/g, "\\'") + "'";
				}
			},
			Integer: (e) => {
				if (e.sourceBase) {
					return e.value.toString(e.sourceBase);
				} else {
					return e.value.toString(10);
				}
			},
			Decimal: (e) => { 
				if (e.opts.as === 'scientific') {
					return e.value.toExponential();
				} else {
					return e.value.toString();
				}
			},
			Complex: (e) => { return (e.real ? e.real + ' + ' : '') + e.imaginary + 'j'; },
			Comment: (e) => {
				if (e.opts.source === 'inline') {
					return '#-' + e.text + '-#';
				} else {
					return '#' + e.text;
				}
			},

			Block: (e) => {
				if (e.opts.source === 'module') {
					return e.exprs.join('\n');
				} else {
					return '{\n' + e.exprs.join('\n') + '\n}';
				}
			},
			Assign: (e) => {
				return e.ident + ' = ' + e.value;
			},
			MessageSend: (e) => {
				const selector = e.selector.split(':').slice(0, -1);
				const string = selector.map((n, i) => n + ': ' + e.args[i]).join(', ');
				return e.receiver + '(' + string + ')';
			},
			SymbolLookup: (e) => {
				return e.receiver + e.symbol;
			},
			Subscript: (e) => {
				return e.receiver + '[' + e.subscript + ']';
			},
			PrefixExpression: (e) => {
				return this.op + this.expr;
			},
			InfixExpression: (e) => {
				return this.lexpr + ' ' + this.op + ' ' + this.rexpr;
			},
			Method: (e) => {
				const names = e.sel.split(':').slice(0, -1);
				const string = names.map((n, i) => n + ': ' + e.args[i]).join(', ');
				return '(' + string + ') => ' + e.block;
			},
			List: (e) => {
				return '[' + this.items.join(', ') + ']';
			},
			Dictionary: (e) => {
				if (this.items.length > 0) {
					return '[' + this.items.join(', ') + ']';
				} else {
					return '[:]';
				}
			},
			Bottom: (e) => { return '_'; },
			Error: (e) => {
				return '#- ERROR: ' + e.message + '. `' + e.encountered + '` -#';
			}
		};
		return this.pullUp(makeTransform(xform));
	},
	parse: function() {
		const xform = {
			// TODO: what is this supposed to look like?	
		};
		return this.pushDown(makeTransform(xform));
	}
};


module.exports = {
	makeTransform: makeTransform,
	Node: Node
};

