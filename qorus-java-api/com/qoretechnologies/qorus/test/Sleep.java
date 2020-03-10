/** Java wrapper for the Qorus Sleep Action class
 *
 */
package com.qoretechnologies.qorus.test;

// Java imports
import java.util.Map;
import java.util.HashMap;

// Qore jni imports
import org.qore.jni.QoreJavaApi;

// Qorus imports
import com.qoretechnologies.qorus.test.*;

//! sleep action
public class Sleep extends Action {
    //! creates the sleep action object
    /** @param secs the time in seconds
    */
    public Sleep(int secs) throws Throwable {
        super(QoreJavaApi.newObjectSave("Sleep", secs));
    }

    //! sleeps for the given number of seconds
    /** @param t QorusInterfaceTest test object

        performs sleep action
    */
    public Object run(QorusInterfaceTest t) throws Throwable {
        return obj.callMethod("run", t);
    }
}
