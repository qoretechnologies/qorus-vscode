/** Qorus Java DbRemoteRawReceive class
 *
 */
package com.qoretechnologies.qorus;

// java imports
import java.util.Map;

// jni module imports
import org.qore.jni.QoreObject;
import org.qore.jni.QoreObjectWrapper;
import org.qore.jni.QoreJavaApi;

// qorus imports
import com.qoretechnologies.qorus.DbRemote;
import com.qoretechnologies.qorus.DbRemoteReceive;
import com.qoretechnologies.qorus.StreamConfig;
import com.qoretechnologies.qorus.QorusSystemRestHelper;

//! Java wrapper for the @ref OMQ::DbRemoteReceive class in Qorus
public class DbRemoteRawReceive extends DbRemoteReceive {
    //! creates the object as a wrapper for the Qore object
    public DbRemoteRawReceive(QoreObject obj) {
        super(obj);
    }

    //! constructor taking a @ref com.qoretechnologies.qorus.DbRemote "DbRemote" object for the remote server; assumes the \c "select" stream
    /**
        @param remote a DbRemote object
        @param sql the SQL for the select statement in the remote DB
        @param args optional bind arguments for the SQL statement
        @param options optional @ref stream-api-options as follows:
        - \c "block": data block size; the number of rows to retrieve from the remote database and send in each block
        - \c "block_queue_size": the number of blocks to queue for receiving before the I/O thread will block (default: 2); the total number of rows that can be queued = <i>block_queue_size * block</i>
        - \c "timeout": an HTTP socket timeout value in milliseconds; used locally and in the remote for socket I/O and queue operations; default value: \c 5m
        - \c "loglevel": a default log level option for logging; see @ref LogLevels for valid value
        - \c "no_remote_timeout": if @ref True the \c "timeout" option will not be sent to the remote
        - \c "select": @ref select_option_hash "select options" for the source select statement
        - \c "transaction": start a remote transaction; if this option is not given, the remote transaction status is left unchanged

        @note
        - this class always uses the @ref system_sqlutil "system.sqlutil service stream": \c "select_raw"
        - a remote transaction is only started in this object's constructor if the \c transaction option is set,
          otherwise the remote transaction status is left unchanged
        - the explicit or default timeout value here overrides any socket I/O timeout set for the remote connection
          object
    */
    public DbRemoteRawReceive(DbRemote remote, String sql, Object[] args, Map<String, Object> options) throws Throwable {
        super(QoreJavaApi.newObjectSave("DbRemoteRawReceive", remote, sql, args, options));
    }

    //! constructor taking a @ref com.qoretechnologies.qorus.DbRemote "DbRemote" object for the remote server; assumes the \c "select" stream
    /**
        @param remote a DbRemote object

        @note this class always uses the @ref system_sqlutil "system.sqlutil service stream": \c "select_raw"
    */
    public DbRemoteRawReceive(DbRemote remote, String sql, Object[] args) throws Throwable {
        super(QoreJavaApi.newObjectSave("DbRemoteRawReceive", remote, sql, args));
    }

    //! constructor taking a string giving the name of the @ref remoteconn "remote connection" for the remote server; assumes the \c "select" stream
    /**
        @param remote the name of the @ref remoteconn "remote connection" for the remote server
        @param datasource a string with name of the remote @ref dsconn "datasource" to use
        @param sql the SQL for the select statement in the remote DB
        @param args optional bind arguments for the SQL statement
        @param options optional @ref stream-api-options as follows:
        - \c "block": data block size; the number of rows to retrieve from the remote database and send in each block
        - \c "block_queue_size": the number of blocks to queue for receiving before the I/O thread will block (default: 2); the total number of rows that can be queued = <i>block_queue_size * block</i>
        - \c "timeout": an HTTP socket timeout value in milliseconds; used locally and in the remote for socket I/O and queue operations; default value: \c 5m
        - \c "loglevel": a default log level option for logging; see @ref LogLevels for valid value
        - \c "no_remote_timeout": if @ref True the \c "timeout" option will not be sent to the remote
        - \c "select": @ref select_option_hash "select options" for the source select statement
        - \c "transaction": start a remote transaction; if this option is not given, the remote transaction status is left unchanged

        @note
        - this class always uses the @ref system_sqlutil "system.sqlutil service stream": \c "select_raw"
        - a remote transaction is only started in this object's constructor if the \c transaction option is set,
          otherwise the remote transaction status is left unchanged
        - the explicit or default timeout value here overrides any socket I/O timeout set for the remote connection
          object
    */
    public DbRemoteRawReceive(String remote, String datasource, String sql, Object[] args, Map<String, Object> options) throws Throwable {
        super(QoreJavaApi.newObjectSave("DbRemoteRawReceive", remote, datasource, sql, args, options));
    }

