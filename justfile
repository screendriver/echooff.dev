export PATH := "./node_modules/.bin:" + env_var("PATH")
export NODE_OPTIONS := "--max-old-space-size=4096"

default:
	@just --list

sync:
	astro sync --force

lint: sync
	astro check --minimumFailingSeverity=hint
	prettier --check source tests
	eslint . --cache --cache-location "./target/eslintcache" --cache-strategy content --max-warnings 0

lint-fix:
	prettier --log-level warn --write .
	eslint --fix .

@compile: sync
	tsc

@develop $FORCE_COLOR="1":
	node ./source/start-develop.ts

@build:
	astro build

@preview:
	astro preview

test-unit *options: sync
	mocha --config mocha.config.unit-tests.cjs {{options}}

test-content *options: sync
	mocha --config mocha.config.content-tests.cjs {{options}}

test: sync compile test-unit test-content lint
