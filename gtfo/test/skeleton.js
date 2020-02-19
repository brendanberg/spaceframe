"use strict";

const punycode = require('punycode');
const chai = require('chai');
const chaiImmutable = require('chai-immutable');
const assert = chai.assert;

const { Node } = require('../node');
const {
	Atom, Envelope, AngleBars, AngleBrackets, Braces, Brackets, Parens,
	Expression, Identifier, Symbol, Operator, Text, Integer, Decimal, 
	Complex, Comment
} = require('../skeleton.js');
		
chai.use(chaiImmutable);


describe('Nodes', () => {
	it('create opts dictionaries when not defined', () => {
		let node = new Node();
		assert.deepEqual(node.opts, {});
	});

	it('merge opts values passed to constructor', () => {
		let node = new Node({one: 1, two: 2});
		assert.property(node.opts, 'one');
		assert.property(node.opts, 'two');
		assert.equal(node.opts.one, 1);
		assert.equal(node.opts.two, 2);
	});
});

describe('Envelope Nodes', () => {
	
	it('record constructor shape', () => {
		let env = new Envelope('()');
		assert.equal(env.shape, '()');
	});

	it("have '<||>' shape when using AngleBars constructor", () => {
		let env = new AngleBars();
		assert.equal(env.shape, '<||>');
	});

	it("have '<[]>' shape when using AngleBrackets constructor", () => {
		let env = new AngleBrackets();
		assert.equal(env.shape, '<[]>');
	});

	it("have '()' shape when using Parens constructor", () => {
		let env = new Parens();
		assert.equal(env.shape, '()');
	});

	it("have '{}' shape when using Braces constructor", () => {
		let env = new Braces();
		assert.equal(env.shape, '{}');
	});

	it("have '[]' shape when using Brackets constructor", () => {
		let env = new Brackets();
		assert.equal(env.shape, '[]');
	});

	it("record children nodes passed to constructor", () => {
		let ch = new Integer(1);

		let env = new AngleBars([ch]);
		assert.deepEqual(env.exprs, [ch]);

		env = new AngleBrackets([ch]);
		assert.deepEqual(env.exprs, [ch]);

		env = new Parens([ch]);
		assert.deepEqual(env.exprs, [ch]);

		env = new Braces([ch]);
		assert.deepEqual(env.exprs, [ch]);

		env = new Brackets([ch]);
		assert.deepEqual(env.exprs, [ch]);
	});

	it('return an instance with modified child nodes when mapped', () => {
		let ch1 = new Integer(1);
		let ch2 = new Integer(2);
		let ch3 = new Integer(3);

		let env = new Brackets([ch1, ch2, ch3]);
		let res = env.gmapt((a) => new Integer(a.value + 1));

		assert.instanceOf(res, Brackets);
		assert.notStrictEqual(res, env);
		assert.instanceOf(res.exprs[0], Integer);
		assert.notStrictEqual(res.exprs[0], ch1);
		assert.notStrictEqual(res.exprs[0], ch2);
		assert.notStrictEqual(res.exprs[0], ch3);
		assert.equal(res.exprs[0].value, 2);
		assert.equal(res.exprs[1].value, 3);
		assert.equal(res.exprs[2].value, 4);
	});

	it('return a valid string representation', () => {
		let ch = new Integer(42);

		let env = new AngleBars([ch]);
		assert.equal(env.toString(), '<| 42 |>');

		env = new AngleBrackets([ch]);
		assert.equal(env.toString(), '<[ 42 ]>');

		env = new Parens([ch]);
		assert.equal(env.toString(), '(42)');

		env = new Braces([ch]);
		assert.equal(env.toString(), '{42}');

		env = new Brackets([ch]);
		assert.equal(env.toString(), '[42]');
	});
});

describe('Identifier Nodes', () => {

	it('are subtypes of Atom', () => {
		let ident = new Identifier();
		assert.instanceOf(ident, Atom);
	});

	it('record label names', () => {
		let ident = new Identifier('aaa');
		assert.equal(ident.label, 'aaa');
	});

	it('record postfix modifier values', () => {
		let ident = new Identifier(null, '!');
		assert.equal(ident.modifier, '!');
	});

	it('return themselves when mapped', () => {
		let ident = new Identifier('aaa');
		let res = ident.gmapt(a => a + 1);
		assert.instanceOf(res, Identifier);
		assert.strictEqual(res, ident);
	});

	it('return a valid string representation', () => {
		let ident = new Identifier('aaa');
		assert.equal(ident.toString(), 'aaa');

		ident = new Identifier('aaa', '?');
		assert.equal(ident.toString(), 'aaa?');
	});
});

