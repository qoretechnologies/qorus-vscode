/** Qorus Java QorusSystemRestHelper class
 *
 */
package com.qoretechnologies.qorus;

// java imports
import java.util.HashMap;

// jni module imports
import org.qore.jni.QoreObject;
import org.qore.jni.QoreJavaApi;

// qore imports
import org.qore.lang.HTTPClient;

//! Java wrapper for the @ref OMQ::QorusSystemRestHelper class in Qore
public class QorusSystemRestHelper extends HTTPClient {
    //! creates the object as a wrapper for the Qore object
    public QorusSystemRestHelper(QoreObject obj) {
        super(obj);
    }

    //! creates the object pointing to the first local listener for the current instance
    /** @since Qorus 3.0.2
    */
    public QorusSystemRestHelper() throws Throwable {
        super(QoreJavaApi.newObjectSave("QorusSystemRestHelper"));
    }

    //! creates the object with the configuration given by the name of the @ref remoteconn "remote instance"
    public QorusSystemRestHelper(String name) throws Throwable {
        super(QoreJavaApi.newObjectSave("QorusSystemRestHelper", name));
    }

    //! creates the object pointing to the first local listener for the current instance using the given user and password for connecting
    /** @param username the username for the connection
        @param password the password for the connection

        @since Qorus 3.0.2
    */
    public QorusSystemRestHelper(String username, String password) throws Throwable {
        super(QoreJavaApi.newObjectSave("QorusSystemRestHelper", username, password));
    }

    //! creates the object with the configuration given
    public QorusSystemRestHelper(HashMap<String, Object> info) throws Throwable {
        super(QoreJavaApi.newObjectSave("QorusSystemRestHelper", info));
    }

    //! executes a \c GET call on the remote REST service and returns the response
    /** @param path the URI path for the request
        @param args any arguments to the REST request
        @param hdr a hash of optional HTTP header info to add to the request

        @return a hash with the following keys:
        - \c rv: the deserialized response body
        - \c info: a hash of request headers and other information about the HTTP request; if present the hash will contain the following keys:
          - \c headers: a hash of outgoing HTTP request headers
          - \c request-uri: the request URI string sent (ex: \c "GET /services/async/38.0/job HTTP/1.1")
          - \c body-content-type: the outgoing message body Mime \c Content-Type value
          - \c response-headers: a hash of incoming HTTP headers in the response
          - \c chunked: set to @ref Qore::True "True" if the response was received with chunked transfer encoding
          - \c response-code: the HTTP response code
          - \c response-body: the raw message body in the response (after any content decoding)
          - \c response-serialization: the type of message serialization in the response; see @ref RestClient::RestClient::DataSerializationOptions for possible values
          - \c request-body: the raw message body in the request (before any content encoding)
          - \c request-serialization: the type of message serialization in the request; see @ref RestClient::RestClient::DataSerializationOptions for possible values
    */
    @SuppressWarnings("unchecked")
    public HashMap<String, Object> getRestWithInfo(String path, Object args, HashMap<String, Object> hdr) throws Throwable {
        return (HashMap<String, Object>)obj.callMethod("getWithInfo", path, args, hdr);
    }

    //! executes a \c GET call on the remote REST service and returns the response
    /** @param path the URI path for the request
        @param args any arguments to the REST request

        @return a hash with the following keys:
        - \c rv: the deserialized response body
        - \c info: a hash of request headers and other information about the HTTP request; if present the hash will contain the following keys:
          - \c headers: a hash of outgoing HTTP request headers
          - \c request-uri: the request URI string sent (ex: \c "GET /services/async/38.0/job HTTP/1.1")
          - \c body-content-type: the outgoing message body Mime \c Content-Type value
          - \c response-headers: a hash of incoming HTTP headers in the response
          - \c chunked: set to @ref Qore::True "True" if the response was received with chunked transfer encoding
          - \c response-code: the HTTP response code
          - \c response-body: the raw message body in the response (after any content decoding)
          - \c response-serialization: the type of message serialization in the response; see @ref RestClient::RestClient::DataSerializationOptions for possible values
          - \c request-body: the raw message body in the request (before any content encoding)
          - \c request-serialization: the type of message serialization in the request; see @ref RestClient::RestClient::DataSerializationOptions for possible values
    */
    @SuppressWarnings("unchecked")
    public HashMap<String, Object> getRestWithInfo(String path, Object args) throws Throwable {
        return (HashMap<String, Object>)obj.callMethod("getWithInfo", path, args);
    }

