import json
import sys
import os

def getAllFileNames(startDir, filenamePattern):
    cfiles = []
    for root, dirs, files in os.walk(startDir):
        for file in files:
            filepath = os.path.join(root, file)
            if filenamePattern(filepath):
                cfiles.append(filepath)
    return cfiles

def isUniqueFeatureFile(filepath):
    return filepath.endswith("uniqFeatAnalysis.json")

def mergeResults():
    allOutDir = sys.argv[1]
    files = getAllFileNames(allOutDir, isUniqueFeatureFile)
    resultObj = {}
    tmp = {}
    for file in files:
        with open(file) as f:
            resultObj = {**resultObj,**(json.load(f))}
    with open("mergedResult.json", "w") as w:
        json.dump(resultObj, w)    

mergeResults()