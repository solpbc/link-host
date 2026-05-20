# link-host — Makefile entry points.
#
# The npm scripts in package.json are the authoritative tasks; this file
# exposes them under the conventional `make <target>` shape that sol pbc's
# tooling (hopper, install playbooks) expects across repos.

.PHONY: install typecheck lint deploy dev

install:
	npm ci

typecheck:
	npm run typecheck

lint:
	npm run lint

deploy:
	npm run deploy

dev:
	npm run dev
