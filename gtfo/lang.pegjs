{
	const punycode = require('punycode');
	const {
		Braces, Parens, Brackets, Expression, Symbol,
		Identifier, Operator, Text, Integer, Decimal, Complex, Comment
	} = require('./skeleton');
}

start
	= exprs:expression_list {
		return new Braces(exprs, {source: 'module'});
	}

expression_list
	= __ first:expression rest:(_S e:expression { return e; })* _S? __ {
			return [first].concat(rest);
		}
	/ __ _S? __ { return []; }

expression
	= first:term rest:(_ t:term { return t; })* _ {
			return new Expression([first].concat(rest));
		}

term = identifier
	/ symbol
	/ anglebars
	/ anglebracks
	/ brackets
	/ parens
	/ braces
	/ number
	/ selector
	/ "'" t:single_quote_string* "'" {
			let chars = punycode.ucs2.decode(t.join(''));
			return new Text(chars);
		}
	/ '"' t:double_quote_string* '"' {
			let chars = punycode.ucs2.decode(t.join(''));
			return new Text(chars);
		}
	/ op:operator { return new Operator(op); }

operator "operator"
	= '...'
	/ '=>'
	/ '=='
	/ '<='
	/ '>='
	/ '//'
	/ '**'
	/ '*'
	/ '@'
	/ '+'
	/ '-'
	/ '/'
	/ '%'
	/ '&'
	/ '|' !'>'
	/ '^'
	/ ':'
	/ '='
	/ '<' !('|' / '[')
	/ '>'
	/ '?'

anglebars
	= '<|' exprlist:expression_list '|>' { return new AngleBars(exprlist); }

anglebracks
	= '<[' exprlist:expression_list ']>' { return new AngleBrackets(exprlist); }

parens
	= '(' exprlist:expression_list ')' { return new Parens(exprlist); }

braces
	= '{' exprlist:expression_list '}' { return new Braces(exprlist); }

brackets
	= '[' exprlist:expression_list ']' !'>' { return new Brackets(exprlist); }

symbol "symbol"
	= '.' l:label_char+ { return new Symbol(l.join('')); }

identifier "identifier"
	= l:label mod:postfix_modifier? {
		return new Identifier(l, mod);
	}

selector "selector"
	= parts:selector_segment+ { return new Identifier(parts.join(''), null); }

selector_segment
	= l:label ':' { return l + ':'; }

postfix_modifier
	= '?' / '!'

label
	= first:label_start rest:label_char* { return first + rest.join(''); }

label_start
	= [a-zA-Z_]
	/ [\u00A8\u00AA\u00AD\u00AF\u00B2-\u00B5\u00B7-\u00BA]
	/ [\u00BC-\u00BE\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF]
	/ [\u0100-\u02FF\u0370-\u167F\u1681-\u180D\u180F-\u1DBF\u1E00-\u1FFF]
	/ [\u200B-\u200D\u202A-\u202E\u203F-\u2040\u2054\u2060-\u206F]
	/ [\u2070-\u20CF\u2100-\u218F\u2460-\u24FF\u2776-\u2793\u2C00-\u2DFF\u2E80-\u2FFF]
	/ [\u3004-\u3007\u3021-\u302F\u3031-\u303F\u3040-\uD7FF]
	/ [\uF900-\uFD3D\uFD40-\uFDCF\uFDF0-\uFE1F\uFE30-\uFE44\uFE47-\uFFFD]
	/ h:[\uD800-\uDBFF] l:[\uDC00-\uDFFF] { return h + l; }
	// [\u{10000}-\u{1FFFD}\u{20000}-\u{2FFFD}\u{30000}-\u{3FFFD}\u{40000}-\u{4FFFD}]
	// [\u{50000}–\u{5FFFD}\u{60000}–\u{6FFFD}\u{70000}–\u{7FFFD}\u{80000}–\u{8FFFD}]
	// [\u{90000}–\u{9FFFD}\u{A0000}–\u{AFFFD}\u{B0000}–\u{BFFFD}\u{C0000}–\u{CFFFD}]
	// [\u{D0000}–\u{DFFFD}\u{E0000}–\u{EFFFD}]

label_char
	= label_start
	/ [0-9\u0300-\u036F\u1DC0-\u1DFF\u20D0-\u20FF\uFE20-\uFE2F-]


number "number"
	= hex
	/ imaginary
	/ scientific
	/ decimal
	/ integer

integer
	= '0' { return Integer.clone({value: 0, sourceBase: 10}); }
	/ first:[1-9] rest:[0-9]* {
		const val = parseInt(first + rest.join(''), 10);
		return new Integer(val, {sourceBase: 10});
	}

decimal
	= int:integer '.' !'.' digits:[0-9]* {
		const fraction = parseInt(digits.join(''), 10) || 0;
		// OOF
	}

scientific
	= sig:integer [eE] [+-]? mant:integer {
			return new Decimal(0.0);
		}
	/ sig:decimal [eE] [+-]? mant:integer {
			return new Decimal(0.0);
		}

hex
	= '0x' pad:'0'* first:[1-9a-fA-F] rest:[0-9a-fA-F]* { }
	/ '0x0' { return new Integer(0, {sourceBase: 16}); }

imaginary
	= num:(scientific / hex / decimal / integer) [ijJ] {
		const zero = new Integer(0, {sourceBase: 10});
		return new Complex(zero, num);
	}

single_quote_string "text"
	= !("'" / '\\' / '\n') char:. { return char; }
	/ '\\' seq:escape_sequence { return seq; }

double_quote_string "text"
	= !('"' / '\\' / '\n') char:. { return char; }
	/ '\\' seq:escape_sequence { return seq; }

escape_sequence
	= "'"
	/ '"'
	/ '\\'
	/ 'a'  { return "\x07"; }  // bell
	/ 'b'  { return "\b"; }    // backspace
	/ 'f'  { return "\f"; }    // form feed
	/ 'n'  { return "\n"; }    // line feed
	/ 'r'  { return "\r"; }    // carriage return
	/ 't'  { return "\t"; }    // horizontal tab
	/ 'v'  { return "\x0B"; }  // vertical tab
	/ 'u{' ch:codepoint '}' { return ch; }

codepoint "codepoint"
	= ch:( X X X X X X X X / X X X X X X X / X X X X X X / X X X X X
			/ X X X X / X X X / X X / X ) {
		return String.fromCodePoint(parseInt(ch.join(''), 16));
	}

X "hex"
	= ch:[0-9a-fA-F]

_ "whitespace"
	= (comment / whitespace)*

__ "whitespace"
	= (comment / linespace)*

_S "separator"
	= _ [,\n] __

whitespace
	= [ \t]+

linespace
	= [ \t\n]+

comment "comment"
	= '#-' t:(!'-#' .)* '-#' {
			return new Comment(t.join(''), {source: 'inline'});
		}
	/ '#' t:(!'\n' .)* {
			return new Comment(t.join(''), {source: 'trailing'});
		}

