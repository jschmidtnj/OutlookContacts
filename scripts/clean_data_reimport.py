#!/usr/bin/env python
import py2exe
import importlib
import convert_csv_json
import convert_json_mongo_mlab
import clean_data_mlab
import mongo_to_local_csv


def main(filename_json, filename_csv):
    convert_csv_json.main(filename_json)
    convert_json_mongo_mlab.main()
    clean_data_mlab.main()
    mongo_to_local_csv.main(filename_csv)

if __name__ == '__main__':
    filename_json = "contacts"
    filename_csv = "contacts_exported"
    main(filename_json, filename_csv)