    //! executes a \c GET call on the remote REST service and returns the response
    /** @param path the URI path for the request

        @return a hash with the following keys:
        - \c rv: the deserialized response body
        - \c info: a hash of request headers and other information about the HTTP request; if present the hash will contain the following keys:
          - \c headers: a hash of outgoing HTTP request headers
          - \c request-uri: the request URI string sent (ex: \c "GET /services/async/38.0/job HTTP/1.1")
          - \c body-content-type: the outgoing message body Mime \c Content-Type value
          - \c response-headers: a hash of incoming HTTP headers in the response
          - \c chunked: set to @ref Qore::True "True" if the response was received with chunked transfer encoding
          - \c response-code: the HTTP response code
          - \c response-body: the raw message body in the response (after any content decoding)
          - \c response-serialization: the type of message serialization in the response; see @ref RestClient::RestClient::DataSerializationOptions for possible values
          - \c request-body: the raw message body in the request (before any content encoding)
          - \c request-serialization: the type of message serialization in the request; see @ref RestClient::RestClient::DataSerializationOptions for possible values
    */
    @SuppressWarnings("unchecked")
    public HashMap<String, Object> getRestWithInfo(String path) throws Throwable {
        return (HashMap<String, Object>)obj.callMethod("getWithInfo", path);
    }

    //! executes a \c GET call on the remote REST service and returns the response
    /** @param path the URI path for the request
        @param args any arguments to the REST request
        @param hdr a hash of optional HTTP header info to add to the request

        @return the deserialized response body
    */
    public Object getRest(String path, Object args, HashMap<String, Object> hdr) throws Throwable {
        return obj.callMethod("get", path, args, hdr);
    }

    //! executes a \c GET call on the remote REST service and returns the response
    /** @param path the URI path for the request
        @param args any arguments to the REST request

        @return the deserialized response body
    */
    public Object getRest(String path, Object args) throws Throwable {
        return obj.callMethod("get", path, args);
    }

    //! executes a \c GET call on the remote REST service and returns the response
    /** @param path the URI path for the request

        @return the deserialized response body
    */
    public Object getRest(String path) throws Throwable {
        return obj.callMethod("get", path);
    }

    //! executes a \c PUT call on the remote REST service and returns the response
    /** @param path the URI path for the request
        @param args any arguments to the REST request
        @param hdr a hash of optional HTTP header info to add to the request

        @return a hash with the following keys:
        - \c rv: the deserialized response body
        - \c info: a hash of request headers and other information about the HTTP request; if present the hash will contain the following keys:
          - \c headers: a hash of outgoing HTTP request headers
          - \c request-uri: the request URI string sent (ex: \c "PUT /services/async/38.0/job HTTP/1.1")
          - \c body-content-type: the outgoing message body Mime \c Content-Type value
          - \c response-headers: a hash of incoming HTTP headers in the response
          - \c chunked: set to @ref Qore::True "True" if the response was received with chunked transfer encoding
          - \c response-code: the HTTP response code
          - \c response-body: the raw message body in the response (after any content decoding)
          - \c response-serialization: the type of message serialization in the response; see @ref RestClient::RestClient::DataSerializationOptions for possible values
          - \c request-body: the raw message body in the request (before any content encoding)
          - \c request-serialization: the type of message serialization in the request; see @ref RestClient::RestClient::DataSerializationOptions for possible values
    */
    @SuppressWarnings("unchecked")
    public HashMap<String, Object> putRestWithInfo(String path, Object args, HashMap<String, Object> hdr) throws Throwable {
        return (HashMap<String, Object>)obj.callMethod("putWithInfo", path, args, hdr);
    }

    //! executes a \c PUT call on the remote REST service and returns the response
    /** @param path the URI path for the request
        @param args any arguments to the REST request

        @return a hash with the following keys:
        - \c rv: the deserialized response body
        - \c info: a hash of request headers and other information about the HTTP request; if present the hash will contain the following keys:
          - \c headers: a hash of outgoing HTTP request headers
          - \c request-uri: the request URI string sent (ex: \c "PUT /services/async/38.0/job HTTP/1.1")
          - \c body-content-type: the outgoing message body Mime \c Content-Type value
          - \c response-headers: a hash of incoming HTTP headers in the response
          - \c chunked: set to @ref Qore::True "True" if the response was received with chunked transfer encoding
          - \c response-code: the HTTP response code
          - \c response-body: the raw message body in the response (after any content decoding)
          - \c response-serialization: the type of message serialization in the response; see @ref RestClient::RestClient::DataSerializationOptions for possible values
          - \c request-body: the raw message body in the request (before any content encoding)
          - \c request-serialization: the type of message serialization in the request; see @ref RestClient::RestClient::DataSerializationOptions for possible values
    */
    @SuppressWarnings("unchecked")
    public HashMap<String, Object> putRestWithInfo(String path, Object args) throws Throwable {
        return (HashMap<String, Object>)obj.callMethod("putWithInfo", path, args);
    }

