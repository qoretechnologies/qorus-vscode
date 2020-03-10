/** Java wrapper for the Qorus RunJob Action class
 *
 */
package com.qoretechnologies.qorus.test;

// Java imports
import java.util.Map;
import java.util.HashMap;

// Qore jni imports
import org.qore.jni.QoreJavaApi;
import org.qore.jni.QoreObject;

// Qore lang imports
import org.qore.lang.qunit.*;

// Qorus imports
import com.qoretechnologies.qorus.test.*;

//! This class will run the current job; must be used with @ref QorusJobTest tests
public class RunJob extends Action {
    //! creates the action with no parameters
    public RunJob(QoreObject obj) throws Throwable {
        super(obj);
    }

    //! creates the action with no parameters
    public RunJob() throws Throwable {
        super(QoreJavaApi.newObjectSave("RunJob"));
    }

    //! runs the current job
    /** @param t QorusInterfaceTest test object; must be a @ref QorusJobTest object, or the test will fail
    */
    public Object run(QorusInterfaceTest t) throws Throwable {
        return obj.callMethod("run", t);
    }

    //! returns a hash of job instance information created by the run() method
    @SuppressWarnings("unchecked")
    public HashMap<String, Object> getJobResult() throws Throwable {
        return (HashMap<String, Object>)obj.callMethod("getJobResult");
    }
}
