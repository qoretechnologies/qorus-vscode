/** Java wrapper for the Qorus DeleteDbTableData Action class
 *
 */
package com.qoretechnologies.qorus.test;

// Java imports
import java.util.Map;

// Qore jni imports
import org.qore.jni.QoreJavaApi;

// Qorus imports
import com.qoretechnologies.qorus.test.*;

//! Deletes one or more rows from a DB table
public class DeleteDbTableData extends Action {
    //! Creates the object according to the arguments
    /** @param dsname name of the datasource
        @param tableName a table name
        @param w a where clause. Keys are column names.
    */
    public DeleteDbTableData(String dsname, String tableName, Map<String, Object> w) throws Throwable {
        super(QoreJavaApi.newObjectSave("DeleteDbTableData", dsname, tableName, w));
    }

    //! runs the test by deleting one or more rows from the table using the arguments passed to the constructor
    /** @param t QorusInterfaceTest test object
    */
    public Object run(QorusInterfaceTest t) throws Throwable {
        return obj.callMethod("run", t);
    }
}
