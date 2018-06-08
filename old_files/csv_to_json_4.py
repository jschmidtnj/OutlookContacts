import csv
import json
import unidecode

#cd /mnt/c/Users/jschm/Desktop/Alkesh
#csvfile = open('outlook_contacts.CSV', 'r')

#path = '/home/joshua/Desktop/Alkesh/outlook_contacts.CSV'
path = '/mnt/c/users/jschm/Desktop/Alkesh/outlook_contacts.CSV'
with open(path, 'rt', encoding='mac_croatian') as f:
  contents = f.read()
jsonfile = open('outlook_contacts.json', 'w')

fieldnames = ("Title","First Name","Middle Name","Last Name","Suffix","Company","Department","Job Title","Business Street","Business Street 2","Business Street 3","Business City","Business State","Business Postal Code","Business Country/Region","Home Street","Home Street 2","Home Street 3","Home City","Home State","Home Postal Code","Home Country/Region","Other Street","Other Street 2","Other Street 3","Other City","Other State","Other Postal Code","Other Country/Region","Assistant's Phone","Business Fax","Business Phone","Business Phone 2","Callback","Car Phone","Company Main Phone","Home Fax","Home Phone","Home Phone 2","ISDN","Mobile Phone","Other Fax","Other Phone","Pager","Primary Phone","Radio Phone","TTY/TDD Phone","Telex","Account","Anniversary","Assistant's Name","Billing Information","Birthday","Business Address PO Box","Categories","Children","Directory Server","E-mail Address","E-mail Type","E-mail Display Name","E-mail 2 Address","E-mail 2 Type","E-mail 2 Display Name","E-mail 3 Address","E-mail 3 Type","E-mail 3 Display Name","Gender","Government ID Number","Hobby","Home Address PO Box","Initials","Internet Free Busy","Keywords","Language","Location","Manager's Name","Mileage","Notes","Office Location","Organizational ID Number","Other Address PO Box","Priority","Private","Profession","Referred By","Sensitivity","Spouse","User 1","User 2","User 3","User 4","Web Page")
count = 0
num_commas = 0
num_fields = len(fieldnames)
data = '{\"' + fieldnames[num_commas] + '\":'
first_paren = False #first parenthesis hit
inner_paren = False
data_in = False #creates the null if there is no information whatsoever
start_next = False #starts the next json object if new line at end with no data
prev_char = ''
for char in contents:
  #print(char, num_commas, num_fields, start_next,first_paren)
  char = unidecode.unidecode(str(char))
  if char == '\\':
    char = '/'
  elif char == '\t':
    char = '\\\\t'
  elif (prev_char == '\n' and char == ','):
    start_next = True
    data = data[:len(data)-3]
    data_in = False
  elif prev_char == '\n' and not(first_paren):
    first_paren = not(first_paren)
    start_next = True
    data = data[:len(data)-3]
    data_in = True
  elif char == '\"':
    first_paren = not(first_paren)
    if (prev_char == '\n' and first_paren):
      start_next = True
      data += char
    elif prev_char == ',' or prev_char == ':' or prev_char == '' or prev_char == '\"' or prev_char == '\n' or (not(first_paren) and not(inner_paren)):
      data += char
    else:
      data += '\\"'
      inner_paren = not(inner_paren)
    data_in = True
    start_next = False
  elif char == ',' and prev_char == '\"' and not(first_paren):
    num_commas += 1
    if prev_char == '\'':
      data = data[:len(data)-2]
      data += '\"'
    elif not(data_in):
      data += "\"null\""
    if num_commas < num_fields:
      data = data + ',\"' + fieldnames[num_commas] + '\":'
      data_in = False
  elif char == '\n':
    data += '\\\\n'
  else:
    data += char
    data_in = True
  prev_char = char
  #what if there is another quote inside of the first quotation mark? I think they will cancel out maybe...
  if num_commas == num_fields or start_next:
    count += 1
    data += '}'
    #print(data)
    num_commas = 0
    #json.dump(data, jsonfile)
    jsonfile.write(data)
    jsonfile.write('\n')
    data = '{\"' + fieldnames[num_commas] + '\":'
    if not(data_in):
      num_commas += 1
      data = data + "\"null\"" + ',\"' + fieldnames[num_commas] + '\":'
    else:
      data += '\"'
    start_next = False
    first_paren = False
    inner_paren = False
    #data_in = False
    #if count % 10 == 0:
    #  break
'''
with open('outlook_contacts.json', 'w') as f:
  data = ""
  contents = f.read()
  for char in contents:
    if char == '\\':
      data += '\\\\'
    else:
      data += char
  f.write(data)
'''