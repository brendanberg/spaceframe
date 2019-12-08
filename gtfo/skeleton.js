"use strict";

const { Node, makeTransform } = require('./node');


function Envelope(shape, opts) {
	Node.call(this, opts);
	this.shape = shape;
}

Envelope.prototype = Object.assign(Object.create(Node.prototype), {
	gmapt: function(fn) {
		return new this.constructor(this.exprs.map(fn), this.opts);
	},
	constructor: Envelope
});


function AngleBars(exprs, opts) {
	Envelope.call(this, '<||>', opts);
	this.exprs = exprs;
}

AngleBars.prototype = Object.assign(Object.create(Envelope.prototype), {
	constructor: AngleBars
});


function AngleBrackets(exprs, opts) {
	Envelope.call(this, '<[]>', opts);
	this.exprs = exprs;
}

AngleBrackets.prototype = Object.assign(Object.create(Envelope.prototype), {
	constructor: AngleBrackets
});


function Braces(exprs, opts) {
	Envelope.call(this, '{}', opts);
	this.exprs = exprs;
}

Braces.prototype = Object.assign(Object.create(Envelope.prototype), {
	constructor: Braces
});


function Brackets(exprs, opts) {
	Envelope.call(this, '[]', opts);
	this.exprs = exprs;
}

Brackets.prototype = Object.assign(Object.create(Envelope.prototype), {
	constructor: Brackets
});


function Parens(exprs, opts) {
	Envelope.call(this, '()', opts);
	this.exprs = exprs;
}

Parens.prototype = Object.assign(Object.create(Envelope.prototype), {
	constructor: Parens
});


function Expression(terms, opts) {
	Node.call(this, opts);
	this.terms = terms;
}

Expression.prototype = Object.assign(Object.create(Envelope.prototype), {
	gmapt: function(fn) {
		return new this.constructor(this.terms.map(fn), this.opts);
	},
	constructor: Expression
});


function Atom(opts) {
	Node(this, opts);
}

Atom.prototype = Object.assign(Object.create(Node.prototype), {
	constructor: Atom
});


function Symbol(label, opts) {
	Atom.call(this, opts);
	this.label = label;
}

Symbol.prototype = Object.create(Atom.prototype);
Symbol.prototype.constructor = Symbol;

function Identifier(label, modifier, opts) {
	Atom.call(this, opts);
	this.label = label;
	this.modifier = modifier;
}

Identifier.prototype = Object.create(Atom.prototype);
Identifier.prototype.constructor = Identifier;

function Operator(label, opts) {
	Atom.call(this, opts);
	this.label = label;
}

Operator.prototype = Object.create(Atom.prototype);
Operator.prototype.constructor = Operator;

function Text(value, opts) {
	Atom.call(this, opts);
	this.value = value;
}

Text.prototype = Object.create(Atom.prototype);
Text.prototype.constructor = Text;

function Integer(value, opts) {
	Atom.call(this, opts);
	this.value = value;
}

Integer.prototype = Object.create(Atom.prototype);
Integer.prototype.constructor = Integer;

function Decimal(value, opts) {
	Atom.call(this, opts);
	this.value = value;
}

Decimal.prototype = Object.create(Atom.prototype);
Decimal.prototype.constructor = Decimal;

function Complex(real, imaginary, opts) {
	Node.call(this, opts);
	this.real = real;
	this.imaginary = imaginary;
}

Complex.prototype = Object.assign(Object.create(Node.prototype), {
	gmapt: function(fn) {
		return new this.constructor(fn(this.real), fn(this.imaginary), this.opts);
	},
	constructor: Complex
});

function Comment(text, opts) {
	Node.call(this, opts);
	this.text = text;
}

Comment.prototype = Object.create(Node.prototype);
Comment.prototype.constructor = Comment;


module.exports = {
	makeTransform: makeTransform,
	Node: Node,
	Atom: Atom,
	Envelope: Envelope,
	AngleBars: AngleBars,
	AngleBrackets: AngleBrackets,
	Braces: Braces,
	Brackets: Brackets,
	Parens: Parens,
	Expression: Expression,
	Identifier: Identifier,
	Symbol: Symbol,
	Operator: Operator,
	Text: Text,
	Integer: Integer,
	Decimal: Decimal,
	Complex: Complex,
	Comment: Comment,
};

