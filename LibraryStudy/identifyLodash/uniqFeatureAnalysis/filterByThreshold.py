import json
import sys

def filterByThreshold():
    filepath, thresholdstr = sys.argv[1:3]
    threshold = float(thresholdstr)
    filteredFeatureFile = {}
    features = {}
    with open(filepath) as fp:
        features = json.load(fp)
    for rootModule, scoreObj in features.items():
        tmp = {k: v for k, v in scoreObj.items() if v > threshold }
        if len(tmp.keys()) != 0:
            filteredFeatureFile[rootModule] = tmp
    outpath = filepath.replace("scores.json", "thresholdScores.json")
    with open(outpath, "w") as w:
        json.dump(filteredFeatureFile, w)

filterByThreshold()