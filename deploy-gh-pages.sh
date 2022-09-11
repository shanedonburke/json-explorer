#!/bin/bash

# abort on errors
set -e

git checkout main

# clean deployed files
if [[ -f "dist" ]]; then
    rm -rf dist
    git add -A
    git commit -m "Remove dist directory"
    git push
fi

# build main branch
npm run build

sleep 5s

# deploy
git add --force dist
git commit -m 'Deploy to Github Pages'
git push origin `git subtree split --prefix dist main`:gh-pages --force

# don't push dist/ to main branch
git checkout main
git reset --hard HEAD~1

rm -rf dist/
