const soap = require('soap');
const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const api_key = require('./api_key')

var app = express();
// body parser middleware are supported (optional)
app.use(bodyParser.raw({type: function(){return true;}, limit: '5mb'}));

var swimMet = {
      SwimMet: {
          swimmet_port: {
              // Iplement metar operation
              metar: async (args, callback) => {
                  // Prepare url and options
                  var url = "https://api-redemet.decea.gov.br/mensagens/metar/"
                  url = url + args.localidades
                  var options = "?api_key=" + api_key
                  if(args.data_ini){
                    options = options + '&data_ini=' + args.data_ini
                  }
                  if(args.data_fim){
                    options = options + '&data_fim=' + args.data_fim
                  }
                  if(args.page_tam){
                    options = options + '&page_tam=' + args.page_tam
                  }
                  // Get metar from redemet api
                  try {
                    const response = await fetch(
                      url + options,
                      {
                          method: 'GET',
                          headers: {}
                      }
                    );
                    // parse to json
                    const responseData = await response.json();
                    if(!response.ok) {
                        throw new Error('')
                    } else {
                      // Message successfully received
                      // Check if is a multipage response
                      var last_page = parseInt(responseData.data.last_page, 10)
                      if(last_page !== 1){
                        // If multipage, create and fill data array
                        var data = [responseData.data]
                        // Get all pages
                        for(var i = 2; i <= last_page; i++){
                          // Update options
                          var temp_options = options + '&' + 'page=' + i.toString()
                          try{
                            // Get each page
                            const response = await fetch(
                              url + temp_options,
                              {
                                  method: 'GET',
                                  headers: {}
                              }
                            );
                            // parse to json
                            const responseData = await response.json();
                            if(!response.ok) {
                              throw new Error('')
                            } else {
                              // Success
                              // Update data array
                              data = [...data, responseData.data]
                            }
                          } catch(err) {
                            // Fault handling
                            throw {
                              Fault: {
                                Code: {
                                  Value: 'soap:Sender',
                                  Subcode: { value: 'BadArguments' }
                                },
                                Reason: { Text: 'Processing Error' },
                                statusCode: 500
                              }
                            };
                          }
                        }
                        // After all pages are in array, update responseData
                        responseData.data = data
                      }
                      // Return responseData. Package will parse json to xml
                      return responseData
                    }

                } catch (err) {
                  // Fault handling
                  throw {
                    Fault: {
                      Code: {
                        Value: 'soap:Sender',
                        Subcode: { value: 'BadArguments' }
                      },
                      Reason: { Text: 'Processing Error' },
                      statusCode: 500
                    }
                  };
                }
              }
          }
      }
  };

  // Route to serve wsdl
  app.get('/wsdl', (req, res) => {
    res.sendFile(__dirname + '/wsdl/SwimMet.wsdl')
  })

  var xml = fs.readFileSync(__dirname + '/wsdl/SwimMet.wsdl', 'utf8');
  //express server
  const PORT = process.env.PORT || 8001
  app.listen(PORT, function(){
      //Note: /soap route will be handled by soap module
      //and all other routes & middleware will continue to work
      soap.listen(app, '/soap', swimMet, xml, function(){
        console.log('server initialized');
      });
  });
