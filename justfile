export PATH := "./node_modules/.bin:" + env_var("PATH")
export NODE_OPTIONS := "--max-old-space-size=4096"

default:
	@just --list

sync:
	astro sync --force

lint: sync
	astro check --minimumFailingSeverity=hint
	prettier --check source
	eslint . --cache --cache-location "./target/eslintcache" --cache-strategy content --max-warnings 0

lint-fix:
	prettier --log-level warn --write .
	eslint --fix .

@compile: sync
	tsc

@develop $FORCE_COLOR="1":
	tsx ./source/start-develop.ts

@build:
	astro build

@preview:
	astro preview

@test-unit *options: sync
	vitest {{options}}

test: sync compile (test-unit "--run") lint
