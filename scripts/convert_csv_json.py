import csv
import json
import unidecode

path = '/mnt/c/users/jschm/Desktop/Alkesh/outlook_contacts.CSV'
with open(path, 'rt', encoding='mac_croatian') as f:
  contents = f.read()
jsonfile = open('outlook_contacts.json', 'w') #write data to this file

fieldnames = ("Title","First Name","Middle Name","Last Name","Suffix","Company","Department","Job Title","Business Street","Business Street 2","Business Street 3","Business City","Business State","Business Postal Code","Business Country/Region","Home Street","Home Street 2","Home Street 3","Home City","Home State","Home Postal Code","Home Country/Region","Other Street","Other Street 2","Other Street 3","Other City","Other State","Other Postal Code","Other Country/Region","Assistant's Phone","Business Fax","Business Phone","Business Phone 2","Callback","Car Phone","Company Main Phone","Home Fax","Home Phone","Home Phone 2","ISDN","Mobile Phone","Other Fax","Other Phone","Pager","Primary Phone","Radio Phone","TTY/TDD Phone","Telex","Account","Anniversary","Assistant's Name","Billing Information","Birthday","Business Address PO Box","Categories","Children","Directory Server","E-mail Address","E-mail Type","E-mail Display Name","E-mail 2 Address","E-mail 2 Type","E-mail 2 Display Name","E-mail 3 Address","E-mail 3 Type","E-mail 3 Display Name","Gender","Government ID Number","Hobby","Home Address PO Box","Initials","Internet Free Busy","Keywords","Language","Location","Manager's Name","Mileage","Notes","Office Location","Organizational ID Number","Other Address PO Box","Priority","Private","Profession","Referred By","Sensitivity","Spouse","User 1","User 2","User 3","User 4","Web Page")
count = 0 #count of json objects entered
num_commas = 0 #number of commas found (essentially field-name deliminators)
num_fields = len(fieldnames) #obviously the number of fieldnames above
data = '{\"' + fieldnames[num_commas] + '\":' #this is the data that is put in the json file, as a json object
first_paren = False #first quotation mark hit
data_in = False #creates the null if there is no information whatsoever
start_next = False #starts the next json object if new line at end with no data
prev_char = '' #the previous character looked at
inner_paren = False #if the quotation mark looked at is inside another set of quotation marks
current_char = 0 #character index currently
for char in contents:
  #print(char, num_commas, num_fields, start_next,first_paren)
  char = unidecode.unidecode(str(char)) #get rid of special characters
  if char == '\\': #if there is a backslash make it forward slash
    char = '/'
  elif char == '\t': #replace tabs with "\t"
    char = '\\\\t'
  elif (contents[current_char-2:current_char+1] == '\"\n,'): #if there is a quotation mark, new line, comma, this is a new json json object
    start_next = True
    data = data[:len(data)-6] + '\"'
    data_in = False
  elif prev_char == '\n' and not(first_paren): #if there is a closing quotation mark and a new line, this is a new json json object
    first_paren = not(first_paren)
    start_next = True
    data = data[:len(data)-4] + '\"'
    data_in = True
  elif char == '\"': #if character is a quotation mark, flip first_paren and add either a ` or "
    first_paren = not(first_paren)
    if data[len(data)-1] == ':' or prev_char == '':
      data += char
    elif inner_paren:
      data += '`'
    elif prev_char == '\"':
      data += char
    else:
      data += '`'
    data_in = True
  elif char == ',' and not(first_paren):
    num_commas += 1
    if data[len(data)-1:] == '`':
      data = data[:len(data)-1]
      data += '\"'
    elif not(data_in):
      data += "\"null\""
    if num_commas < num_fields:
      inner_paren = True
      data = data + ',\"' + fieldnames[num_commas] + '\":'
      data_in = False
  elif char == '\n':
    data += '\\\\n'
  else: #add char to data otherwise
    data += char
    data_in = True
  prev_char = char
  current_char += 1
  if num_commas == num_fields or start_next:
    count += 1
    word = '\"Spouse\"\"'
    if data[len(data)-len(word):] == word:
      data = data[:len(data) - len(word)] + '\"Spouse\":\"\"'
    word = '\"Web Page\"\"'
    if data[len(data)-len(word):] == word:
      data = data[:len(data) - len(word)] + '\"Web Page\":\"\"'
    data += '}'
    #print(data)
    num_commas = 0
    jsonfile.write(data)
    jsonfile.write('\n')
    data = '{\"' + fieldnames[num_commas] + '\":'
    if not(data_in):
      num_commas += 1
      data = data + "\"null\"" + ',\"' + fieldnames[num_commas] + '\":'
    else:
      data += '\"'
    start_next = False
    inner_paren = False