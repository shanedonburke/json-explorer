#!/bin/bash

# abort on errors
set -e

# clean deployed files
if [[ -f "dist" ]]; then
    rm -rf dist
    git add -A
    git commit -m "Remove dist directory"
fi

git checkout --force gh-pages
git pull

# build main branch
git checkout main
npm run build

# deploy
git add --force dist
git commit -m 'deploy'
git subtree push --prefix=dist https://github.com/shanedonburke/json-explorer.git gh-pages

# don't push dist/ to main branch
git reset --hard HEAD~1
