# BT

Folders that might be interesting to contributers are the following:

## Fingerprints
The fingerprints used to detect bundles grouped by the different bundler software.
These fingerprints are used by the (https://github.com/zenoj/BT/blob/master/applyFingerPrints.js) function "detect", to identify bundled code.


## File scraper.js
was used for the crawling task.
It detects and writes the bundles to a file in a certain form, so that we can parse out the important parts more easily later on.

## BundleStats
BundleStats/runWebpackAnalysis.js analyses all files in a directory to find identified webpack bundles and parses out the important parts to
write a report about it.
This report can be used for further processing.

## Sourcemaps
Function sourceMapFinder(): is a function that takes a javascript file and the url 
where it was found and tries to download the sourcemap from it. 
Before the sourcemap is returned, we group together the found libraries mentioned in the sourcemap.
This last step is done by createSCCsToSizeFromSourceMap().

## Webpack
analyseWebpack.js (function "analyseBundle") contains the logic that is used by runWebpackAnalysis.js to extract the important parts from a bundle.

## LibraryStudy
Code inside here is used to detect libraries inside bundled code, through static analysis.

### bundleLibraries
Is used to build a feature database for a particular library. These features are then used to detect a library in a bundle and its particular version.

### identifyLodash
Contains files to extract features from bundle files (computeScore/writeFeaturesOfFile.js), and compute a similarity score to each version of a particular library (identifyLodash.py in this case we only search for lodash.js).

An additional criteria to determine a specific library version is by looking at the unique features of that version. This can be done with uniqueFeaturesAnalysis.py.

### similarVersions
Contains a small study on how similar lodash versions are considering a set of certain features types.




