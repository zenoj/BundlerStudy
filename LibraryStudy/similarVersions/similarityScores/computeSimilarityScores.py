# how many similar versions are there concerning the different attributes and a similarity param s
import json
import os
import compareLibraries

def getAllFileNames(startDir, filenamePattern):
    cfiles = []
    for root, dirs, files in os.walk(startDir):
        for file in files:
            filepath = os.path.join(root, file)
            if filenamePattern(filepath):
                cfiles.append(filepath)
    return cfiles

def getAllLodash(startDir):
    versions = os.listdir(startDir)
    files = []
    for v in versions:
        files.append(os.path.join(startDir, v, "modules", "lodash.js", "bundle.jsfeatures"))
    return files

BASEPATH = ""
VERSIONPATH = ""

def uniqueness(basepath, versionpath):
    # version maps to different literals which in turn map to array of similiar versions
    similarities = {}
    lodashjsFiles = getAllLodash(versionpath)
    # preopen all files
    objList = []
    for l in lodashjsFiles:
        versionl = l.split("/")[8]
        # prepare dicts
        similarities[versionl] = {}
        with open (l) as f:
            objList.append(json.load(f))
    
    for idx1 in range(len(lodashjsFiles)):
        # extract version
        print("starting with index:", idx1)
        f1 = lodashjsFiles[idx1]
        versionf1 = f1.split("/")[8]
        for idx2 in range(idx1 + 1,len(lodashjsFiles)):
            f2 = lodashjsFiles[idx2]
            # extract version
            versionf2 = f2.split("/")[8]
            if f1 == f2: continue
            diff = compareLibraries.compareAll(objList[idx1], objList[idx2])
            similarities[versionf1][versionf2] = diff
            similarities[versionf2][versionf1] = diff
            # if computeScore(diff) > s:
            #     similarities[versionf1].append(versionf2)
            #     similarities[versionf2].append(versionf1)
            
    # out_file = open(f"{simPath}/all.json", "w")
    # json.dump(similarities, out_file, indent = 4)
    # out_file.close() 

def computeScore(diff):
    score = 0
    c = 0
    diff["this"]["this"] *= 100
    for k,v in diff.items():
        for m,n in v.items():
            if n > 0:
                c += 1
                score += n
    return score/c

uniqueness(BASEPATH, VERSIONPATH)