#!/bin/bash

# abort on errors
set -e

# build
npm run build

# deploy
git add -A --force
git commit -m 'deploy'
git subtree push --prefix=dist https://github.com/shanedonburke/json-explorer.git gh-pages