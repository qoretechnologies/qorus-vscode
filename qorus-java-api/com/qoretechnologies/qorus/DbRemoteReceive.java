/** Qorus Java DbRemoteReceive class
 *
 */
package com.qoretechnologies.qorus;

// java imports
import java.util.Map;
import java.util.HashMap;

// jni module imports
import org.qore.jni.QoreObject;
import org.qore.jni.QoreObjectWrapper;
import org.qore.jni.QoreJavaApi;

// qorus imports
import com.qoretechnologies.qorus.DbRemote;
import com.qoretechnologies.qorus.StreamConfig;
import com.qoretechnologies.qorus.QorusSystemRestHelper;

//! Java wrapper for the @ref OMQ::DbRemoteReceive class in Qorus
public class DbRemoteReceive extends QoreObjectWrapper {
    //! creates the object as a wrapper for the Qore object
    public DbRemoteReceive(QoreObject obj) {
        super(obj);
    }

    //! constructor taking a @ref com.qoretechnologies.qorus.DbRemote "DbRemote" object for the remote server
    /**
        @param remote a DbRemote object
        @param stream the @ref system_sqlutil "system.sqlutil service stream" to be used
        @param table_name a string with remote table name located in the remote @ref dsconn "datasource"
        @param options optional @ref stream-api-options as follows:
        - \c "block": data block size; the number of rows to retrieve from the remote database and send in each block
        - \c "block_queue_size": the number of blocks to queue for receiving before the I/O thread will block (default: 2); the total number of rows that can be queued = <i>block_queue_size * block</i>
        - \c "timeout": an HTTP socket timeout value in milliseconds; used locally and in the remote for socket I/O and queue operations; default value: \c 5m
        - \c "loglevel": a default log level option for logging; see @ref LogLevels for valid value
        - \c "no_remote_timeout": if @ref True the \c "timeout" option will not be sent to the remote
        - \c "select": @ref select_option_hash "select options" for the source select statement
        - \c "transaction": start a remote transaction; if this option is not given, the remote transaction status is left unchanged

        @note
        - a remote transaction is only started in this object's constructor if the \c transaction option is set,
          otherwise the remote transaction status is left unchanged
        - the \c forupdate @ref select_option_hash "select_option" must be manually included in the \c "select" option
          hash to initiate a \c "select for update"; this is not automatically set by setting the \c "transaction"
          option
        - the explicit or default timeout value here overrides any socket I/O timeout set for the remote connection
          object
    */
    public DbRemoteReceive(DbRemote remote, String stream, String table_name, Map<String, Object> options) throws Throwable {
        super(QoreJavaApi.newObjectSave("DbRemoteReceive", remote, stream, table_name, options));
    }

    //! constructor taking a @ref com.qoretechnologies.qorus.DbRemote "DbRemote" object for the remote server
    /**
        @param remote a DbRemote object
        @param stream the @ref system_sqlutil "system.sqlutil service stream" to be used
        @param table_name a string with remote table name located in the remote @ref dsconn "datasource"
        @param options optional @ref stream-api-options as follows:
        - \c "block": data block size; the number of rows to retrieve from the remote database and send in each block
        - \c "block_queue_size": the number of blocks to queue for receiving before the I/O thread will block (default: 2); the total number of rows that can be queued = <i>block_queue_size * block</i>
        - \c "timeout": an HTTP socket timeout value in milliseconds; used locally and in the remote for socket I/O and queue operations; default value: \c 5m
        - \c "loglevel": a default log level option for logging; see @ref LogLevels for valid value
        - \c "no_remote_timeout": if @ref True the \c "timeout" option will not be sent to the remote
        - \c "select": @ref select_option_hash "select options" for the source select statement
        - \c "transaction": start a remote transaction; if this option is not given, the remote transaction status is left unchanged

        @note
        - a remote transaction is only started in this object's constructor if the \c transaction option is set,
          otherwise the remote transaction status is left unchanged
        - the \c forupdate @ref select_option_hash "select_option" must be manually included in the \c "select" option
          hash to initiate a \c "select for update"; this is not automatically set by setting the \c "transaction"
          option
        - the explicit or default timeout value here overrides any socket I/O timeout set for the remote connection
          object
    */
    public DbRemoteReceive(DbRemote remote, String stream, String table_name, HashMap<String, Object> options) throws Throwable {
        super(QoreJavaApi.newObjectSave("DbRemoteReceive", remote, stream, table_name, options));
    }

