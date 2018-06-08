#!/usr/bin/env python
import sys, urllib, json, pymongo
from bson import json_util
from pymongo import MongoClient
        

connection = MongoClient('localhost', 27017)
connection.database_names()
db = connection.outlook
error_count = 0

count = 0
with open('outlook_contacts.json', 'r') as f:
    for line in f:
        while True:
            try:
                data = json.loads(line)
                #print(data)
                count += 1
                if count % 1000 == 0:
                    print(count)
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
print("There were " + str(error_count) + " errors")