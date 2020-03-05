/** Java wrapper for the Qorus CheckFileText Action class
 *
 */
package com.qoretechnologies.qorus.test;

// Qore jni imports
import org.qore.jni.QoreJavaApi;

// Qorus imports
import com.qoretechnologies.qorus.test.*;

//! abstract class representing an action in a test case
public class CheckFileText extends Action {
    /** @param f glob that the output file should match (the newest one from the matching ones is picked)
        @param c expected file content
    */
    public CheckFileText(String f, String c) throws Throwable {
        super(QoreJavaApi.newObjectSave("CheckFileText", f, c));
    }

    /** @param t QorusInterfaceTest test object

        checks the file content
    */
    public Object run(QorusInterfaceTest t) throws Throwable {
        return obj.callMethod("run", t);
    }

    //! the file glob string as supplied to the constructor
    /**
        @return glob to inspect
    */
    public String getGlob() throws Throwable {
        return (String)obj.callMethod("getGlob");
    }

    //! the file name of the newest file
    /**
        @param files list of existing files
        @return the newest file name
    */
    public String getNewestFile(String[] files) throws Throwable {
        return (String)obj.callMethod("getNewestFile", (Object)files);
    }
}