    //! constructor taking a @ref com.qoretechnologies.qorus.DbRemote "DbRemote" object for the remote server
    /**
        @param remote a DbRemote object
        @param stream the @ref system_sqlutil "system.sqlutil service stream" to be used
        @param table_name a string with remote table name located in the remote @ref dsconn "datasource"

        @note the explicit or default timeout value here overrides any socket I/O timeout set for the remote
        connection object
    */
    public DbRemoteReceive(DbRemote remote, String stream, String table_name) throws Throwable {
        super(QoreJavaApi.newObjectSave("DbRemoteReceive", remote, stream, table_name));
    }

    //! constructor taking a @ref com.qoretechnologies.qorus.DbRemote "DbRemote" object for the remote server; assumes the \c "select" stream
    /**
        @param remote a DbRemote object
        @param table_name a string with remote table name located in the remote @ref dsconn "datasource"
        @param options optional @ref stream-api-options as follows:
        - \c "block": data block size; the number of rows to retrieve from the remote database and send in each block
        - \c "block_queue_size": the number of blocks to queue for receiving before the I/O thread will block (default: 2); the total number of rows that can be queued = <i>block_queue_size * block</i>
        - \c "timeout": an HTTP socket timeout value in milliseconds; used locally and in the remote for socket I/O and queue operations; default value: \c 5m
        - \c "loglevel": a default log level option for logging; see @ref LogLevels for valid value
        - \c "no_remote_timeout": if @ref True the \c "timeout" option will not be sent to the remote
        - \c "select": @ref select_option_hash "select options" for the source select statement
        - \c "transaction": start a remote transaction; if this option is not given, the remote transaction status is left unchanged

        @note
        - a remote transaction is only started in this object's constructor if the \c transaction option is set,
          otherwise the remote transaction status is left unchanged
        - the \c forupdate @ref select_option_hash "select_option" must be manually included in the \c "select" option
          hash to initiate a \c "select for update"; this is not automatically set by setting the \c "transaction"
          option
        - the explicit or default timeout value here overrides any socket I/O timeout set for the remote connection
          object
    */
    public DbRemoteReceive(DbRemote remote, String table_name, Map<String, Object> options) throws Throwable {
        super(QoreJavaApi.newObjectSave("DbRemoteReceive", remote, table_name, options));
    }

    //! constructor taking a @ref com.qoretechnologies.qorus.DbRemote "DbRemote" object for the remote server; assumes the \c "select" stream
    /**
        @param remote a DbRemote object
        @param table_name a string with remote table name located in the remote @ref dsconn "datasource"

        @note the explicit or default timeout value here overrides any socket I/O timeout set for the remote connection object
    */
    public DbRemoteReceive(DbRemote remote, String table_name) throws Throwable {
        super(QoreJavaApi.newObjectSave("DbRemoteReceive", remote, table_name));
    }

    //! constructor taking a string giving the name of the @ref remoteconn "remote connection" for the remote server
    /**
        @param remote the name of the @ref remoteconn "remote connection" for the remote server
        @param datasource a string with name of the remote @ref dsconn "datasource" to use
        @param stream the @ref system_sqlutil "system.sqlutil service stream" to be used
        @param table_name a string with remote table name located in the remote @ref dsconn "datasource"
        @param options optional @ref stream-api-options as follows:
        - \c "block": data block size; the number of rows to retrieve from the remote database and send in each block
        - \c "block_queue_size": the number of blocks to queue for receiving before the I/O thread will block (default: 2); the total number of rows that can be queued = <i>block_queue_size * block</i>
        - \c "timeout": an HTTP socket timeout value in milliseconds; used locally and in the remote for socket I/O and queue operations; default value: \c 5m
        - \c "loglevel": a default log level option for logging; see @ref LogLevels for valid value
        - \c "no_remote_timeout": if @ref True the \c "timeout" option will not be sent to the remote
        - \c "select": @ref select_option_hash "select options" for the source select statement
        - \c "transaction": start a remote transaction; if this option is not given, the remote transaction status is left unchanged

        @note
        - a remote transaction is only started in this object's constructor if the \c transaction option is set,
          otherwise the remote transaction status is left unchanged
        - the \c forupdate @ref select_option_hash "select_option" must be manually included in the \c "select" option
          hash to initiate a \c "select for update"; this is not automatically set by setting the \c "transaction"
          option
        - the explicit or default timeout value here overrides any socket I/O timeout set for the remote connection
          object
    */
    public DbRemoteReceive(String remote, String datasource, String stream, String table_name, Map<String, Object> options) throws Throwable {
        super(QoreJavaApi.newObjectSave("DbRemoteReceive", remote, datasource, stream, table_name, options));
    }

