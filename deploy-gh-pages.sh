#!/bin/bash

git checkout main

rm -rf dist

# build main branch
npm run build
echo '>>> Build finished.'

# deploy
echo '>>> Deploying ...'
git add --force dist
#git commit -m 'Deploy to Github Pages'
#git push origin `git subtree split --prefix dist main`:gh-pages --force
#echo '>>> Pushed to branch gh-pages.'

# don't push dist/ to main branch
#git reset --hard HEAD~1