    //! constructor taking a string giving the name of the @ref remoteconn "remote connection" for the remote server; assumes the \c "select" stream
    /**
        @param remote the name of the @ref remoteconn "remote connection" for the remote server
        @param datasource a string with name of the remote @ref dsconn "datasource" to use
        @param sql the SQL for the select statement in the remote DB
        @param args optional bind arguments for the SQL statement

        @note this class always uses the @ref system_sqlutil "system.sqlutil service stream": \c "select_raw"
    */
    public DbRemoteRawReceive(String remote, String datasource, String sql, Object[] args) throws Throwable {
        super(QoreJavaApi.newObjectSave("DbRemoteRawReceive", remote, datasource, sql, args));
    }

    //! constructor taking a @ref com.qoretechnologies.qorus.QorusSystemRestHelper object for the remote server; assumes the \c "select" stream
    /**
        @param remote a @ref com.qoretechnologies.qorus.QorusSystemRestHelper object
        @param datasource a string with name of the remote @ref dsconn "datasource" to use
        @param sql the SQL for the select statement in the remote DB
        @param args optional bind arguments for the SQL statement
        @param options optional @ref stream-api-options as follows:
        - \c "block": data block size; the number of rows to retrieve from the remote database and send in each block
        - \c "block_queue_size": the number of blocks to queue for receiving before the I/O thread will block
          (default: 2); the total number of rows that can be queued = <i>block_queue_size * block</i>
        - \c "timeout": an HTTP socket timeout value in milliseconds; used locally and in the remote for socket I/O
          and queue operations; default value: \c 5m
        - \c "loglevel": a default log level option for logging; see @ref LogLevels for valid value
        - \c "no_remote_timeout": if @ref True the \c "timeout" option will not be sent to the remote
        - \c "select": @ref select_option_hash "select options" for the source select statement
        - \c "transaction": start a remote transaction; if this option is not given, the remote transaction status is
          left unchanged

        @note
        - this class always uses the @ref system_sqlutil "system.sqlutil service stream": \c "select_raw"
        - a remote transaction is only started in this object's constructor if the \c transaction option is set,
          otherwise the remote transaction status is left unchanged
        - the explicit or default timeout value here overrides any socket I/O timeout set for the remote connection
          object
    */
    public DbRemoteRawReceive(QorusSystemRestHelper remote, String datasource, String sql, Object[] args, Map<String, Object> options) throws Throwable {
        super(QoreJavaApi.newObjectSave("DbRemoteRawReceive", remote.getQoreObject(), datasource, sql, args, options));
    }

    //! constructor taking a @ref com.qoretechnologies.qorus.QorusSystemRestHelper object for the remote server; assumes the \c "select" stream
    /**
        @param remote a @ref com.qoretechnologies.qorus.QorusSystemRestHelper object
        @param datasource a string with name of the remote @ref dsconn "datasource" to use
        @param sql the SQL for the select statement in the remote DB
        @param args optional bind arguments for the SQL statement

        @note this class always uses the @ref system_sqlutil "system.sqlutil service stream": \c "select_raw"
    */
    public DbRemoteRawReceive(QorusSystemRestHelper remote, String datasource, String sql, Object[] args) throws Throwable {
        super(QoreJavaApi.newObjectSave("DbRemoteRawReceive", remote.getQoreObject(), datasource, sql, args));
    }
}