    //! constructor taking a string giving the name of the @ref remoteconn "remote connection" for the remote server
    /**
        @param remote the name of the @ref remoteconn "remote connection" for the remote server
        @param datasource a string with name of the remote @ref dsconn "datasource" to use
        @param stream the @ref system_sqlutil "system.sqlutil service stream" to be used
        @param table_name a string with remote table name located in the remote @ref dsconn "datasource"
        @param options optional @ref stream-api-options as follows:
        - \c "block": data block size; the number of rows to retrieve from the remote database and send in each block
        - \c "block_queue_size": the number of blocks to queue for receiving before the I/O thread will block (default: 2); the total number of rows that can be queued = <i>block_queue_size * block</i>
        - \c "timeout": an HTTP socket timeout value in milliseconds; used locally and in the remote for socket I/O and queue operations; default value: \c 5m
        - \c "loglevel": a default log level option for logging; see @ref LogLevels for valid value
        - \c "no_remote_timeout": if @ref True the \c "timeout" option will not be sent to the remote
        - \c "select": @ref select_option_hash "select options" for the source select statement
        - \c "transaction": start a remote transaction; if this option is not given, the remote transaction status is left unchanged

        @note
        - a remote transaction is only started in this object's constructor if the \c transaction option is set,
          otherwise the remote transaction status is left unchanged
        - the \c forupdate @ref select_option_hash "select_option" must be manually included in the \c "select" option
          hash to initiate a \c "select for update"; this is not automatically set by setting the \c "transaction"
          option
        - the explicit or default timeout value here overrides any socket I/O timeout set for the remote connection
          object
    */
    public DbRemoteReceive(String remote, String datasource, String stream, String table_name, HashMap<String, Object> options) throws Throwable {
        super(QoreJavaApi.newObjectSave("DbRemoteReceive", remote, datasource, stream, table_name, options));
    }

    //! constructor taking a string giving the name of the @ref remoteconn "remote connection" for the remote server
    /**
        @param remote the name of the @ref remoteconn "remote connection" for the remote server
        @param datasource a string with name of the remote @ref dsconn "datasource" to use
        @param stream the @ref system_sqlutil "system.sqlutil service stream" to be used
        @param table_name a string with remote table name located in the remote @ref dsconn "datasource"

        @note the explicit or default timeout value here overrides any socket I/O timeout set for the remote connection object
    */
    public DbRemoteReceive(String remote, String datasource, String stream, String table_name) throws Throwable {
        super(QoreJavaApi.newObjectSave("DbRemoteReceive", remote, datasource, stream, table_name));
    }

    //! constructor taking a string giving the name of the @ref remoteconn "remote connection" for the remote server; assumes the \c "select" stream
    /**
        @param remote the name of the @ref remoteconn "remote connection" for the remote server
        @param datasource a string with name of the remote @ref dsconn "datasource" to use
        @param table_name a string with remote table name located in the remote @ref dsconn "datasource"
        @param options optional @ref stream-api-options as follows:
        - \c "block": data block size; the number of rows to retrieve from the remote database and send in each block
        - \c "block_queue_size": the number of blocks to queue for receiving before the I/O thread will block (default: 2); the total number of rows that can be queued = <i>block_queue_size * block</i>
        - \c "timeout": an HTTP socket timeout value in milliseconds; used locally and in the remote for socket I/O and queue operations; default value: \c 5m
        - \c "loglevel": a default log level option for logging; see @ref LogLevels for valid value
        - \c "no_remote_timeout": if @ref True the \c "timeout" option will not be sent to the remote
        - \c "select": @ref select_option_hash "select options" for the source select statement
        - \c "transaction": start a remote transaction; if this option is not given, the remote transaction status is left unchanged

        @note
        - a remote transaction is only started in this object's constructor if the \c transaction option is set,
          otherwise the remote transaction status is left unchanged
        - the \c forupdate @ref select_option_hash "select_option" must be manually included in the \c "select" option
          hash to initiate a \c "select for update"; this is not automatically set by setting the \c "transaction"
          option
        - the explicit or default timeout value here overrides any socket I/O timeout set for the remote connection
          object
    */
    public DbRemoteReceive(String remote, String datasource, String table_name, Map<String, Object> options) throws Throwable {
        super(QoreJavaApi.newObjectSave("DbRemoteReceive", remote, datasource, table_name, options));
    }

