#!/bin/bash

# abort on errors
set -e

# build
npm run build

# if you are deploying to a custom domain
# echo 'www.example.com' > CNAME

git add -A
git commit -m 'deploy'

# if you are deploying to https://<USERNAME>.github.io/<REPO>
git subtree push --prefix=dist https://github.com/shanedonburke/json-explorer.git gh-pages