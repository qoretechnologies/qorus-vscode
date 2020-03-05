/** Java wrapper for the Qorus CreateFileCsv Action class
 *
 */
package com.qoretechnologies.qorus.test;

// Java imports
import java.util.Map;
import java.util.HashMap;

// Qore jni imports
import org.qore.jni.QoreJavaApi;

// Qorus imports
import com.qoretechnologies.qorus.test.*;

//! action class to create a csv file as an input for an interface
public class CreateFileCsv extends CreateFile {
    //! creates the action object based on the arguments
    /** @param f file that should be created
        @param c list of hashes specifying data in csv file
        @param separator separator in csv file
    */
    public CreateFileCsv(String f, Map<String, Object>[] c, String separator) throws Throwable {
        super(QoreJavaApi.newObjectSave("CreateFileCsv", f, c, separator));
    }

    //! creates the action object based on the arguments
    /** @param f file that should be created
        @param c list of hashes specifying data in csv file
    */
    public CreateFileCsv(String f, Map<String, Object>[] c) throws Throwable {
        super(QoreJavaApi.newObjectSave("CreateFileCsv", f, c));
    }

    //! creates the action object based on the arguments
    /** @param f file that should be created
    */
    public CreateFileCsv(String f) throws Throwable {
        super(QoreJavaApi.newObjectSave("CreateFileCsv", f));
    }

    //! implements the run action
    /** @param t QorusInterfaceTest test object

        checks whether the file with specified content was created
    */
    public Object run(QorusInterfaceTest t) throws Throwable {
        return obj.callMethod("run", t);
    }

    //! returns the expected file content
    /**
        @return the expected file content
    */
    @SuppressWarnings("unchecked")
    public HashMap<String, Object>[] getContent() throws Throwable {
        return (HashMap<String, Object>[])obj.callMethod("getContent");
    }

    //! returns the separator string
    /**
        @return csv separator
    */
    public String getSeparator() throws Throwable {
        return (String)obj.callMethod("getSeparator");
    }
}
