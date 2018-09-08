#!/usr/bin/env python
import sys, urllib, json
from bson.son import SON
from bson.json_util import dumps, RELAXED_JSON_OPTIONS
import pprint
from pymongo import MongoClient
from bson.objectid import ObjectId
import ast
import re

def main(uri):
  client  = MongoClient(uri)
  #connect to database
  db = client.get_default_database()
  #by Email:
  pipeline = [
    {"$match":{"E-mail Address":{"$nin":["null","?"]},}},
    {"$group":{"_id":{"E-mail Address":"$E-mail Address"},"uniqueIds":{"$addToSet":"$_id"},"count": {"$sum": 1}}},
    {"$match":{"count": {"$gt": 1}}},
    {"$sort": SON([("count", -1), ("_id", -1)])}
  ]
  '''
  #by First AND Last Name
  pipeline = [
    {"$match":{"First Name":{"$nin":["null","?"]},"Last Name":{"$nin":["null","?"]}}},
    {"$group":{"_id":{"First Name":"$First Name", "Last Name":"$Last Name"},"uniqueIds":{"$addToSet":"$_id"},"count": {"$sum": 1}}},
    {"$match":{"count": {"$gt": 1}}},
    {"$sort": SON([("count", -1), ("_id", -1)])}
  ]
  '''
  #send data to list
  data = list(db.contacts.aggregate(pipeline))
  #db.command('aggregate', 'contacts', pipeline=pipeline, explain=True)
  #pprint.pprint(data)
  #put it in a json object
  json_string = dumps(data, json_options=RELAXED_JSON_OPTIONS)
  json_data = json.loads(json_string)
  #print(json_data)
  new_ids = []
  num_iter = 0
  error_count = 0
  #iterate over json objects
  for contact in json_data:
    num_iter += 1
    ids = contact["uniqueIds"]
    #print(ids)
    ids_to_merge = []
    #iterate over id values in json object contact
    for id in ids:
      id_value = id["$oid"]
      #print(id_value)
      #send ids to an array
      ids_to_merge.append(id_value)
    #get the first object from the id array, send to json
    aggregated_contact_string = dumps(db.contacts.find_one({"_id":ObjectId(ids_to_merge[0])}), json_options=RELAXED_JSON_OPTIONS)
    aggregated_contact = json.loads(aggregated_contact_string)
    #pprint.pprint(aggregated_contact)
    for id in ids_to_merge[1:]:
      #get data from contacts collection, iterating by id over the array
      contact_data = db.contacts.find_one({"_id":ObjectId(id)})
      #pprint.pprint(contact_data)
      count = 0
      for field in contact_data:
        #iterate over each field and append to json object aggregated_contact, in the correct field, if necessary
        try:
          #print(field, aggregated_contact[field], contact_data[field])
          if aggregated_contact[field] == None or aggregated_contact[field] == "null" or aggregated_contact[field] == "" or bool(re.search(str(contact_data[field]), str(aggregated_contact[field]))):
            aggregated_contact[field] = contact_data[field]
          else:
            aggregated_contact[field] = str(aggregated_contact[field]) + ', ' + str(contact_data[field])
        except:
          error_count += 1
    #get rid of id fields in json object
    aggregated_contact.pop('_id', None)
    #pprint.pprint(aggregated_contact)
    #delete old contacts (now aggregated)
    for id in ids_to_merge:
      db.contacts.delete_one({"_id":ObjectId(id)})
    #send new json object to database
    post_id=db.contacts.insert_one(aggregated_contact).inserted_id
    #print(post_id)
    new_ids.append(str(post_id))
    #db.contacts.delete_one({"_id":ObjectId(post_id)})
    #print out information about post
    if num_iter % 10 == 0:
      print("Created " + str(num_iter) + " aggregates from the duplicates.")
  print("Deleted " + str(num_iter) + " duplicate contacts, replaced with " + str(len(new_ids)) + " new aggregates. IDs: " + ' '.join(str(value) for value in new_ids) + "key errors: " + str(error_count))

if __name__ == '__main__':
    #uri goes to mlab for getting the data
    uri = 'mongodb://admin:password1@ds153380.mlab.com:53380/meanauthapp'
    main(uri)
