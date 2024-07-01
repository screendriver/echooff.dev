default:
	@just --list

lint:
	npx astro sync
	npx astro check
	npx prettier --check source
	npx eslint . --ext ".ts,.vue"
	npx jscpd source

@compile:
	npx vue-tsc

@develop $FORCE_COLOR="1":
	npx tsx ./source/start-develop.ts

@build:
	npx astro build

@preview:
	npx astro preview

@test-unit: compile
	npx ava

@test-unit-coverage: compile
	npx c8 ava