describe('Symbol Nodes', () => {
	it('are subtypes of Atom', () => {
		let sym = new Symbol();
		assert.instanceOf(sym, Atom);
	});

	it ('records label name', () => {
		let sym = new Symbol('aaa');
		assert.equal(sym.label, 'aaa');
	});

	it('return a valid string representation', () => {
		let sym = new Symbol('aaa');
		assert.equal(sym.toString(), '.aaa');
	});
});

describe('Operator Nodes', () => {
	it('are subtypes of Atom', () => {
		let op = new Operator();
		assert.instanceOf(op, Atom);
	});

	it('records label name', () => {
		let op = new Operator('+');
		assert.equal(op.label, '+');
	});

	it('return a valid string representation', () => {
		let op = new Operator('++');
		assert.equal(op.toString(), '++');
	});
});

describe('Text Nodes', () => {
	it('are subtypes of Node', () => {
		let text = new Text();
		assert.instanceOf(text, Text);
	});

	it('records text values', () => {
		let text = new Text('the quick brown fox');
		assert.equal(text.value, 'the quick brown fox');
	});

	it('return a valid string representation', () => {
		let chars = punycode.ucs2.decode('"A pinch of notoriety will do." -QC');
		let text = new Text(chars);
		assert.equal(text.toString(), '\'"A pinch of notoriety will do." -QC\'');

		chars = punycode.ucs2.decode("'All art is immoral.' -OW");
		text = new Text(chars);
		assert.equal(text.toString(), "\"'All art is immoral.' -OW\"");
	});
});

describe('Integer Nodes', () => {
	it('are subtypes of Node', () => {
		let num = new Integer();
		assert.instanceOf(num, Integer);
	});

	it('records integer values', () => {
		let num = new Integer(123);
		assert.equal(num.value, 123);
	});

	it('return themselves when mapped', () => {
		let num = new Integer(44);
		let res = num.gmapt(a => a + 1);
		assert.instanceOf(res, Integer);
		assert.strictEqual(num, res);
		assert.equal(num.value, 44);
	});

	it('return a valid string representation', () => {
		let num = new Integer(42);
		assert.equal(num.toString(), '42');
	});
});

describe('Decimal Nodes', () => {
	it('are subtypes of Node', () => {
		let num = new Decimal();
		assert.instanceOf(num, Decimal);
	});

	it('records decimal values', () => {
		let num = new Decimal(123.45);
		assert.equal(num.value, 123.45);
	});

	it('return themselves when mapped', () => {
		let num = new Decimal(123.45);
		let res = num.gmapt(a => a + 1);
		assert.instanceOf(res, Decimal);
		assert.strictEqual(num, res);
		assert.equal(num.value, 123.45);
	});

	it('return a valid string representation', () => {
		let num = new Decimal(0.123);
		assert.equal(num.toString(), '0.123');
	});
});

describe('Complex Nodes', () => {
	it('are subtypes of Node', () => {
		let num = new Complex();
		assert.instanceOf(num, Complex);
	});

	it('records complex values', () => {
		let num = new Complex(0, 0);
		assert.equal(num.real, 0);
		assert.equal(num.imaginary, 0);
	});

	it('return a new instance with modified components when mapped', () => {
		let num = new Complex(0, 0);
		let res = num.gmapt(a => a + 1);
		assert.instanceOf(res, Complex);
		assert.notStrictEqual(num, res);
		assert.equal(res.real, 1);
		assert.equal(res.imaginary, 1);
	});

	it('return a valid string representation', () => {
		let real = new Integer(4);
		let im = new Integer(3);
		let num = new Complex(real, im);
		assert.equal(num.toString(), '4 + 3j');

		real = new Decimal(1.2);
		im = new Decimal(3.4);
		num = new Complex(real, im);
		assert.equal(num.toString(), '1.2 + 3.4j');
	});
});

describe('Comment Nodes', () => {
	it('are subtypes of Node', () => {
		let comment = new Comment();
		assert.instanceOf(comment, Comment);
	});

	it('records comment text', () => {
		let comment = new Comment('TODO: some task');
		assert.equal(comment.text, 'TODO: some task');
	});

	it('return a valid string representation', () => {
		let comment = new Comment('ignore', {source: 'inline'});
		assert.equal(comment.toString(), '#-ignore-#');

		comment = new Comment('ignore');
		assert.equal(comment.toString(), '#ignore');
	});
});
