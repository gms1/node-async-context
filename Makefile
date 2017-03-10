.PHONY: default test

default: test

test:
	gulp clean
	gulp build test

