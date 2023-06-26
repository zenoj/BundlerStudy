import os
import json

def getAllLodashFeatures(startDir):
    basepath = startDir
    versions = os.listdir(basepath)
    files = []
    for v in versions:
        files.append(os.path.join(basepath, v, "modules", "lodash.js", "bundle.jsfeatures"))
    return files

# use repeated intersection for least common features to find combination that yields uniqueness.    
# and if we cannot have uniqueness, then we straight away get the list of libraries we could have in front of us.
def generateFPs():
    
    litCountObj = {}
    with open('/home/jay/thesis/LibraryDetection/similarVersions/literalCounts/VersionsToFeatures.json') as f:
        litCountObj = json.load(f)

    fullFeaturesminheap = {}
    flatDict = {}
    for version, literals in litCountObj.items():
        tmpFeatures = {}
        for litType, obj in literals.items():
            tmpFeatures = obj | tmpFeatures
        fullFeaturesminheap[version] = sorted(tmpFeatures.items(), key=lambda i: len(i[1]))
        flatDict[version] = dict(sorted(tmpFeatures.items(), key=lambda i: len(i[1])))
    similarVersions = []
    fingerprints = {}
    i = 1
    for version, lits in flatDict.items():
        # pick least common feature
        fingerprints[version] = {}
        fingerprints[version]["features"] = []
        fingerprints[version]["similarVersions"] = []
        lcf = fullFeaturesminheap[version][0][0]
        fingerprints[version]["features"].append(lcf)
        possibleVersions = set(flatDict[version][lcf])

        while(len(possibleVersions) > 0 and len(flatDict[version]) != i):
            print("feature", i)
            lcf = fullFeaturesminheap[version][i][0]
            p = set(flatDict[version][lcf])
            if len(possibleVersions.intersection(set(flatDict[version][lcf]))) < len(possibleVersions):
                possibleVersions = possibleVersions.intersection(set(flatDict[version][lcf]))
                fingerprints[version]["features"].append(lcf)
            i += 1
        fingerprints[version]["similarVersions"] = list(possibleVersions)    
        i = 1    

    with open('/home/jay/thesis/LibraryDetection/similarVersions/fingerprints.json', "w") as h:
        json.dump(fingerprints, h)

    # merge features of each library version into fullFeatures to find least common feature
    

generateFPs()
