default: develop

astro-sync:
	npx astro sync

astro-check: astro-sync
	npx astro check

prettier-check:
	npx prettier --check source

eslint:
	npx eslint . --ext ".ts"

copy-paste-detection:
	npx jscpd source

lint: astro-check prettier-check eslint copy-paste-detection

@compile:
	npx tsc

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
