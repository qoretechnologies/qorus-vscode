/** Java wrapper for the Qorus CheckRunningWorkflow Action class
 *
 */
package com.qoretechnologies.qorus.test;

// Java imports
import java.util.Map;

// Qore jni imports
import org.qore.jni.QoreJavaApi;

// Qore lang imports
import org.qore.lang.qunit.*;

// Qorus imports
import com.qoretechnologies.qorus.test.*;

//! This class will ensure a workflow is running
public class CheckRunningWorkflow extends Action {
    //! creates the object according to the arguments
    /** @param name the workflow name
        @param version the optional workflow version string
        @param timeout_ms the timeout to wait if the workflow is running in milliseconds
    */
    public CheckRunningWorkflow(String name, String version, int timeout_ms) throws Throwable {
        super(QoreJavaApi.newObjectSave("CheckRunningWorkflow", name, version, timeout_ms));
    }

    //! creates the object according to the arguments
    /** @param name the workflow name
        @param version the optional workflow version string
    */
    public CheckRunningWorkflow(String name, String version) throws Throwable {
        super(QoreJavaApi.newObjectSave("CheckRunningWorkflow", name, version));
    }

    //! creates the object according to the arguments
    /** @param name the workflow name
    */
    public CheckRunningWorkflow(String name) throws Throwable {
        super(QoreJavaApi.newObjectSave("CheckRunningWorkflow", name));
    }

    //! checks if the given workflow is running
    /** @param t QorusInterfaceTest test object
    */
    public Object run(QorusInterfaceTest t) throws Throwable {
        return obj.callMethod("run", t);
    }
}
