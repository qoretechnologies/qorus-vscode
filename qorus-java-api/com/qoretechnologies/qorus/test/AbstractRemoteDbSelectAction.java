/** Java wrapper for the Qorus AbstractRemoteDbSelectAction Action class
 *
 */
package com.qoretechnologies.qorus.test;

// Java imports
import java.util.Map;
import java.util.HashMap;

// Qore jni imports
import org.qore.jni.QoreObject;

// Qorus imports
import com.qoretechnologies.qorus.test.*;

//! Selects one or more rows from a remote table in a remote Qorus instance
public abstract class AbstractRemoteDbSelectAction extends Action {
    //! creates the object as a wrapper for the given Qore object
    /** @param obj the object to be wrapped
    */
    public AbstractRemoteDbSelectAction(QoreObject obj) throws Throwable {
        super(obj);
    }

    //! runs the test by streaming the remote data and calling checkRowImpl() for each row
    /** @param t QorusInterfaceTest test object
    */
    public Object run(QorusInterfaceTest t) throws Throwable {
        return obj.callMethod("run", t);
    }

    //! called for each row received from the remote end; reimplement this in a subclass and implement assertions here
    abstract void checkRowImpl(QorusInterfaceTest t, Map<String, Object> row) throws Throwable;
}
