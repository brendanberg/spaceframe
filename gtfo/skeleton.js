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


function Symbol(label, opts) {
	Node.call(this, opts);
	this.label = label;
}

Symbol.prototype = Object.create(Node.prototype);
Symbol.prototype.constructor = Symbol;

function Identifier(label, modifier, opts) {
	Node.call(this, opts);
	this.label = label;
	this.modifier = modifier;
}

Identifier.prototype = Object.create(Node.prototype);
Identifier.prototype.constructor = Identifier;

function Operator(label, opts) {
	Node.call(this, opts);
	this.label = label;
}

Operator.prototype = Object.create(Node.prototype);
Operator.prototype.constructor = Operator;

function Text(value, opts) {
	Node.call(this, opts);
	this.value = value;
}

Text.prototype = Object.create(Node.prototype);
Text.prototype.constructor = Text;

function Integer(value, opts) {
	Node.call(this, opts);
	this.value = value;
}

Integer.prototype = Object.create(Node.prototype);
Integer.prototype.constructor = Integer;

function Decimal(value, opts) {
	Node.call(this, opts);
	this.value = value;
}

Decimal.prototype = Object.create(Node.prototype);
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
	Envelope: Envelope,
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

