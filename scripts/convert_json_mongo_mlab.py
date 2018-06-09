#!/usr/bin/env python
import sys, urllib, json, pymongo
from bson import json_util

uri = 'mongodb://admin:password1@ds153380.mlab.com:53380/meanauthapp'

def main(args):
    client  = pymongo.MongoClient(uri)
    db = client.get_default_database()
    error_count = 0

    count = 0
    with open('/mnt/c/users/jschm/Desktop/Alkesh//data_files/outlook_contacts.json', 'r') as f:
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

if __name__ == '__main__':
    main(sys.argv[1:])