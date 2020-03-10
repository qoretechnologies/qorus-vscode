/** Qorus Java DbRemoteSend class
 *
 */
package com.qoretechnologies.qorus;

// java imports
import java.util.HashMap;

// jni module imports
import org.qore.jni.QoreObject;
import org.qore.jni.QoreObjectWrapper;
import org.qore.jni.QoreJavaApi;

// qorus imports
import com.qoretechnologies.qorus.DbRemote;
import com.qoretechnologies.qorus.StreamConfig;
import com.qoretechnologies.qorus.QorusSystemRestHelper;

//! Java wrapper for the @ref OMQ::DbRemoteSend class in Qorus
public class DbRemoteSend extends QoreObjectWrapper {
    //! creates the object as a wrapper for the Qore object
    public DbRemoteSend(QoreObject obj) {
        super(obj);
    }

    //! constructor taking a @ref com.qoretechnologies.qorus.DbRemote "DbRemote" object for the remote server
    /**
        @param remote a DbRemote object
        @param stream the @ref system_sqlutil "system.sqlutil service stream" to be used
        @param table_name a string with remote table name located in the remote @ref dsconn "datasource"
        @param options optional @ref stream-api-options as follows:
        - \c "block": data block size
        - \c "loglevel": a default log level option for logging; see @ref LogLevels for valid value
        - \c "no_remote_timeout": if @ref True the \c "timeout" option will not be sent to the remote
        - \c "omit_update": a list of columns to omit when updating for asymmetrical upserts; only valid with the \c "upsert" stream; if this option is given with other streams, it will be ignored
        - \c "queue_block_size": the number of blocks to queue for sending before the main data thread will block (default: 2)
        - \c "queue_timeout": the number of milliseconds to wait for queue data before throwing a \c QUEUE-TIMEOUT exception
        - \c "timeout": an HTTP socket timeout value in milliseconds; used locally and in the remote for socket I/O and queue operations; default value: \c 5m
        - \c "upsert_strategy": an @ref sql_upsert_strategies "upsert strategy code"; only valid with the \c "upsert" stream; if this option is given with other streams, it will be ignored

        @note the explicit or default timeout value here overrides any socket I/O timeout set for the remote connection object
    */
    public DbRemoteSend(DbRemote remote, String stream, String table_name, HashMap<String, Object> options) throws Throwable {
        super(QoreJavaApi.newObjectSave("DbRemoteSend", remote, stream, table_name, options));
    }

    //! constructor taking a @ref com.qoretechnologies.qorus.DbRemote "DbRemote" object for the remote server
    /**
        @param remote a DbRemote object
        @param stream the @ref system_sqlutil "system.sqlutil service stream" to be used
        @param table_name a string with remote table name located in the remote @ref dsconn "datasource"

        @note the explicit or default timeout value here overrides any socket I/O timeout set for the remote connection object
    */
    public DbRemoteSend(DbRemote remote, String stream, String table_name) throws Throwable {
        super(QoreJavaApi.newObjectSave("DbRemoteSend", remote, stream, table_name));
    }

    //! constructor taking a string giving the name of the @ref remoteconn "remote connection" for the remote server
    /**
        @param remote the name of the @ref remoteconn "remote connection" for the remote server
        @param datasource a string with name of the remote @ref dsconn "datasource" to use
        @param stream the @ref system_sqlutil "system.sqlutil service stream" to be used
        @param table_name a string with remote table name located in the remote @ref dsconn "datasource"
        @param options optional @ref stream-api-options as follows:
        - \c "block": data block size
        - \c "loglevel": a default log level option for logging; see @ref LogLevels for valid value
        - \c "no_remote_timeout": if @ref True the \c "timeout" option will not be sent to the remote
        - \c "omit_update": a list of columns to omit when updating for asymmetrical upserts; only valid with the \c "upsert" stream; if this option is given with other streams, it will be ignored
        - \c "queue_block_size": the number of blocks to queue for sending before the main data thread will block (default: 2)
        - \c "queue_timeout": the number of milliseconds to wait for queue data before throwing a \c QUEUE-TIMEOUT exception
        - \c "timeout": an HTTP socket timeout value in milliseconds; used locally and in the remote for socket I/O and queue operations; default value: \c 5m
        - \c "upsert_strategy": an @ref sql_upsert_strategies "upsert strategy code"; only valid with the \c "upsert" stream; if this option is given with other streams, it will be ignored

        @note the explicit or default timeout value here overrides any socket I/O timeout set for the remote connection object
    */
    public DbRemoteSend(String remote, String datasource, String stream, String table_name, HashMap<String, Object> options) throws Throwable {
        super(QoreJavaApi.newObjectSave("DbRemoteSend", remote, datasource, stream, table_name, options));
    }

    //! constructor taking a string giving the name of the @ref remoteconn "remote connection" for the remote server
    /**
        @param remote the name of the @ref remoteconn "remote connection" for the remote server
        @param datasource a string with name of the remote @ref dsconn "datasource" to use
        @param stream the @ref system_sqlutil "system.sqlutil service stream" to be used
        @param table_name a string with remote table name located in the remote @ref dsconn "datasource"

        @note the explicit or default timeout value here overrides any socket I/O timeout set for the remote connection object
    */
    public DbRemoteSend(String remote, String datasource, String stream, String table_name) throws Throwable {
        super(QoreJavaApi.newObjectSave("DbRemoteSend", remote, datasource, stream, table_name));
    }