    //! constructor taking a string giving the name of the @ref remoteconn "remote connection" for the remote server; assumes the \c "select" stream
    /**
        @param remote the name of the @ref remoteconn "remote connection" for the remote server
        @param datasource a string with name of the remote @ref dsconn "datasource" to use
        @param table_name a string with remote table name located in the remote @ref dsconn "datasource"
        @param options optional @ref stream-api-options as follows:
        - \c "block": data block size; the number of rows to retrieve from the remote database and send in each block
        - \c "block_queue_size": the number of blocks to queue for receiving before the I/O thread will block (default: 2); the total number of rows that can be queued = <i>block_queue_size * block</i>
        - \c "timeout": an HTTP socket timeout value in milliseconds; used locally and in the remote for socket I/O and queue operations; default value: \c 5m
        - \c "loglevel": a default log level option for logging; see @ref LogLevels for valid value
        - \c "no_remote_timeout": if @ref True the \c "timeout" option will not be sent to the remote
        - \c "select": @ref select_option_hash "select options" for the source select statement
        - \c "transaction": start a remote transaction; if this option is not given, the remote transaction status is left unchanged

        @note
        - a remote transaction is only started in this object's constructor if the \c transaction option is set,
          otherwise the remote transaction status is left unchanged
        - the \c forupdate @ref select_option_hash "select_option" must be manually included in the \c "select" option
          hash to initiate a \c "select for update"; this is not automatically set by setting the \c "transaction"
          option
        - the explicit or default timeout value here overrides any socket I/O timeout set for the remote connection
          object
    */
    public DbRemoteReceive(String remote, String datasource, String table_name, HashMap<String, Object> options) throws Throwable {
        super(QoreJavaApi.newObjectSave("DbRemoteReceive", remote, datasource, table_name, options));
    }

    //! constructor taking a string giving the name of the @ref remoteconn "remote connection" for the remote server; assumes the \c "select" stream
    /**
        @param remote the name of the @ref remoteconn "remote connection" for the remote server
        @param datasource a string with name of the remote @ref dsconn "datasource" to use
        @param table_name a string with remote table name located in the remote @ref dsconn "datasource"

        @note the explicit or default timeout value here overrides any socket I/O timeout set for the remote connection object
    */
    public DbRemoteReceive(String remote, String datasource, String table_name) throws Throwable {
        super(QoreJavaApi.newObjectSave("DbRemoteReceive", remote, datasource, table_name));
    }

    //! constructor taking a @ref com.qoretechnologies.qorus.QorusSystemRestHelper object for the remote server
    /**
        @param remote a @ref com.qoretechnologies.qorus.QorusSystemRestHelper object
        @param datasource a string with name of the remote @ref dsconn "datasource" to use
        @param stream the @ref system_sqlutil "system.sqlutil service stream" to be used
        @param table_name a string with remote table name located in the remote @ref dsconn "datasource"
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
        - a remote transaction is only started in this object's constructor if the \c transaction option is set,
          otherwise the remote transaction status is left unchanged
        - the \c forupdate @ref select_option_hash "select_option" must be manually included in the \c "select" option
          hash to initiate a \c "select for update"; this is not automatically set by setting the \c "transaction"
          option
        - the explicit or default timeout value here overrides any socket I/O timeout set for the remote connection
          object
    */
    public DbRemoteReceive(QorusSystemRestHelper remote, String datasource, String stream, String table_name, Map<String, Object> options) throws Throwable {
        super(QoreJavaApi.newObjectSave("DbRemoteReceive", remote.getQoreObject(), datasource, stream, table_name, options));
    }

    //! constructor taking a @ref com.qoretechnologies.qorus.QorusSystemRestHelper object for the remote server
    /**
        @param remote a @ref com.qoretechnologies.qorus.QorusSystemRestHelper object
        @param datasource a string with name of the remote @ref dsconn "datasource" to use
        @param stream the @ref system_sqlutil "system.sqlutil service stream" to be used
        @param table_name a string with remote table name located in the remote @ref dsconn "datasource"
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
        - a remote transaction is only started in this object's constructor if the \c transaction option is set,
          otherwise the remote transaction status is left unchanged
        - the explicit or default timeout value here overrides any socket I/O timeout set for the remote connection object
    */
    public DbRemoteReceive(QorusSystemRestHelper remote, String datasource, String stream, String table_name, HashMap<String, Object> options) throws Throwable {
        super(QoreJavaApi.newObjectSave("DbRemoteReceive", remote.getQoreObject(), datasource, stream, table_name, options));
    }

    //! constructor taking a @ref com.qoretechnologies.qorus.QorusSystemRestHelper object for the remote server
    /**
        @param remote a @ref com.qoretechnologies.qorus.QorusSystemRestHelper object
        @param datasource a string with name of the remote @ref dsconn "datasource" to use
        @param stream the @ref system_sqlutil "system.sqlutil service stream" to be used
        @param table_name a string with remote table name located in the remote @ref dsconn "datasource"

        @note
        - a remote transaction is only started in this object's constructor if the \c transaction option is set,
          otherwise the remote transaction status is left unchanged
        - the explicit or default timeout value here overrides any socket I/O timeout set for the remote connection object
    */
    public DbRemoteReceive(QorusSystemRestHelper remote, String datasource, String stream, String table_name) throws Throwable {
        super(QoreJavaApi.newObjectSave("DbRemoteReceive", remote.getQoreObject(), datasource, stream, table_name));
    }

