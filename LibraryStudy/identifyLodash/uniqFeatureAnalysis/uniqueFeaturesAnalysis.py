import json
import sys

def cleanupLiteralsDelThisUsages(A):
    A["thisUsages"] = []
    # for k, v in A.items():
    #     if k == "thisUsages":
    #         continue
    #     for idx, e in enumerate(v):
    #         if not isinstance(e, str):
    #             v[idx] = str(e)
    return A
    
# testForUniqueFeatures: reduce possibleVersions.JSON if possible with unique feature analysis
def testForUniqueFeatures():
    fingerprints, possibleVersionsJSON = sys.argv[1:3]
    res = {}
    FPs = {}
    features = {}
    with open(fingerprints) as fpp:
        FPs = json.load(fpp)
    with open(possibleVersionsJSON) as fp:
        versions = json.load(fp)
    for rootModule, versionpaths in versions.items():
        # load features of root module
        with open(rootModule) as rt:
            features = json.load(rt)
        # extract versions
        filteredVersions = [a.split("lodash/versions/")[1].split("/modules/")[0] for a in versionpaths]

        # construct dict mapping features:possible versions
        # features are arrays, therefore we tuple them to create a valid key
        FPDict = {}
        for version, obj in FPs.items():
            feats = obj["features"]
            vers = obj["similarVersions"]
            vers.append(version)
            FPDict[tuple(feats)] = vers

        # search through file if there are some unique features
        features = cleanupLiteralsDelThisUsages(features)
        possibleVersions = set()
        allIn = False
        for litType, lits in features.items():
            for featTuple, versions in FPDict.items():
                allIn = True
                for feat in featTuple:
                    if feat not in lits:
                        allIn = False
                        break
                if allIn:
                    possibleVersions = possibleVersions | set(versions)
        tmp = list(possibleVersions.intersection(filteredVersions))
        if len(tmp) == 0:
            res[rootModule] = filteredVersions
        else:            
            res[rootModule] = tmp
    outPath = possibleVersionsJSON.replace("thresholdScores.json", "uniqFeatAnalysis.json")
    with open(outPath, 'w') as u:
        json.dump(res, u)
testForUniqueFeatures()
