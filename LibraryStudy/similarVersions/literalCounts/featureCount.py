import json
import os

def getAllFileNames(startDir, filenamePattern):
    cfiles = []
    for root, dirs, files in os.walk(startDir):
        for file in files:
            filepath = os.path.join(root, file)
            if filenamePattern(filepath):
                cfiles.append(filepath)
    return cfiles



def cleanupLiterals(A):
    A["thisUsages"] = [A["thisUsages"]]
    for k, v in A.items():
        for idx, e in enumerate(v):
            if not isinstance(e, str):
                v[idx] = str(e)
        v = set(v)
    return A

def serialize_sets(obj):
    if isinstance(obj, set):
        return list(obj)

    return obj



def countFeatures():
    featureFiles = getAllFileNames("/home/jay/github/LibraryDetection/ExampleLibraries/lodash/versions", isFeatureFile)
    litTypes = ["stringLiterals", "numbers", "instanceofInst", "methodnames", "classAttributesThis"]
    featureCounts = {"stringLiterals":{}, "numbers":{}, "instanceofInst":{}, "methodNames": {}, "classAttributesThis": {}, "thisUsages":{}}
    for file in featureFiles:
        # extract library and version
        version = file.split("versions/")[1].split("/")[0]
        size = len(file.split("/"))
        module = file.split("/")[size - 2]
        features = {}
        with open(file) as f:
            features = json.load(f)
        features = cleanupLiterals(features)
        # do only use set of features first later maybe also count of the features
        for litType in litTypes:
            for s in set(features[litType]):
                if s not in featureCounts[litType].keys():
                    featureCounts[litType][s] = set()
                featureCounts[litType][s].add(f"{module}_v{version}")
        
        # this usages
        thisUsages = features["thisUsages"][0]
        if thisUsages not in featureCounts["thisUsages"].keys():
            featureCounts["thisUsages"][thisUsages] = set()
        featureCounts["thisUsages"][thisUsages].add(f"{module}v_{version}")
    
    out_file = open("featureToVersion.json", "w")
    json.dump(featureCounts, out_file, indent = 4, default=serialize_sets)
    out_file.close()

countFeatures()






            