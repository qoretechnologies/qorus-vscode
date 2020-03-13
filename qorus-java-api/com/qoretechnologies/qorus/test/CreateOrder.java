/** Java wrapper for the Qorus CreateOrder Action class
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

// Qorus imports
import com.qoretechnologies.qorus.test.*;

//! This class will create a workflow order
public class CreateOrder extends Action {
    //! creates the action with the workflow name, static data, and other optional information
    /** @param name the workflow name for the order
        @param staticdata the workflow order's static data
        @param create_opts any other options (except staticdata) to be used when creating the workflow order
    */
    public CreateOrder(String name, Map<String, Object> staticdata, Map<String, Object> create_opts)
        throws Throwable {
        super(QoreJavaApi.newObjectSave("CreateOrder", name, staticdata, create_opts));
    }

    //! creates the workflow order
    /** @param t QorusInterfaceTest test object
    */
    public Object run(QorusInterfaceTest t) throws Throwable {
        return obj.callMethod("run", t);
    }

    //! returns the workflow instance ID created
    public int wfiid() throws Throwable {
        return (int)obj.callMethod("wfiid");
    }
}
