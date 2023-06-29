import subprocess
import sys
from os import listdir
from os.path import isfile, join
from pathlib import Path
import os

import glob

def getAllFileNames(startDir):
    cfiles = []
    for root, dirs, files in os.walk(startDir):
        for file in files:
            if file.endswith('.js'):
                cfiles.append(os.path.join(root, file))
    return cfiles



def bundleLibrary():
    libraryPath, library, version, basePath = sys.argv[1:5]

    # read in modules directory of library
    outPath = f'{basePath}/ExampleLibraries/{library}/versions/{version}'
    Path(outPath).mkdir(exist_ok=True)
    Path(outPath + "/modules").mkdir(exist_ok=True)    
    onlyJSFiles = getAllFileNames(libraryPath)
    for jsfile in onlyJSFiles:
        with open(jsfile) as file:
            # check if file is cjs module: 
            b = file.read()
        filename = jsfile.split('/')[-1]
        if ".exports =" not in b:
            continue
        # prepare destination directory
        filePath = f'{outPath}/modules/{filename}'
        Path(filePath).mkdir(exist_ok=True)

        # generate index.js file  
        importPath = jsfile.replace(f"{outPath}/node_modules/", "")
        content = f"const _ = require('{importPath}')\n console.log(_)"
        with open(f'{filePath}/index.js', 'w') as f:
            f.write(content)
        outputFile = f'--output-path {filePath} --output-filename bundle.js'
        command = f"{basePath}/node_modules/webpack-cli/bin/cli.js"
        output = subprocess.run([command,"--entry", f"{filePath}/index.js", "--output-path", f"{filePath}", "--output-filename", "bundle.js", "--optimization-module-ids=named"],
                                stdout=subprocess.PIPE)
        # output.stdout is `bytes`, so we need to decode it into text
        print(output.stdout.decode("utf-8"))

bundleLibrary()          
