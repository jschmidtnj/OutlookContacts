#!/usr/bin/env python
import sys, urllib, json, pymongo
from bson import json_util
import os

uri = 'mongodb://admin:password1@ds153380.mlab.com:53380/meanauthapp'

def main():
    main_path = os.getcwd() #same directory
    #main_path = main_path[0:main_path.find("/scripts")] + "/data" #different directory
    for file in os.listdir(main_path):
        if file.endswith("json"):
            path = os.path.join(main_path, file)

    client  = pymongo.MongoClient(uri)
    db = client.get_default_database()
    error_count = 0

    count = 0
    try:
        with open(path, 'r') as f:
            for line in f:
                while True:
                    try:
                        data = json.loads(line)
                        #print(data)
                        count += 1
                        if count % 1000 == 0:
                            print(str(count) + " iterations of mlab send")
                        contacts = db.contacts
                        contact_id = contacts.insert_one(data).inserted_id
                        break
                    except ValueError:
                        #not yet complete json value
                        print("error")
                        error_count += 1
                        #print(line)
                        #end()
                        break
                        #line += next(f)
    except:
        print("json file not found in directory")
    print("There were " + str(error_count) + " errors")

if __name__ == '__main__':
    main()