    //! constructor taking a @ref com.qoretechnologies.qorus.QorusSystemRestHelper object for the remote server; assumes the \c "select" stream
    /**
        @param remote a @ref com.qoretechnologies.qorus.QorusSystemRestHelper object
        @param datasource a string with name of the remote @ref dsconn "datasource" to use
        @param table_name a string with remote table name located in the remote @ref dsconn "datasource"
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
        - a remote transaction is only started in this object's constructor if the \c transaction option is set,
          otherwise the remote transaction status is left unchanged
        - the explicit or default timeout value here overrides any socket I/O timeout set for the remote connection object
    */
    public DbRemoteReceive(QorusSystemRestHelper remote, String datasource, String table_name, Map<String, Object> options) throws Throwable {
        super(QoreJavaApi.newObjectSave("DbRemoteReceive", remote.getQoreObject(), datasource, table_name, options));
    }

    //! constructor taking a @ref com.qoretechnologies.qorus.QorusSystemRestHelper object for the remote server; assumes the \c "select" stream
    /**
        @param remote a @ref com.qoretechnologies.qorus.QorusSystemRestHelper object
        @param datasource a string with name of the remote @ref dsconn "datasource" to use
        @param table_name a string with remote table name located in the remote @ref dsconn "datasource"

        @note
        - a remote transaction is only started in this object's constructor if the \c transaction option is set,
          otherwise the remote transaction status is left unchanged
        - the explicit or default timeout value here overrides any socket I/O timeout set for the remote connection object
    */
    public DbRemoteReceive(QorusSystemRestHelper remote, String datasource, String table_name) throws Throwable {
        super(QoreJavaApi.newObjectSave("DbRemoteReceive", remote.getQoreObject(), datasource, table_name));
    }

    //! flushes the current stream and reopens a new stream with the same remote connection and in the same @ref dsconn "datasource"s
    /** @par Example:
        @code{.java}
out.openStream("update", "table2");
        @endcode

        @param stream the @ref system_sqlutil "system.sqlutil service stream" to be used
        @param table_name a string with remote table name located in the remote @ref dsconn "datasource"
        @param options optional @ref stream-api-options as follows:
        - \c "timeout": an HTTP socket timeout value in milliseconds; used locally and in the remote for socket I/O and queue operations; default value: \c 5m
        - \c "loglevel": a default log level option for logging; see @ref JavaLogLevels for valid value
        - \c "block": data block size
        - \c "no_remote_timeout": if @ref True the \c "timeout" option will not be sent to the remote
        - \c "queue_block_size": the number of blocks to queue for sending before the main data thread will block (default: 2)
        - \c "queue_timeout": the number of milliseconds to wait for queue data before throwing a \c QUEUE-TIMEOUT exception

        @note
        - a remote transaction is only started in this object's constructor if the \c transaction option is set,
          otherwise the remote transaction status is left unchanged
        - the \c forupdate @ref select_option_hash "select_option" must be manually included in the \c "select" option
          hash to initiate a \c "select for update"; this is not automatically set by setting the \c "transaction"
          option
        - the explicit or default timeout value here overrides any socket I/O timeout set for the remote connection
          object
     */
    public void openStream(String stream, String table_name, Map<String, Object> options) throws Throwable {
        obj.callMethod("openStream", stream, table_name, options);
    }

    //! flushes the current stream and reopens a new stream with the same remote connection and in the same @ref dsconn "datasource"s
    /** @par Example:
        @code{.java}
out.openStream("update", "table2");
        @endcode

        @param stream the @ref system_sqlutil "system.sqlutil service stream" to be used
        @param table_name a string with remote table name located in the remote @ref dsconn "datasource"
     */
    public void openStream(String stream, String table_name) throws Throwable {
        obj.callMethod("openStream", stream, table_name);
    }

    //! Commit remote transaction
    /**
        @note exceptions thrown in the socket I/O thread will be rethrown when this method is called so that errors can be handled in the main data thread
    */
    public void commit() throws Throwable {
        obj.callMethod("commit");
    }

