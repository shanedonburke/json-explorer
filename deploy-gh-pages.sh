#!/bin/bash

# abort on errors
set -e

# build main branch
git checkout main
npm run build

# move change to gh-pages branch
git add --force dist
git stash push -- dist
git checkout gh-pages
git stash pop

# deploy
git commit -m 'deploy'
git subtree push --force --prefix=dist https://github.com/shanedonburke/json-explorer.git gh-pages

# return to main branch
git checkout main