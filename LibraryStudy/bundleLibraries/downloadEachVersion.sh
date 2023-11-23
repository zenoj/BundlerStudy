#!/usr/bin/bash
library=$1
outbasepath=$2
mkdir -p $outbasepath/$library
npm view $library versions > $outbasepath/$library/versionList.txt
python3 ./parseArray.py $library $outbasepath/$library/versionList.txt
cd $outbasepath
cat $outbasepath/$library/versionList.txt | while read line 
do
    npm i $library$line@npm:$library@$line
    
done
