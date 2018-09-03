# OutlookContacts

This project is to send outlook contacts to a mongodb database, where they can be managed and then either sent back to outlook or used in a MEAN-stack web application. Currently, the setup does not use the MEAN application, and instead uses a firebase-bootstrap web-app to create contacts. The contacts can then be downloaded as csv's periodically so that users can import their contacts to multiple locations on Outlook. A script is used to filter the Outlook data periodically for duplicates, sending the data from a csv to a managed MongoDB database for processing, and then downloading the data to a second csv to be reimported. See `contacts-app-firebase` for the working web-app and `scripts` for the duplicate-removal python scripts.

