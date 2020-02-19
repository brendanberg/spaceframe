"use strict";

const punycode = require('punycode');
const chai = require('chai');
const chaiImmutable = require('chai-immutable');
const assert = chai.assert;

const lang = require('../lang');
const skel = require('../skeleton');
const ast = require('../ast');

chai.use(chaiImmutable);


function parse(string) {
	return lang.parse(string).exprs[0].terms[0];
}

describe('Scanner', () => {
	it('parses braces', () => {
		let module = parse('{}');
		assert.instanceOf(module, skel.Braces);
	});

	it('parses parentheses', () => {
		let term = parse('()');
		assert.instanceOf(term, skel.Parens);
	});

	it('parses brackets', () => {
		let term = parse('[]');
		assert.instanceOf(term, skel.Brackets);
	});

	it('parses angle bars', () => {
		let term = parse('<| |>');
		assert.instanceOf(term, skel.AngleBars);
	});

	it('parses angle brackets', () => {
		let term = parse('<[ ]>');
		assert.instanceOf(term, skel.AngleBrackets);
	});

	it('parses identifiers', () => {
		let module = parse('a');
		assert.instanceOf(module, skel.Identifier);
		assert.equal(module.label, 'a');

		module = parse('b?');
		assert.equal(module.label, 'b');
		assert.equal(module.modifier, '?');

		module = parse('c!');
		assert.equal(module.label, 'c');
		assert.equal(module.modifier, '!');

		module = parse('kebab-case');
		assert.equal(module.label, 'kebab-case');

		module = parse('snake_case');
		assert.equal(module.label, 'snake_case');
	});

	it('parses symbols', () => {
		let module = parse('.a');
		assert.instanceOf(module, skel.Symbol);
		assert.equal(module.label, 'a');

		module = parse('.0');
		assert.instanceOf(module, skel.Symbol);
		assert.equal(module.label, '0');

		module = parse('.kebab-case');
		assert.equal(module.label, 'kebab-case');

		module = parse('.snake_case');
		assert.equal(module.label, 'snake_case');

		module = parse('._-_');
		assert.equal(module.label, '_-_');
	});

	it('parses operators', () => {
		let term = parse('+');
		assert.instanceOf(term, skel.Operator);
		assert.equal(term.label, '+');
	});

	it('parses integers', () => {
		let term = parse('1');
		assert.instanceOf(term, skel.Integer);
		assert.equal(term.value, 1);

		term = parse('0xA');
		assert.instanceOf(term, skel.Integer);
		assert.equal(term.opts.sourceBase, 16);
		assert.equal(term.value, 10);

		term = parse('0x00dead');
		assert.equal(term.value, 57005);
	});

	it('parses scientific numbers', () => {
		let term = parse('1e5');
		assert.instanceOf(term, skel.Decimal);
		assert.equal(term.opts.as, 'scientific');
		assert.equal(term.value, 1e5);

		term = parse('5.4321e-3');
		assert.equal(term.opts.as, 'scientific');
		assert.equal(term.value, 5.4321e-3);

		term = parse('10E-7');
		assert.equal(term.opts.as, 'scientific');
		assert.equal(term.value, 10e-7);

		term = parse('2.3456e+5');
		assert.equal(term.opts.as, 'scientific');
		assert.equal(term.value, 2.3456e+5);
	});

	it('parses decimals', () => {
		let term = parse('1.0');
		assert.instanceOf(term, skel.Decimal);
		assert.equal(term.value, 1.0);

		term = parse('0.375');
		assert.equal(term.value, 0.375);
	});

	it('parses complex numbers', () => {
		let term = parse('3j');
		assert.instanceOf(term, skel.Complex);
		assert.equal(term.real.value, 0);
		assert.equal(term.imaginary.value, 3);


		term = parse('0.345i');
		assert.equal(term.real.value, 0);
		assert.equal(term.imaginary.value, 0.345);

		term = parse('0x12J');
		assert.equal(term.real.value, 0);
		assert.equal(term.imaginary.value, 18);

		term = parse('2e5i');
		assert.equal(term.real.value, 0);
		assert.equal(term.imaginary.value, 200000);
	});

	it('parses single quoted text', () => {
		let term = parse("'hello'");
		assert.instanceOf(term, skel.Text);
		assert.equal(term.utf8string(), 'hello');

		term = parse("'hello, \"world\"'");
		assert.instanceOf(term, skel.Text);
		assert.equal(term.utf8string(), 'hello, "world"');
	});

	it('parses double quoted text', () => {
		let term = parse('"hello"');
		assert.instanceOf(term, skel.Text);
		assert.equal(term.utf8string(), 'hello');

		term = parse('"hello, \'world\'"');
		assert.equal(term.utf8string(), "hello, 'world'");
	});

	it('parses text with escape sequences', () => {
		// String is '\n\t\'\"\\'
		// [newline, tab, single quote, double quote, slash]
		let term = parse('"\\n\\t\\\'\\"\\\\"');
		assert.instanceOf(term, skel.Text);
		assert.equal(term.utf8string(), '\n\t\'\"\\');
	});

	it('parses text with unicode codepoints', () => {
		let term = parse('"\\u{FC}"');
		assert.instanceOf(term, skel.Text);
		assert.equal(term.utf8string(), String.fromCodePoint(0xFC));

		term = parse('"\\u{0FC}"');
		assert.equal(term.utf8string(), String.fromCodePoint(0xFC));

		term = parse('"\\u{E01}"');
		assert.equal(term.utf8string(), String.fromCodePoint(0xE01));

		term = parse('"\\u{203C}"');
		assert.equal(term.utf8string(), String.fromCodePoint(0x203C));

		term = parse('"\\u{1F315}"');
		assert.equal(term.utf8string(), String.fromCodePoint(0x1F315));

		term = parse('"\\u{1F1FA}\\u{1F1F8}"');
		assert.equal(term.utf8string(),
			String.fromCodePoint(0x1F1FA) + String.fromCodePoint(0x1F1F8));

		term = parse('"\\u{10FFFF}"');
		assert.equal(term.utf8string(), String.fromCodePoint(0x10FFFF));
	});

	it('parses text with rtl direction', () => {
		let str = '"This \\u{05D1}\\u{05D0}\\u{05DE}\\u{05EA} rules"';
		let term = parse(str);
		assert.instanceOf(term, skel.Text);
		assert.equal(term.utf8string(), 'This \u05D1\u05D0\u05DE\u05EA rules');

		str = '"A \\u{200F}\\u{05D1}\\u{05D0}\\u{05DE}\\u{05EA}\\u{200E} Z"';
		term = parse(str);
		assert.equal(term.utf8string(), 'A \u200F\u05D1\u05D0\u05DE\u05EA\u200E Z');
	});

	it('parses unary selectors', () => {
		let term = parse('aaa:');
		assert.instanceOf(term, skel.Identifier);
		assert.equal(term.label, 'aaa:');
	});

	it('parses n-ary selectors', () => {
		let term = parse('a:b:');
		assert.instanceOf(term, skel.Identifier);
		assert.equal(term.label, 'a:b:');
	});

	/*it('parses comments', () => {
		let term = parse('# hello');
		//console.log(term);
	});*/
});
