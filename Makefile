.PHONY: default test

NODE_VERSION := $(shell node -v | awk -F. '{sub(/v/,""); print $$1}')

default: test

test:
	npm run rebuild
	npm run lint
	npm run test:run
	@echo nodejs=$(NODE_VERSION)
	@if [ "$(NODE_VERSION)" -gt 6 ]; then npm run coverage:run; fi

