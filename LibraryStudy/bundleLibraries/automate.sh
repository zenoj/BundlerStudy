#!/usr/bin/bash
library=$1
outbasepath=$2
modulespath=$3
mkdir -p $outbasepath/$library
npm view $library versions > $outbasepath/$library/versionList.txt
python3 $outbasepath/bundleLibraries/parseArray.py $library $outbasepath/$library/versionList.txt
cd $outbasepath
cat $outbasepath/$library/versionList.txt | while read line 
do
    npm i $library$line@npm:$library@$line
    echo $modulespath/$library$line/
    echo $library$line
    echo $outbasepath
    # bundle all files in the modules directory
    python3 ./bundleLibraries/bundleLibrary.py $modulespath/$library$line/ $library $line $outbasepath & 
    node ./bundleLibraries/collectFeatures.js $outbasepath/ExampleLibraries/$library/versions/$line/modules/ &
done
