/** Java wrapper for the Qorus Action class
 *
 */
package com.qoretechnologies.qorus.test;

// Qore jni miports
import org.qore.jni.QoreObjectWrapper;
import org.qore.jni.QoreObject;

// Qorus imports
import com.qoretechnologies.qorus.test.*;

//! abstract class representing an action in a test case
public abstract class Action extends QoreObjectWrapper {
    //! protected constructor to create the wrapper object
    protected Action(QoreObject obj) {
        super(obj);
    }

    //! runs the test
    /** @param test QorusInterfaceTest test object

        checks current output and return some value if any returned from corresponding test case
    */
    abstract Object run(QorusInterfaceTest test) throws Throwable;
}
