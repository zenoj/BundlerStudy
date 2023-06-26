import json
import os
import compareLibraries


def getAllLodash():
    basepath = "/home/jay/thesis/LibraryDetection/ExampleLibraries/lodash/versions"
    versions = os.listdir(basepath)
    files = []
    for v in versions:
        files.append(os.path.join(basepath, v, "modules", "lodash.js", "bundle.jsfeatures"))
    return files

def computeUniqueFeatures():
    lodashjsFiles = getAllLodash()
    # for each version we have a dict of the three feature classes
    similarities = {}
    objList = []

    for l in lodashjsFiles:
        versionl = l.split("/")[8]
        # prepare dicts
        similarities[versionl] = {}
        with open (l) as f:
            obj1 = json.load(f)
            obj1 = cleanupLiterals(obj1)
            similarities[versionl]["stringLiterals"] = dict.fromkeys((obj1["stringLiterals"]), 0) 
            similarities[versionl]["numbers"] = dict.fromkeys(obj1["numbers"], 0)
            similarities[versionl]["instanceofInst"] = dict.fromkeys(obj1["instanceofInst"], 0)
            similarities[versionl]["methodnames"] = dict.fromkeys(obj1["methodnames"], 0)
            similarities[versionl]["classAttributesThis"] = dict.fromkeys(obj1["classAttributesThis"], 0)
            similarities[versionl]["thisUsages"] = dict.fromkeys(obj1["thisUsages"], 0)

            
    for idx1 in range(len(lodashjsFiles)):
        # extract version
        print("starting with index:", idx1)
        f1 = lodashjsFiles[idx1]
        versionf1 = f1.split("/")[8]
        for idx2 in range(idx1 + 1,len(lodashjsFiles)):
            f2 = lodashjsFiles[idx2]
            # extract version
            versionf2 = f2.split("/")[8]           
            CountLiteralsAinB(similarities[versionf1], similarities[versionf2])
    
    # dump the data again into json
    simPath = "/home/jay/thesis/LibraryDetection/similarVersions"
    out_file = open(f"{simPath}/featureUniqCount.json", "w")
    json.dump(similarities, out_file, indent = 4)
    out_file.close() 


def CountLiteralsAinB(A, B):
    for litType1, lits in A.items():
        for lit,c  in lits.items():
            if lit in B[litType1]:
                A[litType1][lit] += 1
                B[litType1][lit] += 1
                

def cleanupLiterals(A):
    A["thisUsages"] = [A["thisUsages"]]
    for k, v in A.items():
        for idx, e in enumerate(v):
            if not isinstance(e, str):
                v[idx] = str(e)
        v = set(v)
    return A

computeUniqueFeatures()