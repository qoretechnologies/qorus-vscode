/** Java wrapper for the Qorus QorusInterfaceTest class
 *
 */
package com.qoretechnologies.qorus.test;

// jni module imports
import org.qore.jni.QoreJavaApi;
import org.qore.jni.QoreObject;

// qore lang imports
import org.qore.lang.qunit.*;

// java imports
import java.time.ZonedDateTime;
import java.util.HashMap;

// Qorus imports
import com.qoretechnologies.qorus.test.*;

//! Base class that exports functions for Qorus interface testing
public abstract class QorusInterfaceTest extends Test {
    // static initialization
    static {
        // load the QorusInterfaceTest module
        try {
            QoreJavaApi.callFunction("load_module", "QorusInterfaceTest");
        } catch (Throwable e) {
            throw new ExceptionInInitializerError(e);
        }
    }

    //! creates the object based on the arguments
    public QorusInterfaceTest(QoreObject obj) throws Throwable {
        super(obj);
    }

    //! reimplement in child classes to allow the REST username & password for the Qorus server connection to be set before trying to communicate with the server
    /** this base implementation does nothing
     */
    protected void setUserPassword() throws Throwable {
        obj.callMethod("setUserPassword");
    }

    //! checks that the interface exists and executes a StarLog action
    public void globalSetUp() throws Throwable {
        obj.callMethod("globalSetUp");
    }

    //! executes the Action by calling its run() method and returns the object of Action (that allows to retrieve some particular information about the action later in the test script)
    public Object exec(Action data) throws Throwable {
        return obj.callMethod("exec", data.getQoreObject());
    }

    //! tests whether some Qorus instance is running and returns its name
    /** @par Example:
        @code{.java}
        string name = t.getQorusInstanceName();
        @endcode

        returns current Qorus instance name
    */
    public String getQorusInstanceName() throws Throwable {
        return (String)obj.callMethod("getQorusInstanceName");
    }

    //! returns the Qorus instance name
    /**
        @return Qorus instance name
    */
    public String getInstanceName() throws Throwable {
        return (String)obj.callMethod("getInstanceName");
    }

    //! returns a string describing the current interface being tested
    public String getDescription() throws Throwable {
        return (String)obj.callMethod("getDescription");
    }

    //! returns the test start timestamp
    public ZonedDateTime getTimestamp() throws Throwable {
        return (ZonedDateTime)obj.callMethod("getTimestamp");
    }

    //! returns information about the interface from the REST API or @ref nothing if the interface doesn't exist or the system is not responding on the HTTP interface
    public HashMap getInterfaceInfo() throws Throwable {
        return (HashMap)obj.callMethod("getInterfaceInfo");
    }

    //! tests whether the current interface is loaded in the current Qorus instance
    /** @par Example:
        @code{.py}
        t.isInterfaceLoaded(info);
        @endcode

        @return True if the interface is loaded, False if not
    */
    public boolean isInterfaceLoaded() throws Throwable {
        return (boolean)obj.callMethod("isInterfaceLoaded");
    }

    //! tests whether the current interface is running in the current Qorus instance
    /** @par Example:
        @code{.py}
        bool b = t.isInterfaceRunning();
        @endcode

        @return True if the interface is running, False if not
    */
    public boolean isInterfaceRunning() throws Throwable {
        return (boolean)obj.callMethod("isInterfaceRunning");
    }

    //! returns the configuration (including source) for the named library function
    public HashMap getFunctionInfo(String name) throws Throwable {
        return (HashMap)obj.callMethod("getFunctionInfo");
    }

    //! returns the configuration (including source) for the named library constant
    public HashMap getConstantInfo(String name) throws Throwable {
        return (HashMap)obj.callMethod("getConstantInfo");
    }

    //! returns the configuration (including source) for the named library class
    public HashMap getClassInfo(String name) throws Throwable {
        return (HashMap)obj.callMethod("getClassInfo");
    }

    //! disables the current interface
    public void disable() throws Throwable {
        obj.callMethod("disable");
    }

    //! enables the current interface
    public void enable() throws Throwable {
        obj.callMethod("enable");
    }

    //! returns the log file name for the current object
    abstract public String getLogFileName() throws Throwable;

    //! checks if the interface can run
    abstract public boolean canRun() throws Throwable;
}
