#!/bin/bash

# `lerna version` doesn't update package-lock.json for npm 7
# so we disable Lerna auto-tagging/pushing and do it ourself
# See https://github.com/lerna/lerna/issues/2891

# Get the tag from the lerna file
tag=v$(node -e "process.stdout.write(require('./lerna.json').version)");

# Update the package-lock.json
npm i --package-lock-only

# Update the previous commit
git commit --all -m ${tag}

# Replace the existing tag
git tag -a ${tag} -m ${tag}

# Push the changes
git push --tags
git push
