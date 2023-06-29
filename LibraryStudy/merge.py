import json
import os


def mergeBundleCount(basedir, outdir):
    maxBundles = 0
    maxBundlesURL = 0
    files = os.listdir(basedir)
    for file in files:
        with open(basedir + "/" + file) as f:
            obj = json.load(f)
        if obj["maxBundles"] > maxBundles:
            maxBundles = obj["maxBundles"]
            maxBundlesURL = obj["maxBundleURL"]
    result = {"maxBundles": maxBundles, "maxBundleURL": maxBundlesURL}
    filename = f"{outdir}/merged.json"
    with open(filename, "w") as g:
        json.dump(result, g)


def mergeSubRoot(dir):
    maxRoot = 0
    maxSub = 0
    maxRootURL = ""
    maxSubURL = ""
    files = os.listdir(dir)
    for file in files:
        with open(dir + "/" + file) as f:
            obj = json.load(f)
        if obj["maxvalueSubmodules"] > maxSub:
            maxSub = obj["maxvalueSubmodules"]
            maxSubURL = obj["maxSubmodulesUrl"]
        if obj["maxvalueRootModules"] > maxRoot:
            maxRoot = obj["maxvalueRootModules"]
            maxRootURL = obj["maxRootModuleUrl"]   

    result = {"maxRoot":maxRoot, "maxRootURL": maxRootURL, "maxSub":maxSub, "maxSubURL": maxSubURL}         
    
