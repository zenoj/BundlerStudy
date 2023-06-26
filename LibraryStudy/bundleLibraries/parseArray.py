# send all version to stdin for the "npm i" command in automate script
import sys
import os

library = sys.argv[1]
versionListPath = sys.argv[2]

# read in versions
versionFile = versionListPath
with open(versionFile) as f:
    b = f.read().strip()
bCleaned = b.replace("'", "").replace('"', "").replace("]", "").replace("[", "")
versions = [v.strip() + "\n" for v in bCleaned.split(",")]
os.remove(versionFile)
with open(versionFile, 'x') as f:
    f.writelines(versions)
