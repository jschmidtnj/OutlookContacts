#!/usr/bin/env python
import py2exe
import importlib
import convert_csv_json
import convert_json_mongo_mlab
import clean_data_mlab
import mongo_to_local_csv


def main(uri, sleep_time, filename_json, filename_csv):
    convert_csv_json.main(sleep_time, filename_json)
    convert_json_mongo_mlab.main(uri, sleep_time)
    clean_data_mlab.main(uri)
    mongo_to_local_csv.main(uri, filename_csv)

if __name__ == '__main__':
    filename_json = "contacts"
    filename_csv = "contacts_exported"
    sleep_time = 5
    #uri goes to mlab for getting the data
    uri = 'mongodb://admin:password1@ds153380.mlab.com:53380/meanauthapp'
    main(uri, sleep_time, filename_json, filename_csv)