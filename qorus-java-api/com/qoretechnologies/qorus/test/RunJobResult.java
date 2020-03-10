/** Java wrapper for the Qorus RunJobResult Action class
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

//! This class will run the current job and compares the result status and optionally job instance information; must be used with @ref QorusJobTest tests
public class RunJobResult extends RunJob {
    //! creates the object with the expected status value and an optional info hash
    /** @param expected_status the expected status of the job instance
        @param expected_info the optional expected info hash of the job instance
    */
    public RunJobResult(String expected_status, Map<String, Object> expected_info) throws Throwable {
        super(QoreJavaApi.newObjectSave("RunJobResult", expected_status, expected_info));
    }

    //! creates the object with the expected status value
    /** @param expected_status the expected status of the job instance
    */
    public RunJobResult(String expected_status) throws Throwable {
        super(QoreJavaApi.newObjectSave("RunJobResult", expected_status));
    }

    //! runs the job and gets the job result information hash; tests for the expected status and any job information given in the constructor
    /** @param t QorusInterfaceTest test object; must be a @ref QorusJobTest object, or the test will fail
    */
    public Object run(QorusInterfaceTest t) throws Throwable {
        return obj.callMethod("run", t);
    }
}
