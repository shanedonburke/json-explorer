#!/bin/bash

# abort on errors
set -e

# build
npm run build

# deploy
git add --force dist
git commit -m 'deploy'
git subtree push --prefix=dist https://github.com/shanedonburke/json-explorer.git gh-pages