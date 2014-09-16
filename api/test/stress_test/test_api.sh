#!/bin/bash
TARGET_URL="http://api.pairs.cc/"
loadtest -c 2 -t 3 --rps 20 $TARGET_URL
