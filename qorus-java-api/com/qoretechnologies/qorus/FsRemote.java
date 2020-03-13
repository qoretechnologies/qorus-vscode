/** Qorus Java FsRemote class
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

//! Java wrapper for the @ref OMQ::FsRemote class in Qorus
public class FsRemote extends QoreObjectWrapper {
    //! creates the object as a wrapper for the Qore object
    public FsRemote(QoreObject obj) {
        super(obj);
    }

    //! constructor taking a string giving the name of the @ref remoteconn "remote connection" for the remote server
    /**
        @param remote a string giving the name of the @ref remoteconn "remote connection" for the remote server
        @param opts optional @ref stream-api-options as follows:
        - \c "timeout": an HTTP socket timeout value in milliseconds; used locally and in the remote for socket I/O and queue operations; default value: \c 5m
        - \c "loglevel": a default log level option for logging; see @ref LogLevels for valid value
        - \c "no_remote_timeout": if @ref True the \c "timeout" option will not be sent to the remote

        @note the explicit or default timeout value here overrides any socket I/O timeout set for the remote connection object
    */
    public FsRemote(String remote, HashMap<String, Object> opts) throws Throwable {
        super(QoreJavaApi.newObjectSave("FsRemote", remote, opts));
    }

    //! constructor taking a string giving the name of the @ref remoteconn "remote connection" for the remote server
    /**
        @param remote a string giving the name of the @ref remoteconn "remote connection" for the remote server

        @note the explicit or default timeout value here overrides any socket I/O timeout set for the remote connection object
    */
    public FsRemote(String remote) throws Throwable {
        super(QoreJavaApi.newObjectSave("FsRemote", remote));
    }

    //! constructor taking a @ref com.qoretechnologies.qorus.QorusSystemRestHelper object for the remote server
    /**
        @param remote a @ref com.qoretechnologies.qorus.QorusSystemRestHelper object for the remote server
        @param opts optional @ref stream-api-options as follows:
        - \c "timeout": an HTTP socket timeout value in milliseconds; used locally and in the remote for socket
          I/O and queue operations; default value: \c 5m
        - \c "loglevel": a default log level option for logging; see @ref LogLevels for valid value
        - \c "no_remote_timeout": if @ref True the \c "timeout" option will not be sent to the remote

        @note the explicit or default timeout value here overrides any socket I/O timeout set for the remote
        connection object
    */
    public FsRemote(QorusSystemRestHelper remote, HashMap<String, Object> opts) throws Throwable {
        super(QoreJavaApi.newObjectSave("FsRemote", remote.getQoreObject(), opts));
    }

    //! constructor taking a @ref com.qoretechnologies.qorus.QorusSystemRestHelper object for the remote server
    /**
        @param remote a @ref com.qoretechnologies.qorus.QorusSystemRestHelper object for the remote server

        @note the explicit or default timeout value here overrides any socket I/O timeout set for the remote
        connection object
    */
    public FsRemote(QorusSystemRestHelper remote) throws Throwable {
        super(QoreJavaApi.newObjectSave("FsRemote", remote.getQoreObject()));
    }

    //! returns the configuration object
    public StreamConfig config() throws Throwable {
        return new StreamConfig((QoreObject)obj.callMethodSave("config"));
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
        return(String)obj.callMethodArgs("methodGate", new_args);
    }
}
