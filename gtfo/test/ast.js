"use strict";

const punycode = require('punycode');
const chai = require('chai');
const chaiImmutable = require('chai-immutable');
const assert = chai.assert;

const {
	Block, Assign, MessageSend, SymbolLookup, Subscript, PrefixExpression,
	InfixExpression, Method, List, Dictionary, Bottom, Error
} = require('../ast.js');
const { Identifier, Symbol, Integer, Text } = require('../skeleton.js');
		
chai.use(chaiImmutable);


describe('Blocks', () => {
	it('create opts dictionaries when not defined', () => {
		let node = new Block();
		assert.deepEqual(node.opts, {});
	});

	it('return a valid string representation', () => {
		let block = new Block([]);
		assert.equal(block.toString(), '{\n\n}');

		let sym = new Symbol('a');
		block = new Block([sym]);
		assert.equal(block.toString(), '{\n.a\n}');
	});
});

describe('Assign Expressions', () => {
	it('return a valid string representation', () => {
		let lvalue = new Identifier('a');
		let rvalue = new Integer(42);
		let assign = new Assign(lvalue, rvalue);

		assert.equal(assign.toString(), 'a = 42');
	});
});

describe('MessageSend Expressions', () => {
	it('return a valid string representation', () => {
		let recv = new Identifier('foo');
		let selector = new Identifier('frobWith:using:');
		let args = [new Identifier('bar'), new Identifier('baz')];
		let msgSend = new MessageSend(recv, selector, args);
		assert.equal(msgSend.toString(), 'foo(frobWith: bar, using: baz)');
		
		selector = new Identifier('aaa:');
		args = [new Identifier('bbb')];
		msgSend = new MessageSend(recv, selector, args);
		assert.equal(msgSend.toString(), 'foo(aaa: bbb)');
	});
});
