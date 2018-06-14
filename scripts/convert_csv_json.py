import csv
import json
import unidecode

path = '/mnt/c/users/jschm/Desktop/Alkesh/outlook_contacts.CSV'
with open(path, 'rt', encoding='mac_croatian') as f:
  contents = f.read()
jsonfile = open('outlook_contacts.json', 'w') #write data to this file

fieldnames = ("title","first name","middle name","last name","suffix","company","department","job title","business street","business street 2","business street 3","business city","business state","business postal code","business country/region","home street","home street 2","home street 3","home city","home state","home postal code","home country/region","other street","other street 2","other street 3","other city","other state","other postal code","other country/region","assistant's phone","business fax","business phone","business phone 2","callback","car phone","company main phone","home fax","home phone","home phone 2","ISDN","mobile phone","other fax","other phone","pager","primary phone","radio phone","TTY/TDD phone","telex","account","anniversary","assistant's name","billing information","birthday","business address PO box","categories","children","directory server","email","email type","email display name","email 2 Address","email 2 type","email 2 display name","email 3 address","email 3 type","email 3 display name","gender","government ID number","hobby","home address PO box","initials","internet free busy","keywords","language","location","manager's name","mileage","notes","office location","organizational ID number","other address PO box","priority","private","profession","referred by","sensitivity","spouse","user 1","user 2","user 3","user 4","web page")
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

def main(args):
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

if __name__ == '__main__':
  main(sys.argv[1:])
