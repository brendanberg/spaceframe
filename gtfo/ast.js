const { Node } = require('./node');
const { Envelope } = require('./skeleton');


function Block(exprs, opts) {
	Envelope.call(this, opts);
	this.exprs = exprs;
}

Block.prototype = Object.assign(Object.create(Envelope.prototype), {
	gmapt: function(fn) {
		return new this.constructor(this.exprs.map(fn), this.opts);
	},
	constructor: Block
});


function Assign(ident, value, opts) {
	Node.call(this, opts);
	this.ident = ident;
	this.value = value;
}

Assign.prototype = Object.assign(Object.create(Node.prototype), {
	gmapt: function(fn) {
		return new this.constructor(fn(this.ident), fn(this.value), this.opts);
	},
	constructor: Assign
});


function MessageSend(receiver, selector, args, opts) {
	Node.call(this, opts);
	this.receiver = receiver;
	this.selector = selector;
	this.args = args;
}

MessageSend.prototype = Object.assign(Object.create(Node.prototype), {
	gmapt: function(fn) {
		return new this.constructor(
			fn(this.receiver), fn(this.selector), this.args.map(fn), this.opts
		);
	},
	constructor: MessageSend
});


function SymbolLookup(receiver, symbol, opts) {
	Node.call(this, opts);
	this.receiver = receiver;
	this.symbol = symbol;
}

SymbolLookup.prototype = Object.assign(Object.create(Node.prototype), {
	gmapt: function(fn) {
		return new this.constructor(fn(this.receiver), fn(this.symbol), this.opts);
	},
	constructor: SymbolLookup
});


function Subscript(receiver, subscript, opts) {
	Node.call(this, opts);
	this.receiver = receiver;
	this.subscript = subscript;
}

Subscript.prototype = Object.assign(Object.create(Node.prototype), {
	gmapt: function(fn) {
		return new this.constructor(fn(this.receiver), fn(this.subscript), this.opts);
	},
	constructor: Subscript
});


function PrefixExpression(oper, expr, opts) {
	Node.call(this, opts);
	this.oper = oper;
	this.expr = expr;
}

PrefixExpression.prototype = Object.assign(Object.create(Node.prototype), {
	gmapt: function(fn) {
		return new this.constructor(fn(this.oper), fn(this.expr), this.opts);
	},
	constructor: PrefixExpression
});


function InfixExpression(oper, lexpr, rexpr, opts) {
	Node.call(this, opts);
	this.oper = oper;
	this.lexpr = lexpr;
	this.rexpr = rexpr;
}

InfixExpression.prototype = Object.assign(Object.create(Node.prototype), {
	gmapt: function(fn) {
		return new this.constructor(
			fn(this.oper), fn(this.lexpr), fn(this.rexpr), this.opts
		);
	},
	constructor: InfixExpression
});


function Method(ident, args, block, opts) {
	Node.call(this, opts);
	//this.ident = ident;
	this.args = args;
	this.block = block;
}

Method.prototype = Object.assign(Object.create(Node.prototype), {
	gmapt: function(fn) {
		return new this.constructor(this.args.map(fn), fn(this.block), this.opts);
	},
	constructor: Method
});

function List(items, opts) {
	Node.call(this, opts);
	this.items = items;
}

List.prototype = Object.assign(Object.create(Node.prototype), {
	gmapt: function(fn) {
		return new this.constructor(this.items.map(fn), this.opts);
	},
	constructor: List
});


function Dictionary(items, opts) {
	Node.call(this, opts);
	this.items = items;
}

Dictionary.prototype = Object.assign(Object.create(Node.prototype), {
	gmapt: function(fn) {
		return new this.constructor(this.items.map(fn), this.opts);
	},
	constructor: Dictionary
});


function Bottom(opts) {
	Node.call(this, opts);
}

Bottom.prototype = Object.assign(Object.create(Node.prototype), {
	gmapt: function(fn) { return new this.constructor(this.opts); },
	constructor: Bottom;
});


function Error(subject, message, consumed, encountered, opts) {
	Node.call(this, opts);
	this.subject = subject;
	this.message = message;
	this.consumed = consumed;
	this.encountered = encountered;
}

Error.prototype = Object.assign(Object.create(Node.prototype), {
	gmapt: function(fn) {
		return new this.constructor(
			this.subject, this.message, fn(this.consumed),
			fn(this.encountered), this.opts
		);
	},
	constructor: Error
});


module.exports = {
	Block: Block,
	Assign: Assign,
	MessageSend: MessageSend,
	SymbolLookup: SymbolLookup,
	Subscript: Subscript,
	PrefixExpression: PrefixExpression,
	InfixExpression: InfixExpression,
	Method: Method,
	List: List,
	Dictionary: Dictionary,
	Bottom: Bottom,
	Error: Error
};

