.PHONY: default test

NODE_VERSION := $(shell node -v | awk -F. '{sub(/v/,""); print $$1}')

default: test


test:
	gulp clean
	gulp build test
	@if [ "$(NODE_VERSION)" -ge 8 ]; then echo nodejs=$(NODE_VERSION); npm run coverage:run; fi
