.PHONY: default all clean build test publish

default: all test

all: clean build

clean:
	npm run clean

build:
	npm run build

test:
	npm run test

publish: all test
	cd dist && npm --access public publish

