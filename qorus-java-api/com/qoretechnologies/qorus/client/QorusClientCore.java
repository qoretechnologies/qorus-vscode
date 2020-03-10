/** Java wrapper for the QorusClientCore class
 *
 */
package com.qoretechnologies.qorus.client;

// Java imports
import java.util.HashMap;

// Qore jni imports
import org.qore.jni.QoreObject;
import org.qore.jni.QoreObjectWrapper;
import org.qore.jni.QoreJavaApi;

//! main Qorus Java client class
public class QorusClientCore extends QoreObjectWrapper {
    // static initialization
    static {
        // initialize Qorus and load the QorusClientCore module
        try {
            QoreJavaApi.initQore();
            QoreJavaApi.callFunction("load_module", "QorusClientCore");
        } catch (Throwable e) {
            throw new ExceptionInInitializerError(e);
        }
    }

    //! creates the client object
    public QorusClientCore(QoreObject obj) {
        super(obj);
    }

    //! the client initialization function where any errors cause an error message to be displayed and exit() is called
    /** creates global objects; throws exceptions on errors

        @param ignore_warnings if @ref True then warnings will be suppressed

        @see init2()
     */
    public static void init(boolean ignore_warnings) throws Throwable {
        QoreJavaApi.callStaticMethod("QorusClient", "init", ignore_warnings);
    }

    //! the client initialization function where any errors cause an error message to be displayed and exit() is called
    /** creates global objects; throws exceptions on errors

        @see init2()
     */
    public static void init() throws Throwable {
        QoreJavaApi.callStaticMethod("QorusClient", "init");
    }

    //! the main client initialization method; other functions call this one to initialize the client library
    /** creates global objects; throws exceptions on errors

        @param ignore_warnings if @ref True then warnings will be suppressed

        @see init()
    */
    public static void init2(boolean ignore_warnings) throws Throwable {
        QoreJavaApi.callStaticMethod("QorusClient", "init2", ignore_warnings);
    }

    //! the main client initialization method; other functions call this one to initialize the client library
    /** creates global objects; throws exceptions on errors

        @see init()
    */
    public static void init2() throws Throwable {
        QoreJavaApi.callStaticMethod("QorusClient", "init2");
    }

    //! option-parsing function: parses the option file
    /** this function calls qorus_client_init() to ensure the client library is initialized
        @return a hash of the options in the given domain
     */
    @SuppressWarnings("unchecked")
    public static HashMap<String, Object> parseOptions(String domain) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("QorusClient", "parseOptions", domain);
    }

    //! option-parsing function: parses the option file
    /** @return a hash of hashes; the first level hash key represents the domain, the second level is the option=value within that option domain
     */
    @SuppressWarnings("unchecked")
    public static HashMap<String, Object> parseOptions() throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("QorusClient", "parseOptions");
    }
}