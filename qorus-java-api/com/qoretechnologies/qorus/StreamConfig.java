/** Qorus Java StreamConfig class
 *
 */
package com.qoretechnologies.qorus;

// jni module imports
import org.qore.jni.QoreObject;
import org.qore.jni.QoreJavaApi;
import org.qore.jni.QoreObjectWrapper;

//! Java wrapper for the @ref OMQ::StreamConfig class in Qore
public class StreamConfig extends QoreObjectWrapper {
    //! creates the object as a wrapper for the Qore object
    public StreamConfig(QoreObject obj) {
        super(obj);
    }

    //! returns the stream name
    public String stream() throws Throwable {
        return (String)obj.callMethod("stream");
    }

    //! returns a description of the stream for error reporting
    public String streamDesc() throws Throwable {
        return (String)obj.callMethod("streamDesc");
    }

    //! returns the timeout value in milliseconds
    public int timeout() throws Throwable {
        return (int)obj.callMethod("timeout");
    }

    //! returns the block size
    public int block() throws Throwable {
        return (int)obj.callMethod("block");
    }

    //! returns @ref True if no \c "timeout" option should be sent to the remote
    public boolean suppressRemoteTimeout() throws Throwable {
        return (boolean)obj.callMethod("suppressRemoteTimeout");
    }

    //! logs a stream message with log level info
    public void logger(String message, Object... args) throws Throwable {
        Object[] new_args = new Object[args.length + 1];
        new_args[0] = message;
        System.arraycopy(args, 0, new_args, 1, args.length);
        obj.callMethod("logger", new_args);
    }

    //! logs a stream message with log level debug
    public void debug(String message, Object... args) throws Throwable {
        Object[] new_args = new Object[args.length + 1];
        new_args[0] = message;
        System.arraycopy(args, 0, new_args, 1, args.length);
        obj.callMethod("debug", new_args);
    }
}

