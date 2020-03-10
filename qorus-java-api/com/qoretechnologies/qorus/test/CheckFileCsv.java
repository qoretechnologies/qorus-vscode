/** Java wrapper for the Qorus CheckFileCsv Action class
 *
 */
package com.qoretechnologies.qorus.test;

// Java imports
import java.util.Map;

// Qore jni imports
import org.qore.jni.QoreJavaApi;

// Qorus imports
import com.qoretechnologies.qorus.test.*;

//! abstract class representing an action in a test case
public class CheckFileCsv extends Action {
    //! creates the action from the arguments passed
    /** @param f glob that the output file should match (the newest one from the matching ones is picked)
        @param c expected file content as list of hashes
        @param sep separator (default: ';')
    */
    public CheckFileCsv(String f, Map<String, Object>[] c, String sep) throws Throwable {
        super(QoreJavaApi.newObjectSave("CheckFileCsv", f, c, sep));
    }

    //! creates the action from the arguments passed
    /** @param f glob that the output file should match (the newest one from the matching ones is picked)
        @param c expected file content as list of hashes

        The default separator \c ';' is assumed.
    */
    public CheckFileCsv(String f, Map<String, Object>[] c) throws Throwable {
        super(QoreJavaApi.newObjectSave("CheckFileCsv", f, c));
    }

    //! runs rhe action to check the CSV file's content
    /** @param t QorusInterfaceTest test object

        checks the file content
    */
    public Object run(QorusInterfaceTest t) throws Throwable {
        return obj.callMethod("run", t);
    }

    //! returns the file glob as given in the constructor
    /**
        @return glob to inspect
    */
    public String getGlob() throws Throwable {
        return (String)obj.callMethod("getGlob");
    }

    //! returns the newest file name from a list of files
    /**
        @param files list of existing files
        @return the newest file name
    */
    public String getNewestFile(Map<String, Object>[] files) throws Throwable {
        return (String)obj.callMethod("getNewestFile", (Object)files);
    }
}