    //! constructor taking a @ref com.qoretechnologies.qorus.QorusSystemRestHelper object for the remote server
    /**
        @param remote a @ref com.qoretechnologies.qorus.QorusSystemRestHelper object
        @param datasource a string with name of the remote @ref dsconn "datasource" to use
        @param stream the @ref system_sqlutil "system.sqlutil service stream" to be used
        @param table_name a string with remote table name located in the remote @ref dsconn "datasource"
        @param options optional @ref stream-api-options as follows:
        - \c "block": data block size
        - \c "loglevel": a default log level option for logging; see @ref LogLevels for valid value
        - \c "no_remote_timeout": if @ref True the \c "timeout" option will not be sent to the remote
        - \c "omit_update": a list of columns to omit when updating for asymmetrical upserts; only valid with the
          \c "upsert" stream; if this option is given with other streams, it will be ignored
        - \c "queue_block_size": the number of blocks to queue for sending before the main data thread will block
          (default: 2)
        - \c "queue_timeout": the number of milliseconds to wait for queue data before throwing a \c QUEUE-TIMEOUT
          exception
        - \c "timeout": an HTTP socket timeout value in milliseconds; used locally and in the remote for socket I/O
          and queue operations; default value: \c 5m
        - \c "upsert_strategy": an @ref sql_upsert_strategies "upsert strategy code"; only valid with the \c "upsert"
          stream; if this option is given with other streams, it will be ignored

        @note the explicit or default timeout value here overrides any socket I/O timeout set for the remote connection object
    */
    public DbRemoteSend(QorusSystemRestHelper remote, String datasource, String stream, String table_name, HashMap<String, Object> options) throws Throwable {
        super(QoreJavaApi.newObjectSave("DbRemoteSend", remote.getQoreObject(), datasource, stream, table_name, options));
    }

    //! constructor taking a @ref com.qoretechnologies.qorus.QorusSystemRestHelper object for the remote server
    /**
        @param remote a @ref com.qoretechnologies.qorus.QorusSystemRestHelper object
        @param datasource a string with name of the remote @ref dsconn "datasource" to use
        @param stream the @ref system_sqlutil "system.sqlutil service stream" to be used
        @param table_name a string with remote table name located in the remote @ref dsconn "datasource"

        @note the explicit or default timeout value here overrides any socket I/O timeout set for the remote connection object
    */
    public DbRemoteSend(QorusSystemRestHelper remote, String datasource, String stream, String table_name) throws Throwable {
        super(QoreJavaApi.newObjectSave("DbRemoteSend", remote.getQoreObject(), datasource, stream, table_name));
    }

    //! flushes the current stream and reopens a new stream with the same remote connection and in the same @ref dsconn "datasource"s
    /** @par Example:
        @code{.java}
out.openStream("update", "table2");
        @endcode

        @param stream the @ref system_sqlutil "system.sqlutil service stream" to be used
        @param table_name a string with remote table name located in the remote @ref dsconn "datasource"
        @param options optional @ref stream-api-options as follows:
        - \c "block": data block size giving the number of rows per block
        - \c "timeout": an HTTP socket timeout value in milliseconds; used locally and in the remote for socket I/O and queue operations; default value: \c 5m
        - \c "loglevel": a default log level option for logging; see @ref LogLevels for valid value
        - \c "no_remote_timeout": if @ref True the \c "timeout" option will not be sent to the remote
        - \c "queue_block_size": the number of blocks to queue for sending before the main data thread will block (default: 2)
        - \c "queue_timeout": the number of milliseconds to wait for queue data before throwing a \c QUEUE-TIMEOUT exception
     */
    public void openStream(String stream, String table_name, HashMap<String, Object> options) throws Throwable {
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

    //! Commit the remote transaction. It also sends any pending data in the data queue before the commit.
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

    //! Append data to the ready queue: list
    /**
        @param data a list with row data to be added. It should follow the expected target format (list of hashes, each list element represents a row and each has the row data).

        Data are sent whenever their count reaches the \c block size.

        The DB transaction is left open.

        @note This class assumes that data submitted with the append() methods is stable; that is, it has the same format and same hash keys, additionally, if there are any SqlUtil operator hashes, that they are identical in every row
    */
    public void append(HashMap<String, Object>[] data) throws Throwable {
        obj.callMethod("append", (Object)data);
    }

    //! Append data to the ready queue: hash
    /**
        @param data a hash with data to be added; can be a single row or multiple rows in column format

        Data are sent whenever the row count reaches the \c block size.

        The DB transaction is left open.

        @note This class assumes that data submitted with the append() methods is stable; that is, it has the same format and same hash keys, additionally, if there are any SqlUtil operator hashes, that they are identical in every row
    */
    public void append(HashMap<String, Object> data) throws Throwable {
        obj.callMethod("append", data);
    }

    //! returns the configuration object
    public StreamConfig config() throws Throwable {
        return new StreamConfig((QoreObject)obj.callMethodSave("config"));
    }
}