    //! Rollback remote transaction
    /** @note it's normally better to disconnect the connection if an error occurs rather than call
        rollback() when streaming because if a chunked transfer is interrupted, then HTTP calls will
        fail anyway, and the remote end will rollback the transaction in any case unless an explicit
        commit is executed

        @param disconnect a boolean value to keep connection open or close the connection. Connection closing is the default

        @see disconnect()
    */
    public void rollback(boolean disconnect) throws Throwable {
        obj.callMethod("rollback", disconnect);
    }

    //! Disconnects the connection
    public void disconnect() throws Throwable {
        obj.callMethod("disconnect");
    }

    //! Rollback remote transaction and disconnect the connection
    /** @note it's normally better to disconnect the connection if an error occurs rather than call
        rollback() when streaming because if a chunked transfer is interrupted, then HTTP calls will
        fail anyway, and the remote end will rollback the transaction in any case unless an explicit
        commit is executed

        @see disconnect()
    */
    public void rollback() throws Throwable {
        obj.callMethod("rollback", true);
    }

    //! returns queued data as soon as it is available, if the timeout is omitted or equal or less than 0, no timeout is used and the call will block until data is available on the queue; once this method return null it signifies that the end of stream data condition has been reached; do not call this method again after it returns null
    /**
        @par Examples:
        @code{.java}
DbRemoteReceive recv = new DbRemoteReceive(qrest, "omquser", "select", table_name, opts);
try {
    while (true) {
        HashMap<String, Object> h = recv.getData(120000);
        if (h == null) {
            break;
        }
        processData(h);
    }
} catch (Throwable e) {
    recv.disconnect();
    throw e;
} finally {
    recv.release();
}
        @endcode

        @param timeout_ms an override for the the timeout for waiting on the queue; integers are interpreted as milliseconds; relative date/time values are interpreted literally with a maximum resolution of milliseconds; if the timeout limit is exceeded before data is available, a \c QUEUE-TIMEOUT error is thrown.  If no value is given here, the default queue timeout value configured for the object is used (see the \c "queue_timeout" option in the @ref DbRemoteReceive "constructor")

        @return a hash of lists: keys = columns, values = lists of row values or null if all data has been received (do not call this method again after it returns null)

        @throw DB-REMOTE-RECEIVE-ERROR this exception is thrown if this method is called after it returns null signifying end of stream
        @throw QUEUE-TIMEOUT this exception is thrown if a timeout occurs on the @ref Qore::Thread::Queue "Queue"
        @throw STREAM-TERMINATED if the I/O thread was terminated prematurely, this exception will be thrown

        @note exceptions thrown in the socket I/O thread will be rethrown when this method is called so that errors can be handled in the main data thread
    */
    @SuppressWarnings("unchecked")
    public HashMap<String, Object> getData(int timeout_ms) throws Throwable {
        return(HashMap<String, Object>)obj.callMethod("getData", timeout_ms);
    }

    //! returns queued data as soon as it is available, no timeout is used and the call will block until data is available on the queue; once this method return null it signifies that the end of stream data condition has been reached; do not call this method again after it returns null
    /**
        @par Examples:
        @code{.java}
DbRemoteReceive recv = new DbRemoteReceive(qrest, "omquser", "select", table_name, opts);
try {
    while (true) {
        HashMap<String, Object> h = recv.getData();
        if (h == null) {
            break;
        }
        processData(h);
    }
} catch (Throwable e) {
    recv.disconnect();
    throw e;
} finally {
    recv.release();
}
        @endcode

        @return a hash of lists: keys = columns, values = lists of row values or null if all data has been received (do not call this method again after it returns null)

        @throw DB-REMOTE-RECEIVE-ERROR this exception is thrown if this method is called after it returns null signifying end of stream
        @throw QUEUE-TIMEOUT this exception is thrown if a timeout occurs on the @ref Qore::Thread::Queue "Queue"
        @throw STREAM-TERMINATED if the I/O thread was terminated prematurely, this exception will be thrown

        @note exceptions thrown in the socket I/O thread will be rethrown when this method is called so that errors can be handled in the main data thread
    */
    @SuppressWarnings("unchecked")
    public HashMap<String, Object> getData() throws Throwable {
        return(HashMap<String, Object>)obj.callMethod("getData");
    }

