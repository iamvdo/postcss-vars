var postcss = require('postcss');
var variables = [];
var varStartIdentifier = '--';
var refStartIdentifier = 'var(';

var _process = function (css) {

	// for each rules
	css.eachRule(function (rule) {

		// if selector is :root
		if (rule.selectors.length === 1 && rule.selectors[0] === ':root' && rule.parent.type === 'root') {

			rule.each(function (decl) {
				if (decl.type === 'decl' && decl.prop.indexOf(varStartIdentifier) === 0) {
					// store all variables
					variables[decl.prop] = decl.value;
				}
			});

		// else, it's not :root
		} else {

			rule.each(function (decl, i) {
				if (decl.type === 'decl' && decl.value.indexOf(refStartIdentifier) !== -1) {
					// get the new value
					var newValue = _replaceValue(decl.value);

					// if this value contains prefixes
					if (newValue.search(/-(webkit|moz|ms|o)-/) !== -1) {
						// replace value
						decl.value = newValue;

					// if not
					} else {
						// insert a new declaration
						rule.insertBefore(i, decl.clone({ value: newValue }));
					}
				}
			});

		}

	});

	return css;

};

var _replaceValue = function (value) {

	// matches `var(name[, fallback])`, captures 'name' and 'fallback'
	var regexpVar = /\bvar\(([\w-]+)(?:\s*,\s*)?(.*)?\)/;
	// matches `var()`
	var regexpEmptyVar = /\bvar\(\s*\)/;

	var valueLen = value.length;
	var beginSlice = value.indexOf(refStartIdentifier);
	var endSlice = beginSlice + refStartIdentifier.length;
	var depth = 1;
	var currentChar;
	var cssVariable;

	// find the closing `)` of the CSS variable function,
	// accounting for nested functions
	while (endSlice < valueLen && depth > 0) {
		currentChar = value.charAt(endSlice);
		if (currentChar == '(') depth += 1;
		if (currentChar == ')') depth -= 1;
		endSlice += 1;
	}

	if (depth > 0) throw new Error('postcss-vars: missing closing ")" in the value "' + value + '"');

	cssVariable = value.slice(beginSlice, endSlice);

	if (regexpEmptyVar.test(cssVariable)) throw new Error('postcss-vars: var() must contain a non-whitespace string');

	cssReplacement = cssVariable.replace(regexpVar, function(_, name, fallback){
		var replacement = variables[name];
		if (!replacement && !fallback) throw new Error('postcss-vars: variable "' + name + '" is undefined');
		if (!replacement && fallback) return fallback;
		return replacement;
	});

	// resolve the variable
	value = value.split(cssVariable).join(cssReplacement);

	// recursively resolve any remaining variables
	if (/\bvar\(/.test(value)) {
		value = _replaceValue(value);
	}

	return value;

};

var _postcss = function (css, opts) {
	return postcss().use(this.processor).process(css, opts);
};

exports.processor = _process;
exports.postcss = _postcss;