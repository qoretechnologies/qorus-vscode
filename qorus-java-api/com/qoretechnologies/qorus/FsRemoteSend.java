/** Qorus Java FsRemoteSend class
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
import com.qoretechnologies.qorus.StreamConfig;

//! Java wrapper for the @ref OMQ::FsRemoteSend class in Qorus
public class FsRemoteSend extends QoreObjectWrapper {
    //! creates the object as a wrapper for the Qore object
    public FsRemoteSend(QoreObject obj) {
        super(obj);
    }

    //! constructor taking a @ref com.qoretechnologies.qorus.DbRemote "DbRemote" object for the remote server
    /**
        @param remote a string giving the name of the @ref remoteconn "remote connection" for the remote server
        @param path a string with full or relative path of the target file (inluding file name)
        @param options optional @ref stream-api-options as follows:
        - \c "timeout": an HTTP socket timeout value in milliseconds; used locally and in the remote for socket I/O and queue operations; default value: \c 5m
        - \c "loglevel": a default log level option for logging; see @ref LogLevels for valid value
        - \c "block": data block size (default 16384, minimum 4096); the number of bytes sent in each @ref datastreamprotocol "DataStream" protocol chunk
        - \c "queue_block_size": the number of blocks to queue for sending before the main data thread will block (default: 2)
        - \c "queue_timeout": the number of milliseconds to wait for queue data before throwing a \c QUEUE-TIMEOUT exception
        - \c "no_remote_timeout": if @ref True the \c "timeout" option will not be sent to the remote

        @note
        - to calculate the total data queued for the socket I/O thread, multiply \a block by \a queue_block_size (default 16384 * 2 = 32768 bytes)
        - the explicit or default timeout value here overrides any socket I/O timeout set for the remote connection object
    */
    public FsRemoteSend(String remote, String path, HashMap<String, Object> options) throws Throwable {
        super(QoreJavaApi.newObjectSave("FsRemoteSend", remote, path, options));
    }

    //! constructor taking a @ref com.qoretechnologies.qorus.DbRemote "DbRemote" object for the remote server
    /**
        @param remote a string giving the name of the @ref remoteconn "remote connection" for the remote server
        @param path a string with full or relative path of the target file (inluding file name)

        @note the explicit or default timeout value here overrides any socket I/O timeout set for the remote connection object
    */
    public FsRemoteSend(DbRemote remote, String path) throws Throwable {
        super(QoreJavaApi.newObjectSave("FsRemoteSend", remote, path));
    }

    //! this method flushes all buffered I/O to the remote server and returns when all data have been sent to the server and the socket I/O thread has terminated
    /** @par Example:
        @code{.java}
FsRemoteSend fs = new FsRemoteSend(qrest, target_path, opts);
try {
    // send all strings in an array of strings
    for (String str : array) {
        fs.append(str);
    }
    // finalize the data transfer
    fs.commit();
} catch (Throwable e) {
    // cancel the send stream
    fs.cancel();
} finally {
    // release the weak reference to the Qore object
    fs.release();
}
        @endcode

        Log messages are created with performance information (bytes send, time of transfer, bytes / second, etc).

        @note
        - either this method, flush() or cancel() should be called to ensure that all data has been sent
        - exceptions thrown in the socket I/O thread will be rethrown when this method is called so that errors can be handled in the main data thread
        - equivalent to flush()

        @see flush()
    */
    public void commit() throws Throwable {
        obj.callMethod("commit");
    }

    //! this method purges any queued I/O and stops the socket thread and returns when the socket I/O thread has terminated
    /** @par Example:
        @code{.java}
FsRemoteSend fs = new FsRemoteSend(qrest, target_path, opts);
try {
    // send all strings in an array of strings
    for (String str : array) {
        fs.append(str);
    }
    // finalize the data transfer
    fs.commit();
} catch (Throwable e) {
    // cancel the send stream
    fs.cancel();
} finally {
    // release the weak reference to the Qore object
    fs.release();
}
        @endcode

        @note either this method or commit() should be called to ensure that all data has been sent
    */
    public void cancel() throws Throwable {
        obj.callMethod("cancel");
    }

    //! Append data to the ready queue
    /** @par Example:
        @code{.java}
FsRemoteSend fs = new FsRemoteSend(qrest, target_path, opts);
try {
    // send all strings in an array of strings
    for (String str : array) {
        fs.append(str);
    }
    // finalize the data transfer
    fs.commit();
} catch (Throwable e) {
    // cancel the send stream
    fs.cancel();
} finally {
    // release the weak reference to the Qore object
    fs.release();
}
        @endcode

        @param data data to be sent

        Data are queued for sending when the buffered byte count reaches the \c block size.

        @note
        - make sure to call either commit() (to flush all data to the server) or cancel() (to cancel the I/O operation) before continuing (see the example above)
        - exceptions thrown in the socket I/O thread will be rethrown when this method is called so that errors can be handled in the main data thread
      */
    public void append(String data) throws Throwable {
        obj.callMethod("append", data);
    }

    //! Append data to the ready queue
    /** @par Example:
        @code{.java}
FsRemoteSend fs = new FsRemoteSend(qrest, target_path, opts);
try {
    // send all strings in an array of strings
    for (String str : array) {
        fs.append(str);
    }
    // finalize the data transfer
    fs.commit();
} catch (Throwable e) {
    // cancel the send stream
    fs.cancel();
} finally {
    // release the weak reference to the Qore object
    fs.release();
}
        @endcode

        @param data data to be sent

        Data are queued for sending when the buffered byte count reaches the \c block size.

        @note
        - make sure to call either commit() (to flush all data to the server) or cancel() (to cancel the I/O operation) before continuing (see the example above)
        - exceptions thrown in the socket I/O thread will be rethrown when this method is called so that errors can be handled in the main data thread
    */
    public void append(byte[] data) throws Throwable {
        obj.callMethod("append", (Object)data);
    }

    //! executes an implicit commit() and renames/moves the file given in \c path in the constructor()
    /** @par Example:
        @code{.java}
FsRemoteSend fs = new FsRemoteSend(qrest, target_path, opts);
try {
    // send all strings in an array of strings
    for (String str : array) {
        fs.append(str);
    }
    // finalize the data transfer
    fs.commit();
    // rename the file after the transfer
    fs.rename(final_name);
} catch (Throwable e) {
    // cancel the send stream
    fs.cancel();
} finally {
    // release the weak reference to the Qore object
    fs.release();
}
        @endcode

        @param target a new path with filename. Relative to user connection if the user connection constructor is used.
        @param man rename the file manually by copying the file's data and then deleting the source file, this is sometimes necessary on some OSes when renaming files across filesystem boundaries

        @warning The original file after the rename does not exist anymore
                 if \c man is set to @ref True. Any additional append()
                 call will result in an exception.

        @note do not call this method before all data have been sent (ie call only after calling commit() first as in the example above)
     */
    public void rename(String target, boolean man) throws Throwable {
        obj.callMethod("rename", target, man);
    }

    //! executes an implicit commit() and deletes the file given in \c path in the constructor()
    /** @par Example:
        @code{.java}
FsRemoteSend fs = new FsRemoteSend(qrest, target_path, opts);
try {
    // send all strings in an array of strings
    for (String str : array) {
        fs.append(str);
    }
    // finalize the data transfer
    fs.commit();
    // delete the file after the transfer
    fs.del();
} catch (Throwable e) {
    // cancel the send stream
    fs.cancel();
} finally {
    // release the weak reference to the Qore object
    fs.release();
}
        @endcode

        @note do not call this method before all data have been sent (ie call only after calling commit() first as in the example above)
     */
    public void del() throws Throwable {
        obj.callMethod("del");
    }

    //! returns the configuration object
    public StreamConfig config() throws Throwable {
        return(StreamConfig)obj.callMethod("config");
    }
}

