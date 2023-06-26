#!/usr/bin/bash
databaseDir=$1
targetDir=$2
outDir=$3
mkdir $outDir -p
for dir in "$targetDir"/*; do
    # echo "would execute: python3 identifyLodash.py $databaseDir $dir $outDir 90"
    python3 ./identifyLodash.py $databaseDir $dir $outDir 90 &
done
wait
echo "jobs finished"
