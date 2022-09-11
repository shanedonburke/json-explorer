#!/bin/bash

git checkout main

echo '>>> Cleaning dist files...'
rm -rf dist

echo '>>> Building...'
npm run build
echo '>>> Build finished.'

echo '>>> Deploying ...'
git add --force dist
git commit -m 'Deploy to Github Pages'
git push origin `git subtree split --prefix dist main`:gh-pages --force
echo '>>> Pushed to branch gh-pages.'

# Don't push dist/ to main branch
git reset --hard HEAD~1