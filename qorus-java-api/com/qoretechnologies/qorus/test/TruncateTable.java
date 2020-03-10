/** Java wrapper for the Qorus TruncateTable Action class
 *
 */
package com.qoretechnologies.qorus.test;

// Java imports
import java.util.Map;

// Qore jni imports
import org.qore.jni.QoreJavaApi;

// Qorus imports
import com.qoretechnologies.qorus.test.*;

//! Clears the given table
public class TruncateTable extends Action {
    //! Creates the object according to the arguments
    /** @param dsname name of the datasource
        @param tableName a table name
    */
    public TruncateTable(String dsname, String tableName) throws Throwable {
        super(QoreJavaApi.newObjectSave("TruncateTable", dsname, tableName));
    }

    //! deletes the data in the table given in the constructor
    /** @param t QorusInterfaceTest test object
    */
    public Object run(QorusInterfaceTest t) throws Throwable {
        return obj.callMethod("run", t);
    }
}
