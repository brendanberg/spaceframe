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


function MessageSend(receiver, selector, args, opts) { }


function SymbolLookup(receiver, symbol, opts) { }


function Subscript(receiver, subscript, opts) { }


function PrefixExpression(oper, expr, opts) { }


function InfixExpression(oper, leftExpr, rightExpr, opts) { }


function Method(ident, args, block, opts) { }


function List(exprs, opts) { }


function Dictionary(pairs, opts) { }


function Bottom(opts) { }


function Error(opts) { }


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

