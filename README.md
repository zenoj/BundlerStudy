# BT

Folders that might be interesting to contributers are the following:

## Fingerprints
The fingerprints used to detect bundles grouped by the different bundler software.
These fingerprints are used by the (https://github.com/zenoj/BT/blob/master/applyFingerPrints.js) function "detect", to identify bundled code.


## File debug.js
was used for the crawling task.
It detects and writes the bundles to a file in a certain form, so that we can parse out the important parts more easily later on.

## BundleStats
runWebpackAnalysis.js analyses all files in a directory to find identified webpack bundles and parses out the important parts to
write a report about it.
This report can be used for statistics.

## Sourcemaps
Function sourceMapGrabber(): is a function that takes a javascript file and the url 
where it was found and tries to download the sourcemap from it. 
Before the sourcemap is returned, we group the found libraries mentioned in the sourcemap together.
This last step is done by createSCCsToSizeFromSourceMap().

## Webpack
analyseWebpack.js (function "analyseBundle") contains the logic that is used by runWebpackAnalysis.js to extract the important parts from a bundle.

## Miscellaneous
Every folder that ends with stats or the folders: "recrawl", are statistics from my work.
So these will most likely be not too interesting for you.

Folder "sweetbundles" contains a list of bundle reports, that I created from bundles that contained
many libraries.




