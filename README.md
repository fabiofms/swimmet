# SwimMet Service

Part of the aviation System Wide Information Management (SWIM) is to provide SOAP web services to give access to serveral aviation related information, like meteorological.

This application uses the Brazilian Rest Redemet API Metar and reproduces it as a SOAP service. Another Redemet services, like TAF, can eventually be added to this project.

## Dependencies

`nodejs 14.15.1`
`express 4.17.1`
`node-fetch 2.6.1`
`soap 0.35.0`

## Instructions

In order to run the service, request an API key at https://www.atd-1.com/cadastro-api/ and put it's value on the variable `api_key` inside the file `/api_key.js`.
Launch a terminal on project folder and run `node service.js`. The service will run on `localhost/8001/soap`, while the WSDL file will be served on `localhost/8001/wsdl`.
