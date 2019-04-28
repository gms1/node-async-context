.PHONY: default test

NODE_VERSION := $(shell node -v | awk -F. '{sub(/v/,""); print $$1}')

default: test

test:
	@echo nodejs=$(NODE_VERSION)
	npm run rebuild
	@if [ "$(NODE_VERSION)" -gt 4 ]; then npm run lint; fi
	npm run test:run
	@if [ "$(NODE_VERSION)" -gt 6 ]; then npm run coverage:run; fi

