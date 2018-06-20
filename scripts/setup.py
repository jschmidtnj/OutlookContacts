from cx_Freeze import setup, Executable
import os
os.environ['TCL_LIBRARY'] = "C:\\Program Files (x86)\\Microsoft Visual Studio\\Shared\\Python36_64\\tcl\\tcl8.6"
os.environ['TK_LIBRARY'] = "C:\\Program Files (x86)\\Microsoft Visual Studio\\Shared\\Python36_64\\tcl\\tk8.6"

base = None    

executables = [Executable("clean_data_reimport.py", base=base)]

packages = ["idna", "os", "sys", "json", "csv", "unidecode", "unicodedata", "urllib", "pymongo", "bson", "pprint", "ast", "re"]
options = {
    'build_exe': {    
        'packages':packages,
    },    
}

setup(
    name = "clean_data",
    options = options,
    version = "1.0",
    description = 'An exe for cleaning data',
    executables = executables
)