postcss-vars
============

Add a "not so bad" CSS custom properties support to your CSS, using [PostCSS](https://github.com/ai/postcss). **This is not a polyfill**. Native custom properties are way more powerful, due to cascade and inheritance.

Largely inspired by [rework-vars](https://github.com/reworkcss/rework-vars).

##Install

```js
npm install postcss-vars
```

##Use

Only variables defined in `:root` (and not in media-queries) will be used. Let's take this css:

```css
:root {
	--color-one: blue;
	--color-two: green;
	--color-three: var(--color-two);
}
.elem {
	color: var(--color-one);
}
.item {
	background: linear-gradient(var(--color-two), red);
}
@media (min-width: 50em) {
	.elem {
		color: var(--color-two);
	}
}
```

Fix variables, and you will get the following output:

```css
:root {
	--color-one: blue;
	--color-two: green;
	--color-three: var(--color-two);
}
.elem {
	color: blue;
}
.item {
	background: linear-gradient(green, red);
}
@media (min-width: 50em) {
	.elem {
		color: green;
	}
}
```

Warning: You can use a fallback value too, which is used as the substitution value if the variable is undefined. Pay attention that the CSS Custom properties module define the fallback value as a subsitution if the variable is invalid (eg. `color: var(--foo)` when `--foo: 20px` is set).

```css
:root {

}
.elem {
	color: var(--color, red);
}
```


##API

###processor

This is the core function. Combine it with others PostCSS plugins, such as Autoprefixer:

```js
var autoprefixer = require('autoprefixer'),
	postcssVars = require('postcss-vars'),
	postcss = require('postcss');
var fixed = postcss().
			use(postcssVars.processor).
			use(autoprefixer.postcss).
			process(css).css;
```

###postcss

This is the full process function. Pass the `css` as the first argument and grab your fixed CSS.

```js
var postcssVars = require('postcss-vars');
var fixed = postcssVars.postcss(css).css;
```

##License
MIT