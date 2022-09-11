#!/bin/bash

# abort on errors
set -e

# build main branch
git checkout main
npm run build

# move change to gh-pages branch
git stash push -- dist/ --include-untracked
git checkout gh-pages
git stash pop

# deploy
git add --force dist
git commit -m 'deploy'
git subtree push --prefix=dist https://github.com/shanedonburke/json-explorer.git gh-pages

# return to main branch
git checkout main