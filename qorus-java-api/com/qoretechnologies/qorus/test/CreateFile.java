/** Java wrapper for the Qorus CreateFile Action class
 *
 */
package com.qoretechnologies.qorus.test;

// Qore jni imports
import org.qore.jni.QoreObject;

// Qorus imports
import com.qoretechnologies.qorus.test.*;

//! action class to create a file as an input for an interface
public abstract class CreateFile extends Action {
    //! creates the object as a wrapper for the given Qore object
    /** @param obj the object to be wrapped
    */
    public CreateFile(QoreObject obj) throws Throwable {
        super(obj);
    }

    //! returns the filename given in the constructor
    /**
        @return the filename given in the constructor
    */
    public String getFile() throws Throwable {
        return (String)obj.callMethod("getFile");
    }
}
