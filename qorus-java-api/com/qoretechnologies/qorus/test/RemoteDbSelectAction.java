/** Java wrapper for the Qorus RemoteDbSelectAction Action class
 *
 */
package com.qoretechnologies.qorus.test;

// Java imports
import java.util.Map;

// Qore jni imports
import org.qore.jni.QoreJavaApi;

// Qorus imports
import com.qoretechnologies.qorus.test.*;

//! Selects data from a remote DB and compares to expected data
public class RemoteDbSelectAction extends AbstractRemoteDbSelectAction {
    //! Creates the object according to the arguments
    /** @param remote the name of the @ref remoteconn "remote connection"
        @param dsname the name of the remote datasource
        @param tableName the primary table name for the select stream
        @param sh the select hash for the select stream
        @param data the expected row data in the remote database; must be a list of hashes
        @param opts select stream options; see @ref OMQ::DbRemoteReceive::constructor() for information; note that the
        \c "select" stream option is added automaticallty using the \a sh argument when opening the stream

        @note data is always streamed in row format
    */
    public RemoteDbSelectAction(String remote, String dsname, String tableName,
        Map<String, Object> sh, Map<String, Object>[] data, Map<String, Object> opts) throws Throwable {
        super(QoreJavaApi.newObjectSave("RemoteDbSelectAction", remote, dsname, tableName, sh, data, opts));
    }

    //! Creates the object according to the arguments
    /** @param remote the name of the @ref remoteconn "remote connection"
        @param dsname the name of the remote datasource
        @param tableName the primary table name for the select stream
        @param sh the select hash for the select stream
        @param data the expected row data in the remote database; must be a list of hashes

        @note data is always streamed in row format
    */
    public RemoteDbSelectAction(String remote, String dsname, String tableName,
        Map<String, Object> sh, Map<String, Object>[] data) throws Throwable {
        super(QoreJavaApi.newObjectSave("RemoteDbSelectAction", remote, dsname, tableName, sh, data));
    }

    //! runs the test; comparing all rows and then the row count
    /** @param t QorusInterfaceTest test object
    */
    public Object run(QorusInterfaceTest t) throws Throwable {
        return obj.callMethod("run", t);
    }

    //! compares each row to the expected row values
    public void checkRowImpl(QorusInterfaceTest t, Map<String, Object> row) throws Throwable {
        obj.callMethod("checkRowImpl", t, row);
    }
}
