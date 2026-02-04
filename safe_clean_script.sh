#!/bin/bash

echo "Start script - clean all text data and fileNames recursively"
find . -type f -exec sed -i '' $'s/Ryan/My Human/g' {} \;
find . -type f -exec sed -i '' $'s/ryan/my Human/g' {} \;

echo "Done and complete "