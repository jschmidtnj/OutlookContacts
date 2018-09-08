import csv
import json

#csvfile = open('outlook_contacts.CSV', 'r')

#path = '/home/joshua/Desktop/Alkesh/outlook_contacts.CSV'
path = '/mnt/c/users/jschm/Desktop/Alkesh/outlook_contacts.CSV'
with open(path, 'rt', encoding='mac_croatian') as f:
  contents = f.read()
jsonfile = open('outlook_contacts.json', 'w')

fieldnames = ("Title","First Name","Middle Name","Last Name","Suffix","Company","Department","Job Title","Business Street","Business Street 2","Business Street 3","Business City","Business State","Business Postal Code","Business Country/Region","Home Street","Home Street 2","Home Street 3","Home City","Home State","Home Postal Code","Home Country/Region","Other Street","Other Street 2","Other Street 3","Other City","Other State","Other Postal Code","Other Country/Region","Assistant's Phone","Business Fax","Business Phone","Business Phone 2","Callback","Car Phone","Company Main Phone","Home Fax","Home Phone","Home Phone 2","ISDN","Mobile Phone","Other Fax","Other Phone","Pager","Primary Phone","Radio Phone","TTY/TDD Phone","Telex","Account","Anniversary","Assistant's Name","Billing Information","Birthday","Business Address PO Box","Categories","Children","Directory Server","E-mail Address","E-mail Type","E-mail Display Name","E-mail 2 Address","E-mail 2 Type","E-mail 2 Display Name","E-mail 3 Address","E-mail 3 Type","E-mail 3 Display Name","Gender","Government ID Number","Hobby","Home Address PO Box","Initials","Internet Free Busy","Keywords","Language","Location","Manager's Name","Mileage","Notes","Office Location","Organizational ID Number","Other Address PO Box","Priority","Private","Profession","Referred By","Sensitivity","Spouse","User 1","User 2","User 3","User 4","Web Page")
csvfile = contents

#fieldnames = ("FirstName","LastName","IDNumber","Message")
reader = csv.DictReader(csvfile, fieldnames)
for row in reader:
    #row.encode('utf-8').strip()
    json.dump(row, jsonfile)
    jsonfile.write('\n')
'''
with open('outlook_contacts.CSV', newline='', encoding='mac_croatian') as f:
  reader = csv.reader(f)
  row1 = next(reader)  # gets the first line
  print(row1)
  # now do something here 
  # if first row is the header, then you can do one more next() to get the next row:
  # row2 = next(f)

'''