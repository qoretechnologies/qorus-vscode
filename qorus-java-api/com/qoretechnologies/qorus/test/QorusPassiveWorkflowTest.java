/** Java wrapper for the Qorus QorusPassiveWorkflowTest class
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

//! base class for testing Qorus workflows without starting any workflow execution instances
public class QorusPassiveWorkflowTest extends QorusWorkflowTest {
    //! creates the object from the arguments
    /** @param name the workflow name
        @param version the version of the workflow
    */
    public QorusPassiveWorkflowTest(String name, String version) throws Throwable {
        super(name, version);
    }

    //! tests whether the current interface is running in the current Qorus instance
    /** @par Example:
        @code{.java}
        boolean b = t.isInterfaceRunning();
        @endcode
    */
    public boolean isInterfaceRunning() throws Throwable {
        return (boolean)obj.callMethod("isInterfaceRunning");
    }

    //! returns @ref False so that no execution instances will be started when the test is run
    public boolean canRun() throws Throwable {
        return (boolean)obj.callMethod("canRun");
    }
}