    //! executes a \c PUT call on the remote REST service and returns the response
    /** @param path the URI path for the request

        @return a hash with the following keys:
        - \c rv: the deserialized response body
        - \c info: a hash of request headers and other information about the HTTP request; if present the hash will contain the following keys:
          - \c headers: a hash of outgoing HTTP request headers
          - \c request-uri: the request URI string sent (ex: \c "PUT /services/async/38.0/job HTTP/1.1")
          - \c body-content-type: the outgoing message body Mime \c Content-Type value
          - \c response-headers: a hash of incoming HTTP headers in the response
          - \c chunked: set to @ref Qore::True "True" if the response was received with chunked transfer encoding
          - \c response-code: the HTTP response code
          - \c response-body: the raw message body in the response (after any content decoding)
          - \c response-serialization: the type of message serialization in the response; see @ref RestClient::RestClient::DataSerializationOptions for possible values
          - \c request-body: the raw message body in the request (before any content encoding)
          - \c request-serialization: the type of message serialization in the request; see @ref RestClient::RestClient::DataSerializationOptions for possible values
    */
    @SuppressWarnings("unchecked")
    public HashMap<String, Object> putRestithInfo(String path) throws Throwable {
        return (HashMap<String, Object>)obj.callMethod("putWithInfo", path);
    }

    //! executes a \c PUT call on the remote REST service and returns the response
    /** @param path the URI path for the request
        @param args any arguments to the REST request
        @param hdr a hash of optional HTTP header info to add to the request

        @return the deserialized response body
    */
    public Object putRest(String path, Object args, HashMap<String, Object> hdr) throws Throwable {
        return obj.callMethod("put", path, args, hdr);
    }

    //! executes a \c PUT call on the remote REST service and returns the response
    /** @param path the URI path for the request
        @param args any arguments to the REST request

        @return the deserialized response body
    */
    public Object putRest(String path, Object args) throws Throwable {
        return obj.callMethod("put", path, args);
    }

    //! executes a \c PUT call on the remote REST service and returns the response
    /** @param path the URI path for the request

        @return the deserialized response body
    */
    public Object putRest(String path) throws Throwable {
        return obj.callMethod("put", path);
    }

    //! executes a \c POST call on the remote REST service and returns the response
    /** @param path the URI path for the request
        @param args any arguments to the REST request
        @param hdr a hash of optional HTTP header info to add to the request

        @return a hash with the following keys:
        - \c rv: the deserialized response body
        - \c info: a hash of request headers and other information about the HTTP request; if present the hash will contain the following keys:
          - \c headers: a hash of outgoing HTTP request headers
          - \c request-uri: the request URI string sent (ex: \c "POST /services/async/38.0/job HTTP/1.1")
          - \c body-content-type: the outgoing message body Mime \c Content-Type value
          - \c response-headers: a hash of incoming HTTP headers in the response
          - \c chunked: set to @ref Qore::True "True" if the response was received with chunked transfer encoding
          - \c response-code: the HTTP response code
          - \c response-body: the raw message body in the response (after any content decoding)
          - \c response-serialization: the type of message serialization in the response; see @ref RestClient::RestClient::DataSerializationOptions for possible values
          - \c request-body: the raw message body in the request (before any content encoding)
          - \c request-serialization: the type of message serialization in the request; see @ref RestClient::RestClient::DataSerializationOptions for possible values
    */
    @SuppressWarnings("unchecked")
    public HashMap<String, Object> postRestWithInfo(String path, Object args, HashMap<String, Object> hdr) throws Throwable {
        return (HashMap<String, Object>)obj.callMethod("postWithInfo", path, args, hdr);
    }

