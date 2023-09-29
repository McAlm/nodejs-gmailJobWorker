# nodejs gmail JobWorker

This demo projects provides a demo jobworker implementation that creates an ics file and sends it via gmail api to a recipient.

## Installation

To install this code, simply clone the repository and run the following command:

```npm install```


Depending on where your Zeebe cluster is running create environment variables according to:
https://github.com/camunda-community-hub/zeebe-client-node-js#zero-conf-constructor

(The easiest way is to put them into a file ```ZeebeClientCredentials.txt``` and run ```source ZeebeClientCredentials.txt```)

This demo project uses gmail api, to make it work you need a gmail developer account. You need to create an application, create an Oauth2 client and give permissions to this app to access gmail api. Please consult the gmail documentation how to do this.