    //! Returns all data received by the object in a single call, if the timeout is omitted or equal or less than 0, no timeout is used and the call will block until data is available on the queue
    /**
        @par Examples:
        @code{.java}
DbRemoteReceive recv = new DbRemoteReceive(qrest, "omquser", "select", table_name, opts);
try {
    HashMap<String, Object> h = recv.getAllData(300000);
    if (h != null) {
        processData(h);
    }
} catch (Throwable e) {
    recv.disconnect();
    throw e;
} finally {
    recv.release();
}
        @endcode

        @param timeout_ms an override for the the timeout for waiting on the queue; integers are interpreted as milliseconds; relative date/time values are interpreted literally with a maximum resolution of milliseconds; if the timeout limit is exceeded before data is available, a \c QUEUE-TIMEOUT error is thrown.  If no value is given here, the default queue timeout value configured for the object is used (see the \c "queue_timeout" option in the @ref DbRemoteReceive "constructor")

        @return a hash is returned where keys = columns, values = lists of row values, or null if no data was returned

        @throw DB-REMOTE-RECEIVE-ERROR this exception is thrown if this method is called after it returns null signifying end of stream
        @throw QUEUE-TIMEOUT no data was posted to the queue in the timeout period
        @throw STREAM-TERMINATED if the I/O thread was terminated prematurely, this exception will be thrown

        @note
        - exceptions thrown in the socket I/O thread will be rethrown when this method is called so that errors can be handled in the main data thread
        - any exception thrown in this method (I/O error or timeout error) will cause all data to be lost; when this method returns (either normally or due to an exception), the data complete flag is set and no more data can be retrieved from the object
    */
    @SuppressWarnings("unchecked")
    public HashMap<String, Object> getAllData(int timeout_ms) throws Throwable {
        return(HashMap<String, Object>)obj.callMethod("getAllData", timeout_ms);
    }

    //! Returns all data received by the object in a single call, no timeout is used and the call will block until data is available on the queue
    /**
        @par Examples:
        @code{.java}
DbRemoteReceive recv = new DbRemoteReceive(qrest, "omquser", "select", table_name, opts);
try {
    HashMap<String, Object> h = recv.getAllData();
    if (h != null) {
        processData(h);
    }
} catch (Throwable e) {
    recv.disconnect();
    throw e;
} finally {
    recv.release();
}
        @endcode

        @return a hash is returned where keys = columns, values = lists of row values, or null if no data was returned

        @throw DB-REMOTE-RECEIVE-ERROR this exception is thrown if this method is called after it returns null signifying end of stream
        @throw QUEUE-TIMEOUT no data was posted to the queue in the timeout period
        @throw STREAM-TERMINATED if the I/O thread was terminated prematurely, this exception will be thrown

        @note
        - exceptions thrown in the socket I/O thread will be rethrown when this method is called so that errors can be handled in the main data thread
        - any exception thrown in this method (I/O error or timeout error) will cause all data to be lost; when this method returns (either normally or due to an exception), the data complete flag is set and no more data can be retrieved from the object
    */
    @SuppressWarnings("unchecked")
    public HashMap<String, Object> getAllData() throws Throwable {
        return(HashMap<String, Object>)obj.callMethod("getAllData");
    }

    // returns queued data as a list of rows as soon as it is available, if the timeout is omitted or equal or less than 0, no timeout is used and the call will block until data is available on the queue; once this method return null it signifies that the end of stream data condition has been reached; do not call this method again after it returns null
    /**
        @par Examples:
        @code{.py}
DbRemoteReceive recv = new DbRemoteReceive(qrest, "omquser", "select", table_name, opts);
try {
    while (true) {
        HashMap<String, Object>[] l = recv.getDataRows(120000);
        if (l == null) {
            break;
        }
        processData(h);
    }
} catch (Throwable e) {
    recv.disconnect();
    throw e;
} finally {
    recv.release();
}
        @endcode

        @param timeout_ms an override for the the timeout for waiting on the queue; integers are interpreted as milliseconds; relative date/time values are interpreted literally with a maximum resolution of milliseconds; if the timeout limit is exceeded before data is available, a \c QUEUE-TIMEOUT error is thrown.  If no value is given here, the default queue timeout value configured for the object is used (see the \c "queue_timeout" option in the @ref DbRemoteReceive "constructor")

        @return a list of row data or null if all data has been received (do not call this method again after it returns null)

        @throw DB-REMOTE-RECEIVE-ERROR this exception is thrown if this method is called after it returns null signifying end of stream
        @throw QUEUE-TIMEOUT this exception is thrown if a timeout occurs on the @ref Qore::Thread::Queue "Queue"
        @throw STREAM-TERMINATED if the I/O thread was terminated prematurely, this exception will be thrown

        @note
        - exceptions thrown in the socket I/O thread will be rethrown when this method is called so that errors can be handled in the main data thread
        - the native column format is converted to row format for the return value of this method
    */
    @SuppressWarnings("unchecked")
    public HashMap<String, Object>[] getDataRows(int timeout_ms) throws Throwable {
        return(HashMap<String, Object>[])obj.callMethod("getDataRows", timeout_ms);
    }

