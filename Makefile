# link-host — Makefile entry points.
#
# The npm scripts in package.json are the authoritative tasks; this file
# exposes them under the conventional `make <target>` shape that sol pbc's
# tooling (build agents, install playbooks) expects across repos.

.PHONY: install typecheck lint test ci deploy dev i18n-dev

install:
	npm ci --ignore-scripts --no-audit --no-fund

typecheck:
	npm run typecheck

lint:
	npm run lint

test:
	npm run test

ci:
	npm run ci

deploy:
	npm run deploy

dev:
	npm run dev

i18n-dev:
	node scripts/i18n.mjs --channel development
