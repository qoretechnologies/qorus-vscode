/** Java wrapper for the Qorus QorusServiceTest class
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
public class QorusServiceTest extends QorusInterfaceTest {
    //! creates the object from the arguments; the version number is not given because it's only possible to test the latest version of the service in any case
    /** @param name the service name
        @param svc_type the service type:
        - \c "user": the default
        - \c "system": only for testing system services
    */
    public QorusServiceTest(String name, String svc_type) throws Throwable {
        super(QoreJavaApi.newObjectSave("QorusInterfaceTest::QorusServiceTest", name, svc_type));
    }

    //! creates the object from the arguments; the version number is not given because it's only possible to test the latest version of the service in any case
    /** @param name the service name
    */
    public QorusServiceTest(String name) throws Throwable {
        super(QoreJavaApi.newObjectSave("QorusInterfaceTest::QorusServiceTest", name));
    }

    //! returns the log file name for the current object
    public String getLogFileName() throws Throwable {
        return (String)obj.callMethod("getLogFileName");
    }

    //! checks if the interface can run
    public boolean canRun() throws Throwable {
        return (boolean)obj.callMethod("canRun");
    }
}
