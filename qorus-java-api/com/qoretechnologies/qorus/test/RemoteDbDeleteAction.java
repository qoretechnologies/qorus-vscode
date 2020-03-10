/** Java wrapper for the Qorus RemoteDbDeleteAction Action class
 *
 */
package com.qoretechnologies.qorus.test;

// Java imports
import java.util.Map;

// Qore jni imports
import org.qore.jni.QoreJavaApi;

// Qorus imports
import com.qoretechnologies.qorus.test.*;

//! Deletes one of more rows from a remote table in a remote Qorus instance
public class RemoteDbDeleteAction extends Action {
    //! Creates the object according to the arguments
    /** @param remote the name of the @ref remoteconn "remote connection"
        @param dsname the name of the remote datasource
        @param tableName the table name for the delete call
        @param cond the where clause for the remote delete call
        @param opts stream options
    */
    public RemoteDbDeleteAction(String remote, String dsname, String tableName,
        Map<String, Object> cond, Map<String, Object> opts) throws Throwable {
        super(QoreJavaApi.newObjectSave("RemoteDbDeleteAction", remote, dsname, tableName, cond, opts));
    }

    //! Creates the object according to the arguments
    /** @param remote the name of the @ref remoteconn "remote connection"
        @param dsname the name of the remote datasource
        @param tableName the table name for the delete call
        @param cond the where clause for the remote delete call
    */
    public RemoteDbDeleteAction(String remote, String dsname, String tableName,
        Map<String, Object> cond) throws Throwable {
        super(QoreJavaApi.newObjectSave("RemoteDbDeleteAction", remote, dsname, tableName, cond));
    }

    //! runs the test by deleting data from the remote table according to the where clause
    /** @param t QorusInterfaceTest test object
    */
    public Object run(QorusInterfaceTest t) throws Throwable {
        return obj.callMethod("run", t);
    }
}
