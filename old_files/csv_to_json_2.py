import csv
ifile  = open('outlook_contacts.CSV', "r", encoding="ascii")
read = csv.reader(ifile)
for row in read :
    print (row)