/** Java wrapper for the Qorus InsertDbTableRows Action class
 *
 */
package com.qoretechnologies.qorus.test;

// Java imports
import java.util.Map;

// Qore jni imports
import org.qore.jni.QoreJavaApi;

// Qorus imports
import com.qoretechnologies.qorus.test.*;

//! Inserts one or more rows into DB table
public class InsertDbTableRows extends Action {
    //! Creates the object according to the arguments
    /** @param dsname name of the datasource
        @param tableName a table name
        @param rows a list of hashes representing row data to insert; keys are column names; values are literal values
        passed to @ref SqlUtil::AbstractTable::insert()
    */
    public InsertDbTableRows(String dsname, String tableName, Map<String, Object>[] rows) throws Throwable {
        super(QoreJavaApi.newObjectSave("InsertDbTableRows", dsname, tableName, rows));
    }

    //! runs the test by inserting data into the database
    /** @param t QorusInterfaceTest test object

        checks whether the rows were inserted
    */
    public Object run(QorusInterfaceTest t) throws Throwable {
        return obj.callMethod("run", t);
    }
}
