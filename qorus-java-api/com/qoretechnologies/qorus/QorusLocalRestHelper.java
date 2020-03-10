/** Qorus Java QorusLocalRestHelper class
 *
 */
package com.qoretechnologies.qorus;

// java imports
import java.util.Map;

// jni module imports
import org.qore.jni.QoreObject;
import org.qore.jni.QoreObjectWrapper;
import org.qore.jni.QoreJavaApi;

//! Java wrapper for the @ref OMQ::QorusLocalRestHelper class in Qore
/** @since Qorus 4.1
*/
public class QorusLocalRestHelper extends QoreObjectWrapper {
    //! creates the object as a wrapper for the Qore object
    public QorusLocalRestHelper(QoreObject obj) {
        super(obj);
    }

    //! creates the object pointing to the first local listener for the current instance
    public QorusLocalRestHelper() throws Throwable {
        super(QoreJavaApi.newObjectSave("QorusLocalRestHelper"));
    }

    //! makes the REST response and returns the deserialized body
    /** @param m the HTTP method for the request (ex: \c "GET")
        @param path the URI path for the request
        @param args any arguments to the REST request

        @return the deserialized response body
    */
    public Object doRequest(String m, String path, Map<String, Object> args) throws Throwable {
        return obj.callMethod("doRequest", m, path, args);
    }

    //! makes the REST response and returns the deserialized body
    /** @param m the HTTP method for the request (ex: \c "GET")
        @param path the URI path for the request

        @return the deserialized response body
    */
    public Object doRequest(String m, String path) throws Throwable {
        return obj.callMethod("doRequest", m, path);
    }

    //! executes a \c GET call on the remote REST service and returns the response
    /** @param path the URI path for the request
        @param args any arguments to the REST request

        @return the deserialized response body
    */
    public Object get(String path, Map<String, Object> args) throws Throwable {
        return obj.callMethod("get", path, args);
    }

    //! executes a \c GET call on the remote REST service and returns the response
    /** @param path the URI path for the request

        @return the deserialized response body
    */
    public Object get(String path) throws Throwable {
        return obj.callMethod("get", path);
    }

    //! executes a \c PUT call on the remote REST service and returns the response
    /** @param path the URI path for the request
        @param args any arguments to the REST request

        @return the deserialized response body
    */
    public Object put(String path, Map<String, Object> args) throws Throwable {
        return obj.callMethod("put", path, args);
    }

    //! executes a \c PUT call on the remote REST service and returns the response
    /** @param path the URI path for the request

        @return the deserialized response body
    */
    public Object put(String path) throws Throwable {
        return obj.callMethod("put", path);
    }

    //! executes a \c POST call on the remote REST service and returns the response
    /** @param path the URI path for the request
        @param args any arguments to the REST request

        @return the deserialized response body
    */
    public Object post(String path, Map<String, Object> args) throws Throwable {
        return obj.callMethod("post", path, args);
    }

    //! executes a \c POST call on the remote REST service and returns the response
    /** @param path the URI path for the request

        @return the deserialized response body
    */
    public Object post(String path) throws Throwable {
        return obj.callMethod("post", path);
    }

    //! executes a \c DELETE call on the remote REST service and returns the response
    /** @param path the URI path for the request
        @param args any arguments to the REST request

        @return the deserialized response body
    */
    public Object del(String path, Map<String, Object> args) throws Throwable {
        return obj.callMethod("del", path, args);
    }

    //! executes a \c DELETE call on the remote REST service and returns the response
    /** @param path the URI path for the request

        @return the deserialized response body
    */
    public Object del(String path) throws Throwable {
        return obj.callMethod("del", path);
    }
}