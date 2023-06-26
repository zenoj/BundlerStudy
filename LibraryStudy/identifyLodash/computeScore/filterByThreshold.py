import json
import os
import sys

def getAllFileNames(startDir, filenamePattern):
    cfiles = []
    for root, dirs, files in os.walk(startDir):
        for file in files:
            filepath = os.path.join(root, file)
            if filenamePattern(filepath):
                cfiles.append(filepath)
    return cfiles

def isScoreFile(filepath):
    return filepath.endswith("scores.json")

def extractThresholdFiles():
    startDir = sys.argv[1]
    threshold = float(sys.argv[2])
    scoreFiles = getAllFileNames(startDir, isScoreFile)
    aboveThreshold = {}
    score = {}
    for sFile in scoreFiles:
        with open(sFile) as f:
            score = json.load(f)
            for targetFile, simObj in score.items():
                for dbFile, simScore in simObj.items():
                    if simScore > threshold:
                        if targetFile not in aboveThreshold:
                            aboveThreshold[targetFile] = {}
                        aboveThreshold[targetFile][dbFile] = simScore
    # write files above threshold
    with open(f"{startDir}/above{threshold}%Score.json", "w") as g:
        json.dump(aboveThreshold, g)

extractThresholdFiles()
