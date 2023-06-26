# Project "Jack-in-the-box: An Empirical Study of JavaScript Bundling on the Web and its Security Implications"
This repository contains the measurement framework for the paper "Jack-in-the-box: An Empirical Study of JavaScript Bundling on the Web and its Security Implications". The framework consists of three steps: crawling and bundle identification, bundle reversing, and security analysis.
The crawling step is implemented in the file: scraper.js. It uses the fingerprints located in the folder with the same name to identify bundled code from 5 different bundlers. The most popular bundler is Webpack, our further analysis therefore focueses on Webpack bundles. 
BundleStats/runWebpackAnalysis.js is used for the bundle reversing step, which includes the analysis of sourcemaps (if available). In the best case this step outputs library names which we can use to query: https://api.npms.io/v2/ and https://security.snyk.io/package/npm/ for the security analysis in the last step.
As an additional effort we include a methodology to identify libraries and their respective versions using static analysis techniques. The implementation for this is contained in the LibraryStudy folder.


## Fingerprints
The fingerprints used to detect bundles grouped by the different bundler software.
These fingerprints are used by the (https://github.com/zenoj/BT/blob/master/applyFingerPrints.js) function "detect", to identify bundled code.


## File scraper.js
was used for the crawling task.
It detects and writes the bundles to a file in a certain form, so that we can parse out the important parts more easily later on.

## BundleStats
BundleStats/runWebpackAnalysis.js analyses webpack bundles and tries to extract the included CommonJS modules and outputs a report about it. In this step it also
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
Contains a small study on how similar lodash versions are considering a set of certain feature types.




