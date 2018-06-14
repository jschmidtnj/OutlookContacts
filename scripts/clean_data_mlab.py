#!/usr/bin/env python
import sys, urllib, json, pymongo
from bson import json_util

uri = 'mongodb://admin:password1@ds153380.mlab.com:53380/meanauthapp'

def main(args):
  client  = pymongo.MongoClient(uri)
  db = client['contacts']
  pipeline = [
      {"$group" : { "_id": "$email", "count": { "$sum": 1 } } },
      {"$match": {"_id" :{ "$ne" : null } , "count" : {"$gt": 1} } }, 
      {"$sort": {"count" : -1} },
      {"$project": {"name" : "$_id", "_id" : 0} }     
  ]
  print(db.aggregate(pipeline))

if __name__ == '__main__':
    main(sys.argv[1:])
