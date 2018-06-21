#!/usr/bin/env python
import sys, urllib, json, pymongo
from bson import json_util
from bson.json_util import dumps, RELAXED_JSON_OPTIONS
import os
import csv

def main(uri, filename_csv):
    main_path = os.getcwd() #same directory
    #main_path = main_path[0:main_path.find("/scripts")] + "/data" #other directory
    path = main_path + "/" + filename_csv + ".csv"
    fieldnames = ("Title","First Name","Middle Name","Last Name","Suffix","Company","Department","Job Title","Business Street","Business Street 2","Business Street 3","Business City","Business State","Business Postal Code","Business Country/Region","Home Street","Home Street 2","Home Street 3","Home City","Home State","Home Postal Code","Home Country/Region","Other Street","Other Street 2","Other Street 3","Other City","Other State","Other Postal Code","Other Country/Region","Assistant's Phone","Business Fax","Business Phone","Business Phone 2","Callback","Car Phone","Company Main Phone","Home Fax","Home Phone","Home Phone 2","ISDN","Mobile Phone","Other Fax","Other Phone","Pager","Primary Phone","Radio Phone","TTY/TDD Phone","Telex","Account","Anniversary","Assistant's Name","Billing Information","Birthday","Business Address PO Box","Categories","Children","Directory Server","E-mail Address","E-mail Type","E-mail Display Name","E-mail 2 Address","E-mail 2 Type","E-mail 2 Display Name","E-mail 3 Address","E-mail 3 Type","E-mail 3 Display Name","Gender","Government ID Number","Hobby","Home Address PO Box","Initials","Internet Free Busy","Keywords","Language","Location","Manager's Name","Mileage","Notes","Office Location","Organizational ID Number","Other Address PO Box","Priority","Private","Profession","Referred By","Sensitivity","Spouse","User 1","User 2","User 3","User 4","Web Page")
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

    for contact in db.contacts.find():
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
    #uri goes to mlab for getting the data
    uri = 'mongodb://admin:password1@ds153380.mlab.com:53380/meanauthapp'
    filename_csv = "contacts_exported"
    main(uri, filename_csv)