    // returns queued data as a list of rows as soon as it is available, no timeout is used and the call will block until data is available on the queue; once this method return null it signifies that the end of stream data condition has been reached; do not call this method again after it returns null
    /**
        @par Examples:
        @code{.py}
DbRemoteReceive recv = new DbRemoteReceive(qrest, "omquser", "select", table_name, opts);
try {
    while (true) {
        HashMap<String, Object>[] l = recv.getDataRows();
        if (l == null) {
            break;
        }
        processData(h);
    }
} catch (Throwable e) {
    recv.disconnect();
    throw e;
} finally {
    recv.release();
}
        @endcode

        @return a list of row data or null if all data has been received (do not call this method again after it returns null)

        @throw DB-REMOTE-RECEIVE-ERROR this exception is thrown if this method is called after it returns null signifying end of stream
        @throw QUEUE-TIMEOUT this exception is thrown if a timeout occurs on the @ref Qore::Thread::Queue "Queue"
        @throw STREAM-TERMINATED if the I/O thread was terminated prematurely, this exception will be thrown

        @note
        - exceptions thrown in the socket I/O thread will be rethrown when this method is called so that errors can be handled in the main data thread
        - the native column format is converted to row format for the return value of this method
    */
    @SuppressWarnings("unchecked")
    public HashMap<String, Object>[] getDataRows() throws Throwable {
        return(HashMap<String, Object>[])obj.callMethod("getDataRows");
    }

    //! returns all data recevied by the object in a single call as a list of rows, if the timeout is omitted or equal or less than 0, no timeout is used and the call will block until data is available on the queue
    /**
        @par Examples:
        @code{.java}
try {
    HashMap<String, Object>[] l = recv.getAllDataRows();
    if (l != null) {
        processData(h);
    }
} catch (Throwable e) {
    recv.disconnect();
    throw e;
} finally {
    recv.release();
}
        @endcode

        @param timeout_ms an override for the the timeout for waiting on the queue; integers are interpreted as milliseconds; relative date/time values are interpreted literally with a maximum resolution of milliseconds; if the timeout limit is exceeded before data is available, a \c QUEUE-TIMEOUT error is thrown.  If no value is given here, the default queue timeout value configured for the object is used (see the \c "queue_timeout" option in the @ref DbRemoteReceive "constructor")

        @return a list of rows or null if no data was returned

        @throw DB-REMOTE-RECEIVE-ERROR this exception is thrown if this method is called after it returns null signifying end of stream
        @throw QUEUE-TIMEOUT no data was posted to the queue in the timeout period
        @throw STREAM-TERMINATED if the I/O thread was terminated prematurely, this exception will be thrown

        @note
        - exceptions thrown in the socket I/O thread will be rethrown when this method is called so that errors can be handled in the main data thread
        - any exception thrown in this method (I/O error or timeout error) will cause all data to be lost; when this method returns (either normally or due to an exception), the data complete flag is set and no more data can be retrieved from the object
        - the native column format is converted to row format for the return value of this method
    */
    @SuppressWarnings("unchecked")
    public HashMap<String, Object>[] getAllDataRows(int timeout_ms) throws Throwable {
        return(HashMap<String, Object>[])obj.callMethod("getAllDataRows", timeout_ms);
    }

    //! returns all data recevied by the object in a single call as a list of rows, no timeout is used and the call will block until data is available on the queue
    /**
        @par Examples:
        @code{.java}
try {
    HashMap<String, Object>[] l = recv.getAllDataRows();
    if (l != null) {
        processData(h);
    }
} catch (Throwable e) {
    recv.disconnect();
    throw e;
} finally {
    recv.release();
}
        @endcode

        @return a list of rows or null if no data was returned

        @throw DB-REMOTE-RECEIVE-ERROR this exception is thrown if this method is called after it returns null signifying end of stream
        @throw QUEUE-TIMEOUT no data was posted to the queue in the timeout period
        @throw STREAM-TERMINATED if the I/O thread was terminated prematurely, this exception will be thrown

        @note
        - exceptions thrown in the socket I/O thread will be rethrown when this method is called so that errors can be handled in the main data thread
        - any exception thrown in this method (I/O error or timeout error) will cause all data to be lost; when this method returns (either normally or due to an exception), the data complete flag is set and no more data can be retrieved from the object
        - the native column format is converted to row format for the return value of this method
    */
    @SuppressWarnings("unchecked")
    public HashMap<String, Object>[] getAllDataRows() throws Throwable {
        return(HashMap<String, Object>[])obj.callMethod("getAllDataRows");
    }

    //! returns the configuration object
    public StreamConfig config() throws Throwable {
        return new StreamConfig((QoreObject)obj.callMethodSave("config"));
    }
}

