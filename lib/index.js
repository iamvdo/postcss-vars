var postcss = require('postcss');

var _process = function (css) {

	var variables = [];
	var varStartIdentifier = '--';
	var refStartIdentifier = 'var(';

	// for each rules
	css.eachRule(function (rule) {

		// if selector is :root
		if (rule.selectors.length === 1 && rule.selectors[0] === ':root') {
			// for each declaration
			rule.each(function (decl) {
				// it property begin with "var-"
				if (decl.prop.indexOf(startIdentifier) === 0) {
					// keep this variable
					variables[decl.prop] = decl.value;
				}
			});

		// else, it's not :root
		} else {

			// for each declaration
			rule.each(function (decl) {
				// if it's a declaration and value contains "var("
				if (decl.type === 'decl' && decl.value.indexOf(refStartIdentifier) !== -1) {

					var val = decl.value;

					var arrayVars = decl.value.split(refStartIdentifier);
					arrayVars.splice(0,1);

					for (var i = 0, len = arrayVars.length; i < len; i++) {

						// get the start
						var idStart = 0;

						// find the end
						var idEnd = idStart + 1;
						var depth = 1;
						var currentChar;
						while ( idEnd < arrayVars[i].length && depth > 0) {
							currentChar = arrayVars[i].charAt(idEnd);
							if (currentChar == '(') {
								depth++;
							}
							if (currentChar == ')') {
								depth--;
							}
							idEnd++;
						}
						// yeah, it's ok
						// get the variable
						var variable = arrayVars[i].substring(0, idEnd -1);

						// replace
						// regexp begins with "var(" variable ")"
						val = val.replace(/var\(([a-zA-Z0-9\- ]+)\)/, function (match, p1) {
							return variables[p1.trim()];
						});

					}

					// create a new value
					var newValue = val;

					// insert a new declaration
					rule.insertBefore(decl, { prop: decl.prop, value: newValue });

				};
			});
		}

		return css;
	});

};

var _pack = function (css, opts) {
	return postcss().use(this.processor).process(css, opts);
};

exports.processor = _process;
exports.pack = _pack;