    //! executes a \c POST call on the remote REST service and returns the response
    /** @param path the URI path for the request
        @param args any arguments to the REST request

        @return a hash with the following keys:
        - \c rv: the deserialized response body
        - \c info: a hash of request headers and other information about the HTTP request; if present the hash will contain the following keys:
          - \c headers: a hash of outgoing HTTP request headers
          - \c request-uri: the request URI string sent (ex: \c "POST /services/async/38.0/job HTTP/1.1")
          - \c body-content-type: the outgoing message body Mime \c Content-Type value
          - \c response-headers: a hash of incoming HTTP headers in the response
          - \c chunked: set to @ref Qore::True "True" if the response was received with chunked transfer encoding
          - \c response-code: the HTTP response code
          - \c response-body: the raw message body in the response (after any content decoding)
          - \c response-serialization: the type of message serialization in the response; see @ref RestClient::RestClient::DataSerializationOptions for possible values
          - \c request-body: the raw message body in the request (before any content encoding)
          - \c request-serialization: the type of message serialization in the request; see @ref RestClient::RestClient::DataSerializationOptions for possible values
    */
    @SuppressWarnings("unchecked")
    public HashMap<String, Object> postRestWithInfo(String path, Object args) throws Throwable {
        return (HashMap<String, Object>)obj.callMethod("postWithInfo", path, args);
    }

    //! executes a \c POST call on the remote REST service and returns the response
    /** @param path the URI path for the request

        @return a hash with the following keys:
        - \c rv: the deserialized response body
        - \c info: a hash of request headers and other information about the HTTP request; if present the hash will contain the following keys:
          - \c headers: a hash of outgoing HTTP request headers
          - \c request-uri: the request URI string sent (ex: \c "POST /services/async/38.0/job HTTP/1.1")
          - \c body-content-type: the outgoing message body Mime \c Content-Type value
          - \c response-headers: a hash of incoming HTTP headers in the response
          - \c chunked: set to @ref Qore::True "True" if the response was received with chunked transfer encoding
          - \c response-code: the HTTP response code
          - \c response-body: the raw message body in the response (after any content decoding)
          - \c response-serialization: the type of message serialization in the response; see @ref RestClient::RestClient::DataSerializationOptions for possible values
          - \c request-body: the raw message body in the request (before any content encoding)
          - \c request-serialization: the type of message serialization in the request; see @ref RestClient::RestClient::DataSerializationOptions for possible values
    */
    @SuppressWarnings("unchecked")
    public HashMap<String, Object> postRestWithInfo(String path) throws Throwable {
        return (HashMap<String, Object>)obj.callMethod("postWithInfo", path);
    }

    //! executes a \c POST call on the remote REST service and returns the response
    /** @param path the URI path for the request
        @param args any arguments to the REST request
        @param hdr a hash of optional HTTP header info to add to the request

        @return the deserialized response body
    */
    public Object postRest(String path, Object args, HashMap<String, Object> hdr) throws Throwable {
        return obj.callMethod("post", path, args, hdr);
    }

    //! executes a \c POST call on the remote REST service and returns the response
    /** @param path the URI path for the request
        @param args any arguments to the REST request

        @return the deserialized response body
    */
    public Object postRest(String path, Object args) throws Throwable {
        return obj.callMethod("post", path, args);
    }

    //! executes a \c POST call on the remote REST service and returns the response
    /** @param path the URI path for the request

        @return the deserialized response body
    */
    public Object postRest(String path) throws Throwable {
        return obj.callMethod("post", path);
    }

    //! executes a \c DELETE call on the remote REST service and returns the response
    /** @param path the URI path for the request
        @param args any arguments to the REST request
        @param hdr a hash of optional HTTP header info to add to the request

        @return a hash with the following keys:
        - \c rv: the deserialized response body
        - \c info: a hash of request headers and other information about the HTTP request; if present the hash will contain the following keys:
          - \c headers: a hash of outgoing HTTP request headers
          - \c request-uri: the request URI string sent (ex: \c "DELETE /services/async/38.0/job HTTP/1.1")
          - \c body-content-type: the outgoing message body Mime \c Content-Type value
          - \c response-headers: a hash of incoming HTTP headers in the response
          - \c chunked: set to @ref Qore::True "True" if the response was received with chunked transfer encoding
          - \c response-code: the HTTP response code
          - \c response-body: the raw message body in the response (after any content decoding)
          - \c response-serialization: the type of message serialization in the response; see @ref RestClient::RestClient::DataSerializationOptions for possible values
          - \c request-body: the raw message body in the request (before any content encoding)
          - \c request-serialization: the type of message serialization in the request; see @ref RestClient::RestClient::DataSerializationOptions for possible values
    */
    @SuppressWarnings("unchecked")
    public HashMap<String, Object> delRestWithInfo(String path, Object args, HashMap<String, Object> hdr) throws Throwable {
        return (HashMap<String, Object>)obj.callMethod("delWithInfo", path, args, hdr);
    }

