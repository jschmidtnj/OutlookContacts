#!/usr/bin/env python
import sys, urllib, json, pymongo
from bson import json_util
import os
import time


def main(uri, sleep_time):
    main_path = os.getcwd() #same directory
    #main_path = main_path[0:main_path.find("/scripts")] + "/data" #different directory
    data_path = main_path + "/data"
    for file in os.listdir(data_path):
        #print(file)
        if file.endswith("json"):
            #print("found file")
            path = os.path.join(data_path, file)
            break

    client  = pymongo.MongoClient(uri)
    db = client.get_default_database()
    #delete all in database:
    db.cleancontacts.drop()
    db.emailduplicates.drop()
    db.nameduplicates.drop()
    error_count = 0
    #print("starting loading")
    count = 0
    try:
        f = open(path, 'r')
    except:
        print("json file not found in directory")
        time.sleep(sleep_time)
        exit()
    for line in f:
        while True:
            try:
                data = json.loads(line)
                #print(data)
                count += 1
                if count % 1000 == 0:
                    print(str(count) + " iterations of mlab send")
                contacts = db.cleancontacts
                contact_id = contacts.insert_one(data).inserted_id
                break
            except ValueError:
                #not yet complete json value
                #print("error")
                error_count += 1
                #print(line)
                #end()
                break
                #line += next(f)

    print("There were " + str(error_count) + " errors")

if __name__ == '__main__':
    with open('config.json') as f:
        config = json.load(f)
        uri = config["uri"]
        sleep_time = config["sleep_time"]
        main(uri, sleep_time)