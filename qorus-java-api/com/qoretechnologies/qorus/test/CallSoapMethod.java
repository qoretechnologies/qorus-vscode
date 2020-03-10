/** Java wrapper for the Qorus CallSoapMethod Action class
 *
 */
package com.qoretechnologies.qorus.test;

// Java imports
import java.util.Map;
import java.util.HashMap;

// Qore jni imports
import org.qore.jni.QoreJavaApi;

// Qore lang imports
import org.qore.lang.qunit.*;
import org.qore.lang.soapclient.*;

// Qorus imports
import com.qoretechnologies.qorus.test.*;

//! This class will invokes a SOAP operation and optionally check the response
/**
    @par If the response is not known in advance:
    @code{.java}
    exec(new CallSoapMethod("wdsl file name", "service url", "SOAP operation name", args).expectResponse(response_hash));
    @endcode

    @par If the response is not known in advance:
    @code{.java}
    Object response = exec(new CallSoapMethod("wdsl file name", "service url", "SOAP operation name", args).getResponse();
    // process the response
    @endcode
*/
public class CallSoapMethod extends Action {
    //! Creates the action from the arguments
    /**
        @param soapClient the SoapClient instance to use for invoking the operation
        @param operation the name of the SOAP operation to invoke
        @param args the arguments to the operation
    */
    public CallSoapMethod(SoapClient soapClient, String operation, Object args) throws Throwable {
        super(QoreJavaApi.newObjectSave("CallSoapMethod", soapClient, operation, args));
    }

    //! Creates the action from the arguments
    /**
        @param wsdl the name of the WSDL file
        @param url the URL of the server
        @param operation the name of the SOAP operation to invoke
        @param args the arguments to the operation
    */
    public CallSoapMethod(String wsdl, String url, String operation, Object args) throws Throwable {
        super(QoreJavaApi.newObjectSave("CallSoapMethod", wsdl, url, operation, args));
    }

    //! Sets the expected response to be checked by run()
    /**
        @param expectedResponse the expected response

        @return this for chaining
    */
    public CallSoapMethod expectResponse(Object expectedResponse) throws Throwable {
        return (CallSoapMethod)obj.callMethod("expectResponse", expectedResponse);
    }

    //! Invokes the SOAP operation specified in constructor and optionally checks the response if the expectResponse() method was called
    /** @param t QorusInterfaceTest test object
    */
    public Object run(QorusInterfaceTest t) throws Throwable {
        return obj.callMethod("run", t);
    }

    //! Returns the actual value returned by the SOAP operation
    /**
        @return the actual value returned by the SOAP operation
    */
    public Object getResponse() throws Throwable {
        return obj.callMethod("getResponse");
    }

    //! Returns a hash of technical information about the SOAP call (raw message info and headers)
    /**
        @return a hash of technical information about the SOAP call (raw message info and headers)
    */
    @SuppressWarnings("unchecked")
    public HashMap<String, Object> getInfo() throws Throwable {
        return (HashMap<String, Object>)obj.callMethod("getInfo");
    }
}
