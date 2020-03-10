/** Qorus Java DbRemote class
 *
 */
package com.qoretechnologies.qorus;

// java imports
import java.util.HashMap;

// jni module imports
import org.qore.jni.QoreObject;
import org.qore.jni.QoreJavaApi;
import org.qore.jni.QoreObjectWrapper;

// Qorus imports
import com.qoretechnologies.qorus.StreamConfig;
import com.qoretechnologies.qorus.QorusSystemRestHelper;

//! Java wrapper for the @ref OMQ::DbRemote class in Qorus
public class DbRemote extends QoreObjectWrapper {
    //! creates the object as a wrapper for the Qore object
    public DbRemote(QoreObject obj) {
        super(obj);
    }

    //! constructor taking a string giving the name of the @ref remoteconn "remote connection" for the remote server
    /**
        @param remote a string giving the name of the @ref remoteconn "remote connection" for the remote server
        @param dsname a string with name of the remote @ref dsconn "datasource" to use
        @param opts optional @ref stream-api-options as follows:
        - \c "timeout": an HTTP socket timeout value in milliseconds; used locally and in the remote for socket I/O and queue operations; default value: \c 5m
        - \c "loglevel": a default log level option for logging; see @ref LogLevels for valid value
        - \c "no_remote_timeout": if @ref True the \c "timeout" option will not be sent to the remote

        @note the explicit or default timeout value here overrides any socket I/O timeout set for the remote connection object
    */
    public DbRemote(String remote, String dsname, HashMap<String, Object> opts) throws Throwable {
        super(QoreJavaApi.newObjectSave("DbRemote", remote, dsname, opts));
    }

    //! constructor taking a string giving the name of the @ref remoteconn "remote connection" for the remote server
    /**
        @param remote a string giving the name of the @ref remoteconn "remote connection" for the remote server
        @param dsname a string with name of the remote @ref dsconn "datasource" to use

        @note the explicit or default timeout value here overrides any socket I/O timeout set for the remote connection object
    */
    public DbRemote(String remote, String dsname) throws Throwable {
        super(QoreJavaApi.newObjectSave("DbRemote", remote, dsname));
    }

    //! constructor taking a @ref com.qoretechnologies.qorus.QorusSystemRestHelper object for the remote server
    /**
        @param remote a @ref com.qoretechnologies.qorus.QorusSystemRestHelper object for the remote server
        @param dsname a string with name of the remote @ref dsconn "datasource" to use
        @param opts optional @ref stream-api-options as follows:
        - \c "timeout": an HTTP socket timeout value in milliseconds; used locally and in the remote for socket I/O and queue operations; default value: \c 5m
        - \c "loglevel": a default log level option for logging; see @ref LogLevels for valid value
        - \c "no_remote_timeout": if @ref True the \c "timeout" option will not be sent to the remote

        @note the explicit or default timeout value here overrides any socket I/O timeout set for the remote connection object
    */
    public DbRemote(QorusSystemRestHelper remote, String dsname, HashMap<String, Object> opts) throws Throwable {
        super(QoreJavaApi.newObjectSave("DbRemote", remote.getQoreObject(), dsname, opts));
    }

    //! constructor taking a @ref com.qoretechnologies.qorus.QorusSystemRestHelper object for the remote server
    /**
        @param remote a @ref com.qoretechnologies.qorus.QorusSystemRestHelper object for the remote server
        @param dsname a string with name of the remote @ref dsconn "datasource" to use

        @note the explicit or default timeout value here overrides any socket I/O timeout set for the remote connection object
    */
    public DbRemote(QorusSystemRestHelper remote, String dsname) throws Throwable {
        super(QoreJavaApi.newObjectSave("DbRemote", remote.getQoreObject(), dsname));
    }

    //! starts or continues a remote transaction
    /** This method is called from the constructor() automatically
     */
    public void beginTransaction() throws Throwable {
        obj.callMethod("beginTransaction");
    }

    //! returns the remote @ref dsconn "datasource" name specified in constructor
    public String datasourceName() throws Throwable {
        return (String)obj.callMethod("datasourceName");
    }

    //! returns the configuration object
    public StreamConfig config() throws Throwable {
        return new StreamConfig((QoreObject)obj.callMethodSave("config"));
    }

    //! commits a remote transaction
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

    //! Disconnects the connection
    public void disconnect() throws Throwable {
        obj.callMethod("disconnect");
    }

    //! Calls a remote method and returns the result
    public Object callRemoteMethod(String method, Object... args) throws Throwable {
        Object[] new_args = new Object[args.length + 1];
        new_args[0] = method;
        System.arraycopy(args, 0, new_args, 1, args.length);
        return obj.callMethodArgs("methodGate", new_args);
    }
}
