import os
import shutil
import sys
def splitFiles():
    startDir, baseOutDir = sys.argv[1:3]
    threads = 10000 
    dirs = os.listdir(startDir)
    counter = 0
    for idx,dir in enumerate(dirs):
        folderNr = idx % threads
        destinationDir = f"{baseOutDir}/s{folderNr}/{dir}"
        shutil.copytree(f"{startDir}/{dir}", destinationDir) 
    
splitFiles()
