/** Qorus Java AbstractFsRemoteReceive class
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

//! Java wrapper for the @ref OMQ::AbstractFsRemoteReceive class in Qorus
public abstract class AbstractFsRemoteReceive extends QoreObjectWrapper {
    /** @defgroup JavaAbstractFsRemoteReceive_formats Java AbstractFsRemoteReceive Stream Types
    */
    //@{
    //! Raw file transfer
    public static final String TYPE_FILE = "get-file";
    //! Receive CSV data
    public static final String TYPE_CSV = "get-csv-data";
    //! Receive XML data
    public static final String TYPE_XML = "get-xml-data";
    //@}

    //! Creates the object and starts receiving file data immediately
    /** @param remote a string with a @ref remoteconn "remote Qorus connection" name as defined in @ref remoteconn
        @param path a source (remote) file path
        @param streamType a string with @ref AbstractFsRemoteReceive_formats
        @param options optional @ref stream-api-options with additional @ref AbstractFsRemoteReceive_options
     */
    public AbstractFsRemoteReceive(String remote, String path, String streamType, HashMap<String, Object> options) throws Throwable {
        super(QoreJavaApi.newObjectSave("JavaFsRemoteReceive", remote, path, streamType, options));
        obj.callMethod("setJavaObject", this);
    }

    //! Creates the object and starts receiving file data immediately
    /** @param remote a string with a @ref remoteconn "remote Qorus connection" name as defined in @ref remoteconn
        @param path a source (remote) file path
        @param streamType a string with @ref AbstractFsRemoteReceive_formats
     */
    public AbstractFsRemoteReceive(String remote, String path, String streamType) throws Throwable {
        super(QoreJavaApi.newObjectSave("JavaFsRemoteReceive", remote, path, streamType));
        obj.callMethod("setJavaObject", this);
    }

    //! Creates the object and starts receiving file data immediately
    /** @param remote a string with a @ref remoteconn "remote Qorus connection" name as defined in @ref remoteconn
        @param path a source (remote) file path

        @note the stream type is set to @ref TYPE_FILE automatically with this constructor
     */
    public AbstractFsRemoteReceive(String remote, String path) throws Throwable {
        super(QoreJavaApi.newObjectSave("JavaFsRemoteReceive", remote, path));
        obj.callMethod("setJavaObject", this);
    }

    //! Creates the object and starts receiving file data immediately
    /** @param remote a string with a @ref remoteconn "remote Qorus connection" name as defined in @ref remoteconn
        @param conn a remote filesystem based user connection name
        @param path a source (remote) file path, relative to the \c conn root
        @param streamType a string with @ref AbstractFsRemoteReceive_formats
        @param options optional @ref stream-api-options with additional @ref AbstractFsRemoteReceive_options
     */
    public AbstractFsRemoteReceive(String remote, String conn, String path, String streamType, HashMap<String, Object> options)throws Throwable {
        super(QoreJavaApi.newObjectSave("JavaFsRemoteReceive", remote, conn, path, streamType, options));
        obj.callMethod("setJavaObject", this);
    }

    //! Creates the object and starts receiving file data immediately
    /** @param remote a string with a @ref remoteconn "remote Qorus connection" name as defined in @ref remoteconn
        @param conn a remote filesystem based user connection name
        @param path a source (remote) file path, relative to the \c conn root
        @param streamType a string with @ref AbstractFsRemoteReceive_formats
     */
    public AbstractFsRemoteReceive(String remote, String conn, String path, String streamType) throws Throwable {
        super(QoreJavaApi.newObjectSave("JavaFsRemoteReceive", remote, conn, path, streamType));
        obj.callMethod("setJavaObject", this);
    }

    //! An abstract method to handle incoming data
    /**
        Data are comming in a form regarding the stream type:
            - TYPE_FILE: string or binary
            - TYPE_CSV: HashMap<String, Object>[]: See CsvUtil module for reference
            - TYPE_XML: HashMap<String, Object>[]: XML serialized hashes.
      */
    abstract void recvDataImpl(Object data);

    //! rename/move currently operated file given in \c path in constructor
    /**
        @param target a new path with filename. Relative to user connection if the user connection constructor is used.
        @param man rename the file manually by copying the file's data and then deleting the source file, this is sometimes necessary on some OSes when renaming files across filesystem boundaries

        @warning The original file after the rename does not exist anymore
                 if \c man is set to @ref True. Any additional append()
                 call will result in an exception.

        @note do not call this method before all data have been received
     */
    public void rename(String target, boolean man) throws Throwable {
        obj.callMethod("rename", target, man);
    }

    //! delete currently operated file given in \c path in constructor or any other file name
    /**
        @param target an optional new path with filename. Relative to user connection if the user connection constructor is used.
               If it's empty (\c NOTHING) the path specified in constructor is used.
               Otherwise any file name given to this method will be deleted.
     */
    public void del(String target) throws Throwable {
        obj.callMethod("del", target);
    }

    //! delete currently operated file given in \c path in constructor or any other file name
    /**
     */
    public void del() throws Throwable {
        obj.callMethod("del");
    }

    //! returns the configuration object
    public StreamConfig config() throws Throwable {
        return(StreamConfig)obj.callMethod("config");
    }
}

