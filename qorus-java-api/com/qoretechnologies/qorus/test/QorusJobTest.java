/** Java wrapper for the Qorus QorusJobTest class
 *
 */
package com.qoretechnologies.qorus.test;

// jni module imports
import org.qore.jni.QoreJavaApi;
import org.qore.jni.QoreObject;

// qore lang imports
import org.qore.lang.qunit.Test;

// java imports
import java.time.ZonedDateTime;
import java.util.Map;
import java.util.HashMap;

// Qorus imports
import com.qoretechnologies.qorus.test.*;

//! base class for testing Qorus services
public class QorusJobTest extends QorusInterfaceTest {
    //! creates the object according to the arguments
    /** @param name the job name
        @param version the version of the job
    */
    public QorusJobTest(String name, String version) throws Throwable {
        super(QoreJavaApi.newObjectSave("QorusInterfaceTest::QorusJobTest", name, version));
    }

    //! creates the object according to the arguments
    /** @param name the job name
    */
    public QorusJobTest(String name) throws Throwable {
        super(QoreJavaApi.newObjectSave("QorusInterfaceTest::QorusJobTest", name));
    }

    //! returns the log file name for the current object
    public String getLogFileName() throws Throwable {
        return (String)obj.callMethod("getLogFileName");
    }

    //! checks if the interface can run
    public boolean canRun() throws Throwable {
        return (boolean)obj.callMethod("canRun");
    }

    //! runs the given job and returns the result hash
    @SuppressWarnings("unchecked")
    public HashMap<String, Object> run() throws Throwable {
        return (HashMap<String, Object>)obj.callMethod("run");
    }

    //! returns the job result hash for the given job_instanceid
    @SuppressWarnings("unchecked")
    public HashMap<String, Object> getJobResultHash(int jiid) throws Throwable {
        return (HashMap<String, Object>)obj.callMethod("getJobResultHash", jiid);
    }
}
