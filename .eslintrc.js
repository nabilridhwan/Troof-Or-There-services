module.exports = {
	env: {
		es2021: true,
		node: true,
	},
	extends: "standard-with-typescript",
	overrides: [],
	parserOptions: {
		ecmaVersion: "latest",
		sourceType: "module",
	},
	rules: {
		quotes: ["error", "double"],
		"comma-dangle": ["error", "always-multiline"],
		indent: ["error", "tab"],
		"no-tabs": "off",
		semi: ["error", "always"],
	},
};
