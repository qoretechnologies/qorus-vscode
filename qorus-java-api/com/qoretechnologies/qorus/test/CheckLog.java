/** Java wrapper for the Qorus CheckLog Action class
 *
 */
package com.qoretechnologies.qorus.test;

// Qore jni imports
import org.qore.jni.QoreJavaApi;

// Qorus imports
import com.qoretechnologies.qorus.test.*;

//! abstract class representing an action in a test case
public class CheckLog extends Action {
    //! creates the object according to the arguments
    /** @param regex regex that log lines should match to
        @param test the test that the action belongs to
        @param logfile logfile
    */
    public CheckLog(String regex, QorusInterfaceTest test, String logfile) throws Throwable {
        super(QoreJavaApi.newObjectSave("QorusInterfaceTest::CheckLog", regex, test, logfile));
    }

    //! creates the object according to the arguments
    /** @param regex regex that log lines should match to
        @param test the test that the action belongs to
    */
    public CheckLog(String regex, QorusInterfaceTest test) throws Throwable {
        super(QoreJavaApi.newObjectSave("QorusInterfaceTest::CheckLog", regex, test));
    }

    //! creates the object according to the arguments
    /** @param regex regex that log lines should match
     */
    public CheckLog(String regex) throws Throwable {
        super(QoreJavaApi.newObjectSave("QorusInterfaceTest::CheckLog", regex));
    }

    //! checks the log file
    /** @param t QorusInterfaceTest test object

        checks log content
    */
    public Object run(QorusInterfaceTest t) throws Throwable {
        return obj.callMethod("run", t);
    }

    //! Returns the regular expression string
    /**
        @return regex that should be matched
    */
    public String getRegex() throws Throwable {
        return (String)obj.callMethod("getRegex");
    }

    //! returns the log file name
    /**
        @return logfile to inspect
    */
    public String getLogfile() throws Throwable {
        return (String)obj.callMethod("getLogfile");
    }

    //! returns the log contents since the last timestamp
    public String logSinceTimepoint() throws Throwable {
        return (String)obj.callMethod("logSinceTimepoint");
    }
}