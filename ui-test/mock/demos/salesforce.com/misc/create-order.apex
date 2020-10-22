# -*- indent-tabs-mode: nil -*-

public class StaticData {
    string key;

    StaticData() {
        key = 'value';
    }
}

public class Order {
    StaticData staticdata;

    public Order() {
        staticdata = new StaticData();
    }
}

Order order = new Order();

// Serialize the list of InvoiceStatement objects.
String JSONString = JSON.serialize(order);
System.debug('Serialized list of invoices into JSON format: ' + JSONString);

HttpRequest req = new HttpRequest();

//Set HTTPRequest Method
req.setMethod('POST');

//Set HTTPRequest header properties
req.setHeader('Content-Length', string.valueof(JSONString.length()));
//req.setHeader('Host','90.177.121.44');
req.setHeader('Connection','keep-alive');
req.setHeader('Content-Type', 'application/json');
req.setEndpoint('http://admin:admin@90.177.121.44:8001/api/workflows/SIMPLETEST?action=createOrder');

//Set the HTTPRequest body
req.setBody(JSONString);

Http http = new Http();

try {
    //Execute web service call here
    HTTPResponse res = http.send(req);

    //Helpful debug messages
    System.debug(res.toString());
    System.debug('STATUS:'+res.getStatus());
    System.debug('STATUS_CODE:'+res.getStatusCode());
} catch(System.CalloutException e) {
  //Exception handling goes here....
}
