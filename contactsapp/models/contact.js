const mongoose = require('mongoose');
const config = require('../config/database');

// User Schema
const ContactSchema = mongoose.Schema ({
  name: {
    type: String
  },
  email: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

const Contact = module.exports = mongoose.model('Contact', ContactSchema);

module.exports.getContactsById = function(id, callback) {
  Contact.findById(id, callback);
}

module.exports.getContactsByUsername = function(username, callback) {
  const query = {username: {"$regex": username, "$options": "i"}}
  Contact.find(query, callback);
}

module.exports.getContactsByEmail = function(email, callback) {
  const query = {email: {"$regex": email, "$options": "i"}}
  Contact.find(query, callback);
}

module.exports.addContact = function(newContact, callback) {
  newContact.save(callback);
}
