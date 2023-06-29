import difflib

def divideByZero(a,b):
    if b == 0:
        return 0
    else:
        return a/b
    

def transformLiterals(L):
    literalMap = dict()
       
    litTypes = ["stringLiterals", "instanceofInst", "methodnames", "classAttributesThis", "thisUsages"]
    for lit in litTypes:
        literalMap[lit] = dict()
        lits = L[lit]
        if lit == "thisUsages":
            literalMap[lit] = lits
            continue
        tmp = cleanLiterals(lits)
        for e in tmp:
            if e in literalMap:
                literalMap[lit][e] += 1
            else:
                literalMap[lit][e] = 1
    return literalMap   

def cleanLiterals(a1):
    for idx, e in enumerate(a1):
        if not isinstance(e, str):
            a1[idx] = str(e)
    return a1


# calculates the percentage of consens of the two sets
def compareAbsolut(a1, a2):
    if len(a1) == 0 and len(a2) != 0 or len(a1) != 0 and len(a2) == 0: return 0
    if len(a1) + len(a2) == 0: return -1
    score = 0
    # count consens elements as +1 for having it and min(counta/countb, countb/counta)
    counter = 0
    for lit, count in a1.items():
        if lit in a2:
            score += 1
            tmpCount = a2[lit]
            score += min(tmpCount/count, count/tmpCount)
        counter += 2
    return score / counter

    


def compareAll(obj1, obj2):
    diff = {"order":{}, "absolut":{}, "this":{}}
    # load json
    stringLits1, instanceOf1, methods1, classAttr1, thisUsages1 = obj1["stringLiterals"], obj1["instanceofInst"], obj1["methodnames"], obj1["classAttributesThis"], obj1["thisUsages"]
    literalsA = [stringLits1, instanceOf1, methods1, classAttr1, thisUsages1]
    
    stringLits2, instanceOf2, methods2, classAttr2, thisUsages2 = obj2["stringLiterals"], obj2["instanceofInst"], obj2["methodnames"], obj2["classAttributesThis"], obj2["thisUsages"]
    literalsB = [stringLits2, instanceOf2, methods2, classAttr2, thisUsages2]

    litTypes = ["stringLiterals", "instanceofInst", "methodnames", "classAttributesThis"]


    for idx, l in enumerate(litTypes):
        mutual1 = compareAbsolut(literalsA[idx], literalsB[idx]) 
        diff["absolut"][litTypes[idx]] = mutual1
        # _, _, same = compareOrder(literalsA[l], literalsB[l])
    
    diff["this"]["this"] = min(divideByZero(thisUsages1, thisUsages2), divideByZero(thisUsages2, thisUsages1))
    return diff

