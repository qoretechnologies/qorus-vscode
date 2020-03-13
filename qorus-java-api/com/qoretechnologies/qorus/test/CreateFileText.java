/** Java wrapper for the Qorus CreateFileTest Action class
 *
 */
package com.qoretechnologies.qorus.test;

// Qore jni imports
import org.qore.jni.QoreJavaApi;

// Qorus imports
import com.qoretechnologies.qorus.test.*;

//! action class to create a file as an input for an interface
public class CreateFileText extends CreateFile {
    //! creates the object from the given filename and content
    /** @param f file that should be created
        @param c content of the file
    */
    public CreateFileText(String f, String c) throws Throwable {
        super(QoreJavaApi.newObjectSave("CreateFileText", f, c));
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
    public String getContent() throws Throwable {
        return (String)obj.callMethod("getContent");
    }
}
