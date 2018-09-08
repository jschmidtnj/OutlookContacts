#!/usr/bin/env python
#import py2exe
import importlib
import convert_csv_json
import convert_json_mongo_mlab
import mlab_to_duplicates
import mongo_to_local_csv
import json

def main(uri, sleep_time, filename_json, filename_email_csv, filename_name_csv, fieldnames):
    convert_csv_json.main(sleep_time, filename_json, fieldnames)
    convert_json_mongo_mlab.main(uri, sleep_time)
    mlab_to_duplicates.main(uri)
    mongo_to_local_csv.main(uri, filename_email_csv, 0, fieldnames)
    mongo_to_local_csv.main(uri, filename_name_csv, 1, fieldnames)

if __name__ == '__main__':
    with open('config.json') as f:
        config = json.load(f)
        filename_json = config["filename_json"]
        filename_email_csv = config["filename_email_csv"]
        filename_name_csv = config["filename_name_csv"]
        sleep_time = config["sleep_time"]
        fieldnames = config["fieldnames"]
        #uri goes to mlab for getting the data
        uri = config["uri"]
        main(uri, sleep_time, filename_json, filename_email_csv, filename_name_csv, fieldnames)