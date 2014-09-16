#!/bin/bash
TARGET_URL="http://pairs-web.herokuapp.com/"
loadtest -c 2 -t 3 --rps 20 $TARGET_URL
