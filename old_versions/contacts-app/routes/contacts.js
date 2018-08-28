const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const Contact = require('../models/contact');

// Register
router.post('/register', (req, res, next) => {
  let newContact = new Contact ({
    name: req.body.name,
    email: req.body.email,
    username: req.body.username,
    password: req.body.password
  });

  Contact.addContact(newContact, (err, contact) => {
    if(err) {
      res.json({success: false, msg: 'Failed to register contact'});
    } else {
      res.json({success: true, msg: 'Contact registered'});
    }
  });
});

// Get Contact
router.get('/profile', passport.authenticate('jwt', {session:false}), (req, res, next) => {
  let query = req.body.search;
  let isOutput = false;
  let result = [];
  Contact.getContactsByUsername(query, (err, contact) => {
      if(err) throw err;
      if(contact) {
        isOutput = true;
        result.push(req.contact);
      }
  });
  Contact.getContactsByEmail(query, (err, contact) => {
      if(err) throw err;
      if(contact) {
        isOutput = true;
        result.push(req.contact);
      }
  });

  if(isOutput){
    res.send(result);
  }
  else{
    res.json({success: false, msg: 'No Contacts Found with Given Search Queries'})
  }
});

module.exports = router;