    //! executes a \c DELETE call on the remote REST service and returns the response
    /** @param path the URI path for the request
        @param args any arguments to the REST request

        @return a hash with the following keys:
        - \c rv: the deserialized response body
        - \c info: a hash of request headers and other information about the HTTP request; if present the hash will contain the following keys:
          - \c headers: a hash of outgoing HTTP request headers
          - \c request-uri: the request URI string sent (ex: \c "DELETE /services/async/38.0/job HTTP/1.1")
          - \c body-content-type: the outgoing message body Mime \c Content-Type value
          - \c response-headers: a hash of incoming HTTP headers in the response
          - \c chunked: set to @ref Qore::True "True" if the response was received with chunked transfer encoding
          - \c response-code: the HTTP response code
          - \c response-body: the raw message body in the response (after any content decoding)
          - \c response-serialization: the type of message serialization in the response; see @ref RestClient::RestClient::DataSerializationOptions for possible values
          - \c request-body: the raw message body in the request (before any content encoding)
          - \c request-serialization: the type of message serialization in the request; see @ref RestClient::RestClient::DataSerializationOptions for possible values
    */
    @SuppressWarnings("unchecked")
    public HashMap<String, Object> delRestWithInfo(String path, Object args) throws Throwable {
        return (HashMap<String, Object>)obj.callMethod("delWithInfo", path, args);
    }

    //! executes a \c DELETE call on the remote REST service and returns the response
    /** @param path the URI path for the request

        @return a hash with the following keys:
        - \c rv: the deserialized response body
        - \c info: a hash of request headers and other information about the HTTP request; if present the hash will contain the following keys:
          - \c headers: a hash of outgoing HTTP request headers
          - \c request-uri: the request URI string sent (ex: \c "DELETE /services/async/38.0/job HTTP/1.1")
          - \c body-content-type: the outgoing message body Mime \c Content-Type value
          - \c response-headers: a hash of incoming HTTP headers in the response
          - \c chunked: set to @ref Qore::True "True" if the response was received with chunked transfer encoding
          - \c response-code: the HTTP response code
          - \c response-body: the raw message body in the response (after any content decoding)
          - \c response-serialization: the type of message serialization in the response; see @ref RestClient::RestClient::DataSerializationOptions for possible values
          - \c request-body: the raw message body in the request (before any content encoding)
          - \c request-serialization: the type of message serialization in the request; see @ref RestClient::RestClient::DataSerializationOptions for possible values
    */
    @SuppressWarnings("unchecked")
    public HashMap<String, Object> delRestWithInfo(String path) throws Throwable {
        return (HashMap<String, Object>)obj.callMethod("delWithInfo", path);
    }

    //! executes a \c DELETE call on the remote REST service and returns the response
    /** @param path the URI path for the request
        @param args any arguments to the REST request
        @param hdr a hash of optional HTTP header info to add to the request

        @return the deserialized response body
    */
    public Object delRest(String path, Object args, HashMap<String, Object> hdr) throws Throwable {
        return obj.callMethod("del", path, args, hdr);
    }

    //! executes a \c DELETE call on the remote REST service and returns the response
    /** @param path the URI path for the request
        @param args any arguments to the REST request

        @return the deserialized response body
    */
    public Object delRest(String path, Object args) throws Throwable {
        return obj.callMethod("del", path, args);
    }

    //! executes a \c DELETE call on the remote REST service and returns the response
    /** @param path the URI path for the request

        @return the deserialized response body
    */
    public Object delRest(String path) throws Throwable {
        return obj.callMethod("del", path);
    }

    //! executes the remote REST call and returns the response
    /** @param m the HTTP method for the request (ex: \c "GET")
        @param path the URI path for the request
        @param args any arguments to the REST request
        @param hdr a hash of optional HTTP header info to add to the request

        @return a hash with the following keys:
        - \c rv: the deserialized response body
        - \c info: a hash of request headers and other information about the HTTP request; if present the hash will contain the following keys:
          - \c headers: a hash of outgoing HTTP request headers
          - \c request-uri: the request URI string sent (ex: \c "DELETE /services/async/38.0/job HTTP/1.1")
          - \c body-content-type: the outgoing message body Mime \c Content-Type value
          - \c response-headers: a hash of incoming HTTP headers in the response
          - \c chunked: set to @ref Qore::True "True" if the response was received with chunked transfer encoding
          - \c response-code: the HTTP response code
          - \c response-body: the raw message body in the response (after any content decoding)
          - \c response-serialization: the type of message serialization in the response; see @ref RestClient::RestClient::DataSerializationOptions for possible values
          - \c request-body: the raw message body in the request (before any content encoding)
          - \c request-serialization: the type of message serialization in the request; see @ref RestClient::RestClient::DataSerializationOptions for possible values
    */
    @SuppressWarnings("unchecked")
    public HashMap<String, Object> restDoWithInfo(String m, String path, Object args, HashMap<String, Object> hdr) throws Throwable {
        return (HashMap<String, Object>)obj.callMethod("restDoWithInfo", m, path, args, hdr);
    }

