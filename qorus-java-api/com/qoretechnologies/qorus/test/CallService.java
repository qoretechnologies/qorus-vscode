/** Java wrapper for the Qorus CallService Action class
 *
 */
package com.qoretechnologies.qorus.test;

// Java imports
import java.util.Map;

// Qore jni imports
import org.qore.jni.QoreJavaApi;

// Qorus imports
import com.qoretechnologies.qorus.test.*;

//! Call a Qorus service method
public class CallService extends Action {
    //! call a service method with the given args
    /** @param call a service identifier string in a name.method form
        @param args any additional arguments are used as service method arguments

        @code{.java}
        // call system service method fs.ls("/tmp")
        CallService call("fs.ls", "/tmp");
        @endcode
    */
    public CallService(String call, Object... args) throws Throwable {
        super(QoreJavaApi.newObjectSave("CallService", call, args));
    }

    //! call a service method with no arguments
    /** @param call a service identifier string in a name.method form.
    */
    public CallService(String call) throws Throwable {
        super(QoreJavaApi.newObjectSave("CallService", call));
    }

    //! call a service method with the given args
    /** @param service the name of the service
        @param method the method to call
        @param args any additional arguments are used as service method arguments

        Any additional arguments are used as service method arguments.

        @code{.java}
        // call system service method fs.ls("/tmp")
        CallService call("fs", "ls", "/tmp");
        @endcode
    */
    public CallService(String service, String method, Object... args) throws Throwable {
        super(QoreJavaApi.newObjectSave("CallService", service, method, args));
    }

    //! call a service method with no arguments
    /** @param service the name of the service
        @param method the method to call
    */
    public CallService(String service, String method) throws Throwable {
        super(QoreJavaApi.newObjectSave("CallService", service, method));
    }

    //! calls the service method
    /** @param t QorusInterfaceTest test object
    */
    public Object run(QorusInterfaceTest t) throws Throwable {
        return obj.callMethod("run", t);
    }

    //! Returns anything that the service method returned in the run() call
    public Object getResult() throws Throwable {
        return obj.callMethod("getResult");
    }
}
