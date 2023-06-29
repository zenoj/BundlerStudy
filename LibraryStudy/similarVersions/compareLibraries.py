import difflib
import json

def reportFileComparison(filePath1, filePath2):
    # load json
    with open(filePath1) as f1:
        obj1 = json.load(f1)
    
    with open(filePath2) as f2:
        obj2 = json.load(f2)
    
    tmp =  filePath1.split("/")
    filePath1 = tmp[tmp.index("modules") - 1] + "@v" + tmp[tmp.index("modules") + 1]
    tmp =  filePath2.split("/")
    filePath2 = tmp[tmp.index("modules") - 1] + "@v" + tmp[tmp.index("modules") + 1]

    # extract literal types
    stringLits1, numbers1, instanceOf1, methods1, classAttr1, thisUsages1 = obj1["stringLiterals"], obj1["numbers"], obj1["instanceofInst"], obj1["methodnames"], obj1["classAttributesThis"], obj1["thisUsages"]
    literalsA = [stringLits1, numbers1, instanceOf1, methods1, classAttr1, thisUsages1]
    
    stringLits2, numbers2, instanceOf2, methods2, classAttr2, thisUsages2 = obj2["stringLiterals"], obj2["numbers"], obj2["instanceofInst"], obj2["methodnames"], obj2["classAttributesThis"], obj2["thisUsages"]
    literalsB = [stringLits2, numbers2, instanceOf2, methods2, classAttr2, thisUsages2]
    
    litTypes = ["STRING", "NUMBER", "INSTANCEOF", "METHOD", "CLASS_ATTR"]

    templates = {
    "AbsSimHeader":"__LITERAL_SIMILARITY__:", 
    "AbsSimResult":"{litType} literals: {AbsSim:.2f}% from {filePathA} found in {filePathB}", 
    "OrderSimHeader":"__LITERAL_ORDER_SIMILARITY__:", 
    "OrderSimResult":"{litType} literals: {same:.2f}% in order , {filePathB} added {right:.2f}%,{filePathA} added {left:.2f}%"
    }

    print(templates["AbsSimHeader"])
    for l in range(len(litTypes)):
        
        # compare absolut set of literals
        _, mutual1 = compareAbsolut(literalsA[l], literalsB[l]) 
        print( 
            templates["AbsSimResult"].format(litType = litTypes[l], AbsSim=mutual1,  filePathA = filePath1, filePathB = filePath2)
            )
        
    print(templates["OrderSimHeader"])    
# compare order of literals
    for l in range(len(litTypes)):    
        right, left, same = compareOrder(literalsA[l], literalsB[l])
        print(
            templates["OrderSimResult"].format(litType = litTypes[l], same=same, right=right, filePathB=filePath2, left=left, filePathA=filePath1)
        )
    print(f"\nThis Usages: {filePath1} has {thisUsages1} usages of 'this', while {filePath2} has {thisUsages2} usages of 'this'")
        # gewichtung?

# calculates the percentage of consens of the two sets
def compareAbsolut(a1, a2):
    if len(a1) == 0 and len(a2) != 0 or len(a1) != 0 and len(a2) == 0: return [], 0
    if len(a1) + len(a2) == 0: return [], -1
    
    consensElementsA1 = []
    # for idx, e in enumerate(a1):
    #     if not isinstance(e, str):
    #         a1[idx] = str(e)

    # for idx, e in enumerate(a2):
    #     if not isinstance(e, str):
    #         a2[idx] = str(e)
    
    set1, set2 = set(a1), set(a2)
    if (len(set1) / len(set2)) > 1.5 or  (len(set1) / len(set2)) < 0.66:
        m = min(len(set1) / len(set2), len(set2) / len(set1))
        return [], m * 100
    for e1 in set1:
        if e1 in set2:
            consensElementsA1.append(e1) 
    
    set3 = set1.union(set2)
    return (consensElementsA1, (len(consensElementsA1) / len(set3)) * 100)

    


# calculates the percentage of consens between the sets including its order
def compareOrder(a1, a2):
    if len(a1) + len(a2) == 0: return -1, -1, -1
    # compare with difflib
    if (len(a1) / len(a2)) > 1.25 or  (len(a1) / len(a2)) < 0.75:
        m = min(len(a1) / len(a2), len(a2) / len(a1))
        return m,m,m
    d = difflib.Differ()
    diff = d.compare(a1, a2)
    diffString = '\n'.join(diff)
    # things of interest: 
    # How similiar are they at the whole: how many differences are there?
    rightUnique = 0
    leftUnique = 0
    same = 0
    lines = diffString.split()
    for l in lines:
        if l[0] == "+":
            rightUnique += 1
        elif l[0] == "-":
            leftUnique += 1
        else: 
            same += 1   
    total = len(lines)
    return (rightUnique / len(lines)) * 100, (leftUnique / len(lines)) * 100, (100 * same) / len(lines)
    
    
    # compute longest common subsequence 10 times and then take percentage
    lcss = 0
    maximum = 0
    for l in diffString:
        if "+" in l or "-" in l:
            if maximum < lcss: maximum = lcss
            lcss = 0
        else:
            lcss += 1        
    print("longest common subsequence is:", maximum)
    #


def compareAll(obj1, obj2):
    diff = {"order":{}, "absolut":{}, "this":{}}
    # load json
    
    stringLits1, numbers1, instanceOf1, methods1, classAttr1, thisUsages1 = obj1["stringLiterals"], obj1["numbers"], obj1["instanceofInst"], obj1["methodnames"], obj1["classAttributesThis"], obj1["thisUsages"]
    literalsA = [stringLits1, numbers1, instanceOf1, methods1, classAttr1, thisUsages1]
    
    stringLits2, numbers2, instanceOf2, methods2, classAttr2, thisUsages2 = obj2["stringLiterals"], obj2["numbers"], obj2["instanceofInst"], obj2["methodnames"], obj2["classAttributesThis"], obj2["thisUsages"]
    literalsB = [stringLits2, numbers2, instanceOf2, methods2, classAttr2, thisUsages2]

    litTypes = ["STRING", "NUMBER", "INSTANCEOF", "METHOD", "CLASS_ATTR"]

    for l in range(len(litTypes)):
        _, mutual1 = compareAbsolut(literalsA[l], literalsB[l]) 
        diff["absolut"][litTypes[l]] = mutual1
        _, _, same = compareOrder(literalsA[l], literalsB[l])
        diff["order"][litTypes[l]] = same
        diff["this"]["this"] = min(thisUsages1 / thisUsages2, thisUsages2/thisUsages1)
    
    return diff

