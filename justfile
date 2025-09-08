export PATH := "./node_modules/.bin:" + env_var("PATH")

default:
	@just --list

sync:
	astro sync

lint: sync
	astro check --minimumFailingSeverity=hint
	prettier --check source
	eslint . --cache --cache-location "./target/eslintcache" --cache-strategy content --max-warnings 0 --concurrency=auto
	jscpd source

lint-fix:
	prettier --log-level warn --write .
	eslint --fix .

@compile: sync
	vue-tsc

@develop $FORCE_COLOR="1":
	tsx ./source/start-develop.ts

@build:
	astro build

@preview:
	astro preview

@test-unit *options:
	vitest {{options}}

test: sync compile lint (test-unit "--run")
