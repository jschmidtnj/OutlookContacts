#!/usr/bin/env python
import sys, urllib, json, pymongo
from bson import json_util
from bson.json_util import dumps, RELAXED_JSON_OPTIONS
import os
import csv

def main(uri, filename_csv, mode, fieldnames):
    main_path = os.getcwd() #same directory
    #main_path = main_path[0:main_path.find("/scripts")] + "/data" #other directory
    path = main_path + "/" + filename_csv + ".csv"
    client  = pymongo.MongoClient(uri)
    db = client.get_default_database()
    null_count = 0
    error_count = 0

    count = 0
    new_file_data = []

    csv_file = open(path, 'w', encoding='mac_croatian') #if file is not there this makes the file automatically

    #get csv writer:
    out = csv.writer(csv_file, delimiter=',',quoting=csv.QUOTE_ALL)
    #add the fieldnames to the top:
    for field in fieldnames:
        new_file_data = new_file_data + [field]
    out.writerow(new_file_data)
    new_file_data = []

    if mode == 0:
        data = db.emailduplicates.find()
    else:
        data = db.nameduplicates.find()

    for contact in data:
        count += 1
        #print(contact) # iterate the cursor
        json_string = dumps(contact, json_options=RELAXED_JSON_OPTIONS)
        contact_json = json.loads(json_string)
        for field in fieldnames:
            try:
                #print(field + " " + contact_json[field])
                field_string = str(contact_json[field])
                if field_string == "null":
                    field_string = ""
                current_field_data = ""
                for char in field_string:
                    #iterate through chars
                    #print(char)
                    #look through single characters
                    if char == "`":
                        current_field_data += "\""
                    else:
                        current_field_data += char
                    #look for specific characters
                    if current_field_data[len(current_field_data)-2:] == "\\n":
                        current_field_data = current_field_data[:len(current_field_data)-2] + "\n"
                    elif current_field_data[len(current_field_data)-2:] == "\\t":
                        current_field_data = current_field_data[:len(current_field_data)-2] + "\t"
                    elif current_field_data[len(current_field_data)-2:] == "\\'":
                        current_field_data = current_field_data[:len(current_field_data)-2] + "\'"
                new_file_data = new_file_data + [current_field_data]
                #print("data field: " + str(new_file_data))
            except KeyError:
                #no data in field or error
                null_count += 1
            except:
                #other errors
                error_count += 1
        #print("final data: " + str(new_file_data))
        out.writerow(new_file_data)
        new_file_data = []
        if count % 1000 == 0:
            print("count " + str(count) + " of mlab download and conversion to csv")
            #break
    print("There were " + str(null_count) + " null values and " + str(error_count) + " errors.")


if __name__ == '__main__':
    with open('config.json') as f:
        config = json.load(f)
        #uri goes to mlab for getting the data
        uri = config["uri"]
        fieldnames = config["fieldnames"]
        filename_csv = config["filename_email_csv"]
        main(uri, filename_csv, 0, fieldnames)
        filename_csv = config["filename_name_csv"]
        main(uri, filename_csv, 1, fieldnames)