/** Java wrapper for the Qorus StartLog Action class
 *
 */
package com.qoretechnologies.qorus.test;

// Qore jni imports
import org.qore.jni.QoreJavaApi;

// Qorus imports
import com.qoretechnologies.qorus.test.*;

//! abstract class representing an action in a test case
public class StartLog extends Action {
    //! creates the wrapped object
    StartLog() throws Throwable {
        super(QoreJavaApi.newObjectSave("QorusInterfaceTest::StartLog"));
    }

    //! creates a timestamp in the log file
    public Object run(QorusInterfaceTest t) throws Throwable {
        return obj.callMethod("run", t);
    }
}
