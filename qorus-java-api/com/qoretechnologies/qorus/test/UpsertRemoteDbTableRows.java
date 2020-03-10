/** Java wrapper for the Qorus UpsertRemoteDbTableRows Action class
 *
 */
package com.qoretechnologies.qorus.test;

// Java imports
import java.util.Map;

// Qore jni imports
import org.qore.jni.QoreJavaApi;

// Qorus imports
import com.qoretechnologies.qorus.test.*;

//! Upserts (ie performs an SQL merge operation) one or more rows into a remote table in a remote Qorus instance
public class UpsertRemoteDbTableRows extends Action {
    //! Creates the object according to the arguments
    /** @param remote the name of the @ref remoteconn "remote connection"
        @param dsname name of the datasource
        @param tableName a table name
        @param rows a list of hashes representing row data to upsert; keys are column names; values are literal values
        passed to @ref SqlUtil::AbstractTable::upsert()
        @param opts stream options
    */
    public UpsertRemoteDbTableRows(String remote, String dsname, String tableName,
        Map<String, Object>[] rows, Map<String, Object> opts) throws Throwable {
        super(QoreJavaApi.newObjectSave("UpsertRemoteDbTableRows", remote, dsname, tableName, rows, opts));
    }

    //! Creates the object according to the arguments
    /** @param remote the name of the @ref remoteconn "remote connection"
        @param dsname the name of the remote datasource
        @param tableName the table name for the delete call
        @param rows a list of hashes representing row data to upsert; keys are column names; values are literal values
        passed to @ref SqlUtil::AbstractTable::upsert()
    */
    public UpsertRemoteDbTableRows(String remote, String dsname, String tableName,
        Map<String, Object>[] rows) throws Throwable {
        super(QoreJavaApi.newObjectSave("UpsertRemoteDbTableRows", remote, dsname, tableName, rows));
    }

    //! runs the test by streaming the input data to the remote database
    /** @param t QorusInterfaceTest test object

        runs the remote action with the input data
    */
    public Object run(QorusInterfaceTest t) throws Throwable {
        return obj.callMethod("run", t);
    }
}
