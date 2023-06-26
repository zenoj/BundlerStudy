import collections
import json


def filterUniqLT(n):
    with open("/home/jay/thesis/LibraryDetection/similarVersions/featureUniqCount.json", "r") as f:
        data = json.load(f)

    for version, litTypes in data.items():
        for litType, litCount in litTypes.items():
            litTypes[litType] = {k: v for k, v in litCount.items() if v < n}
    simPath = "/home/jay/thesis/LibraryDetection/similarVersions"
    out_file = open(f"{simPath}/featureUniqCountLT{n}.json", "w")
    json.dump(data, out_file, indent = 4)
    out_file.close() 


def quantifyResult():
    # run 1-10
    for i in range(10):
        with open(f"/home/jay/thesis/LibraryDetection/similarVersions/featureUniqCountLT{i+1}.json", "r") as f:
            data = json.load(f)
        print(f"The following library versions have literals that identify them with {i+1}-anonymity:")
        # print following characteristics: how many have one that identifies them
        kAnonymVersions = {}
        for version, litTypes in data.items():
            for litType, litCount in litTypes.items():
                for lit, count in litCount.items():
                    if count < i+1:
                        if version in kAnonymVersions and kAnonymVersions[version] > count:
                            kAnonymVersions[version] = count
                        else:
                            kAnonymVersions[version] = count
        od = collections.OrderedDict(sorted(kAnonymVersions.items()))
        simPath = "/home/jay/thesis/LibraryDetection/similarVersions"
        out_file = open(f"{simPath}/{i+1}_unique_versions.json", "w")
        json.dump(od, out_file, indent = 4)
        out_file.close()

    # show how unique versions are with this
    
quantifyResult()