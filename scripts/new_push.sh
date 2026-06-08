#!/bin/bash
# git push

# git add . && git commit --amend  && git push -f

nowTime=$(date "+%Y-%m-%d %H:%M:%S")

git add .

git -c user.email="ivalue2333@gmail.com" commit -m "feat: better cal ${nowTime}"

git push




