/** Java wrapper for the Qorus CheckFileNonexisting Action class
 *
 */
package com.qoretechnologies.qorus.test;

// Qore jni imports
import org.qore.jni.QoreJavaApi;

// Qorus imports
import com.qoretechnologies.qorus.test.*;

//! abstract class representing an action in a test case
public class CheckFileNonexisting extends Action {
    //! creates the object according to the arguments
    /** @param f filename
    */
    public CheckFileNonexisting(String f) throws Throwable {
        super(QoreJavaApi.newObjectSave("CheckFileNonexisting", f));
    }

    //! runs the test action, which succeeds if the file does not exist
    /** @param t QorusInterfaceTest test object

        checks if the file is nonexisting
    */
    public Object run(QorusInterfaceTest t) throws Throwable {
        return obj.callMethod("run", t);
    }

    //! returns the filename target
    /**
        @return filename that is inspected
    */
    public String getFilename() throws Throwable {
        return (String)obj.callMethod("getFilename");
    }
}
