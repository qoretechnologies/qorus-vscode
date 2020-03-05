/** Java wrapper for the Qorus InsertDbTableRow Action class
 *
 */
package com.qoretechnologies.qorus.test;

// Java imports
import java.util.Map;

// Qore jni imports
import org.qore.jni.QoreJavaApi;

// Qorus imports
import com.qoretechnologies.qorus.test.*;

//! Inserts one row into DB table
public class InsertDbTableRow extends Action {
    //! Creates the object according to the arguments
    /** @param dsname name of the datasource
        @param tableName a table name
        @param row a hash representing row data to insert; keys are column names; values are literal values
        passed to @ref SqlUtil::AbstractTable::insert()
    */
    public InsertDbTableRow(String dsname, String tableName, Map<String, Object> row) throws Throwable {
        super(QoreJavaApi.newObjectSave("InsertDbTableRow", dsname, tableName, row));
    }

    //! runs the test by inserting data into the database
    /** @param t QorusInterfaceTest test object

        checks whether the row was inserted
    */
    public Object run(QorusInterfaceTest t) throws Throwable {
        return obj.callMethod("run", t);
    }
}