    //! executes the remote REST call and returns the response
    /** @param m the HTTP method for the request (ex: \c "GET")
        @param path the URI path for the request
        @param args any arguments to the REST request

        @return a hash with the following keys:
        - \c rv: the deserialized response body
        - \c info: a hash of request headers and other information about the HTTP request; if present the hash will contain the following keys:
          - \c headers: a hash of outgoing HTTP request headers
          - \c request-uri: the request URI string sent (ex: \c "DELETE /services/async/38.0/job HTTP/1.1")
          - \c body-content-type: the outgoing message body Mime \c Content-Type value
          - \c response-headers: a hash of incoming HTTP headers in the response
          - \c chunked: set to @ref Qore::True "True" if the response was received with chunked transfer encoding
          - \c response-code: the HTTP response code
          - \c response-body: the raw message body in the response (after any content decoding)
          - \c response-serialization: the type of message serialization in the response; see @ref RestClient::RestClient::DataSerializationOptions for possible values
          - \c request-body: the raw message body in the request (before any content encoding)
          - \c request-serialization: the type of message serialization in the request; see @ref RestClient::RestClient::DataSerializationOptions for possible values
    */
    @SuppressWarnings("unchecked")
    public HashMap<String, Object> restDoWithInfo(String m, String path, Object args) throws Throwable {
        return (HashMap<String, Object>)obj.callMethod("restDoWithInfo", m, path, args);
    }

    //! executes the remote REST call and returns the response
    /** @param m the HTTP method for the request (ex: \c "GET")
        @param path the URI path for the request

        @return a hash with the following keys:
        - \c rv: the deserialized response body
        - \c info: a hash of request headers and other information about the HTTP request; if present the hash will contain the following keys:
          - \c headers: a hash of outgoing HTTP request headers
          - \c request-uri: the request URI string sent (ex: \c "DELETE /services/async/38.0/job HTTP/1.1")
          - \c body-content-type: the outgoing message body Mime \c Content-Type value
          - \c response-headers: a hash of incoming HTTP headers in the response
          - \c chunked: set to @ref Qore::True "True" if the response was received with chunked transfer encoding
          - \c response-code: the HTTP response code
          - \c response-body: the raw message body in the response (after any content decoding)
          - \c response-serialization: the type of message serialization in the response; see @ref RestClient::RestClient::DataSerializationOptions for possible values
          - \c request-body: the raw message body in the request (before any content encoding)
          - \c request-serialization: the type of message serialization in the request; see @ref RestClient::RestClient::DataSerializationOptions for possible values
    */
    @SuppressWarnings("unchecked")
    public HashMap<String, Object> restDoWithInfo(String m, String path) throws Throwable {
        return (HashMap<String, Object>)obj.callMethod("restDoWithInfo", m, path);
    }

    //! executes the remote REST call and returns the response
    /** @param m the HTTP method for the request (ex: \c "GET")
        @param path the URI path for the request
        @param args any arguments to the REST request
        @param hdr a hash of optional HTTP header info to add to the request

        @return the deserialized response body
    */
    public Object restDo(String m, String path, Object args, HashMap<String, Object> hdr) throws Throwable {
        return obj.callMethod("restDo", m, path, args, hdr);
    }

    //! executes the remote REST call and returns the response
    /** @param m the HTTP method for the request (ex: \c "GET")
        @param path the URI path for the request
        @param args any arguments to the REST request

        @return the deserialized response body
    */
    public Object restDo(String m, String path, Object args) throws Throwable {
        return obj.callMethod("restDo", m, path, args);
    }

    //! executes the remote REST call and returns the response
    /** @param m the HTTP method for the request (ex: \c "GET")
        @param path the URI path for the request

        @return the deserialized response body
    */
    public Object restDo(String m, String path) throws Throwable {
        return obj.callMethod("restDo", m, path);
    }
}