/** Java wrapper for the Qorus UnblockOrder Action class
 *
 */
package com.qoretechnologies.qorus.test;

// Qore jni imports
import org.qore.jni.QoreJavaApi;

// Qore lang imports
import org.qore.lang.qunit.*;

// Qorus imports
import com.qoretechnologies.qorus.test.*;

//! This class will unblock an order and verify its status after unblocking
public class UnblockOrder extends Action {
    //! creates the action with the workflow instance ID
    /** @param wfiid the workflow instance ID
        @param status the expected status after unblocking
    */
    public UnblockOrder(int wfiid, String status) throws Throwable {
        super(QoreJavaApi.newObjectSave("UnblockOrder", wfiid, status));
    }

    //! creates an action that will unblock the given order and ensure that it has status @ref OMQ.StatReady "READY"
    /** @param wfiid the workflow instance ID
    */
    public UnblockOrder(int wfiid) throws Throwable {
        super(QoreJavaApi.newObjectSave("UnblockOrder", wfiid));
    }

    //! unblocks the order and verifies the expected workflow order status
    /** @param t QorusInterfaceTest test object
    */
    public Object run(QorusInterfaceTest t) throws Throwable {
        return obj.callMethod("run", t);
    }
}
