.PHONY: default test

NODE_VERSION := $(shell node -v | awk -F. '{sub(/v/,""); print $$1}')

default: test

test:
	npm run release:build
	npm run coverage:report
	npm run coverage:html
