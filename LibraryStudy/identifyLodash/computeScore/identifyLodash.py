import json
import os
import sys
import compareLibraries1 as compareLibraries1
import pathlib

def getAllFileNames(startDir, filenamePattern):
    cfiles = []
    for root, dirs, files in os.walk(startDir):
        for file in files:
            filepath = os.path.join(root, file)
            if filenamePattern(filepath):
                cfiles.append(filepath)
    return cfiles

def isFeatureFile(filepath):
    return filepath.endswith("_features.json")

def isBundlejsFeatureFile(filepath):
    return filepath.endswith("bundle.jsfeatures")

def isFullLodashJsFile(filepath):
    return filepath.endswith("lodash.js/bundle.jsfeatures")

def computeScore(diff):
    score = 0
    c = 0
    diff["this"]["this"] *= 100
    for k,v in diff.items():
        for m,n in v.items():
            if n >= 0:
                c += 1
                score += n
    return score/c

def sortVersions(versions):
    return versions.sort(key=lambda s: [int(u) for u in s.split('.')])

# outputs a json file that includes for each filename the list of files that have at least 90% similarity
def compareWithLodash(databaseDir, targetDir, outpath):
    # databaseDir, targetDir, outpath = sys.argv[1:4]
    nr = targetDir.split("/")[-1]
    databaseFiles = getAllFileNames(databaseDir, isFullLodashJsFile)
    featureFilePaths = getAllFileNames(targetDir, isFeatureFile)
    databaseFiles_Features = {}
    comp = {}
    scores = {}
    # load files from database
    for dFile in databaseFiles:
        dFileFeatures = {}
        with open(dFile) as d:
            tmp2 = json.load(d)
            dFileFeatures = compareLibraries1.transformLiterals(tmp2)
            databaseFiles_Features[dFile]= dFileFeatures
    # extract features from targetFile
    targetFile_Features = {}
    for featureFile in featureFilePaths:
        with open(featureFile) as ff:
            tmp1 = json.load(ff)
            targetFile_Features = compareLibraries1.transformLiterals(tmp1)
            comp[featureFile] = {}
            scores[featureFile] = {}
             # compare them with all database files
            for dFile,dFeatures in databaseFiles_Features.items():
                diff = compareLibraries1.compareAll(targetFile_Features, dFeatures)
                comp[featureFile][dFile] = diff
                score = computeScore(diff)
                scores[featureFile][dFile] = score
                
        print(featureFile, "compared")
    
    pathlib.Path(f"{outpath}/{nr}").mkdir(exist_ok=True)
    with open(f"{outpath}/{nr}/scores.json", "w") as f:
        json.dump(scores, f)
    with open(f"{outpath}/{nr}/comparison.json", "w") as g:
        json.dump(comp, g)
    
 
    # use threshold to select group of similar versions
    # similarVersions = []
    # for path, score in scores.items():
    #     if score > threshold:
    #         similarVersions.append(path)
    # # compute version range
    # versionRange = set()
    # for v in similarVersions:
    #     # modulename = dFile.split("modules/")[1].split("/")[0].replace(".js", "")
    #     version = dFile.split("/modules")[0].split("/")[-1]
    #     versionRange.add(version)
    # # sort range
    # sortedVersions = sortVersions(versionRange)
    # print("is 90%% similar to the following versions", sortedVersions)
    # # findUnique features in files

# compareWithLodash()


# def testIdentifyLodash(databaseDir, targetFeatureDir, threshold):
#     files = getAllFileNames(targetFeatureDir, isFeatureFile)
#     for f in files:
#         identifyLodash(databaseDir, f, threshold)

