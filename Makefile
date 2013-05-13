
build: components index.js
	@component-build --dev

components: component.json
	@component-install --dev

node_modules: package.json
	@npm install

test: components node_modules
	node test/server.js

clean:
	rm -rf node_modules components build

.PHONY: clean test
