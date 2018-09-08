#!/usr/bin/env python
import sys, urllib, json, pymongo
from bson import json_util
from pymongo import MongoClient
import yaml
#myurl = "https://gist.githubusercontent.com/border/775526/raw/b921df18ba00262ab5bba8cadb3c178e1f7748f7/config.json"
#response = urllib2.urlopen(myurl)
#data = response.read()
#data = json_util.loads("outlook_contacts.json")
def load_json_multiple(segments):
    chunk = ""
    for segment in segments:
        chunk += segment
        #try:
          #yield json.loads(chunk)
        yaml.load(chunk) #get rid of random backslashes!
        #yield json.loads(chunk.replace('\r\n', '\\r\\n'))
        chunk = ""
        #Problem with json file!
        '''
        except ValueError:
        	print("error!")
        	pass
        '''

connection = MongoClient('localhost', 27017)
connection.database_names()
db = connection.outlook

count = 0
with open('outlook_contacts.json') as f:
	#data = json.load(f)
	for parsed_json in load_json_multiple(f):
		count += 1
		if count % 1000 == 0:
			print(count)
		#print(parsed_json)
		data = parsed_json
		contacts = db.contacts
		contact_id = contacts.insert_one(data).inserted_id