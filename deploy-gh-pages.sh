#!/bin/bash

# abort on errors
set -e

git checkout main

# clean deployed files
if [[ -f "dist" ]]; then
    rm -rf dist
    git add --force dist
    git commit -m "Remove dist directory"
    git push
fi

# build main branch
npm run build

echo '> Build finished.'

# deploy
echo '> Deploying...'
git add --force dist
echo "$(git status)"
git commit -m 'Deploy to Github Pages'
git push origin `git subtree split --prefix dist main`:gh-pages --force

# don't push dist/ to main branch
git reset --hard HEAD~1

rm -rf dist/
