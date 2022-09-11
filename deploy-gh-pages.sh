#!/bin/bash

# abort on errors
set -e

# build main branch
git checkout main
npm run build

# deploy
git add --force dist
git commit -m 'deploy'
git subtree push --force --prefix=dist https://github.com/shanedonburke/json-explorer.git gh-pages

# don't push dist/ to main branch
git reset --hard HEAD~1
