/** Java wrapper for the QorusClientCore class
 *
 */
package com.qoretechnologies.qorus.client;

// Java imports
import java.util.Map;
import java.util.HashMap;

// Qore jni imports
import org.qore.jni.QoreObject;
import org.qore.jni.QoreJavaApi;

// Qore lang imports
import org.qore.lang.*;

// Qorus imports
import com.qoretechnologies.qorus.*;
import com.qoretechnologies.qorus.client.*;

//! main Qorus Java client class
public class QorusClientAPI extends QorusClientCore {
    //! creates the client object
    public QorusClientAPI() throws Throwable {
        super(QoreJavaApi.newObjectSave("OMQ::QorusClientAPI"));
    }

    //! returns True if the installation is an LSB installation, False if not
    /** @return True if the installation is an LSB installation, False if not
    */
    public boolean isLSB() throws Throwable {
        return (boolean)obj.callMethod("isLSB");
    }

    //! returns the options file name
    /** @return the options file name
    */
    public String getOptionFileName() throws Throwable {
        return (String)obj.callMethod("getOptionFileName");
    }

    //! sets a flag to ignore warnings
    public static void ignoreWarnings(boolean ignore_warnings) throws Throwable {
        QoreJavaApi.callStaticMethod("QorusClientAPI", "ignoreWarnings", ignore_warnings);
    }

    //! sets a flag to ignore warnings
    public static void ignoreWarnings() throws Throwable {
        QoreJavaApi.callStaticMethod("QorusClientAPI", "ignoreWarnings", true);
    }

    //! Returns a hash describing all defined @ref userconn "user connections" or \c null if no user connections are defined
    /** @par Example:
        @code{.java}
        HashMap<String, Object> h = omqclient.getUserConnectionInfo();
        @endcode

        @return a hash describing all defined @ref userconn "user connections" or \c null if no user connections are defined; keys are user connection names; hash values correspond to the return value of @ref ConnectionProvider::AbstractConnection::getInfo()

        @note connection-specific exceptions could be thrown initializing connections
    */
    @SuppressWarnings("unchecked")
    public HashMap<String, Object> getUserConnectionInfo() throws Throwable {
        return (HashMap<String, Object>)obj.callMethod("getUserConnectionInfo");
    }

    //! Returns a hash describing the given @ref userconn "user connection"
    /** @par Example:
        @code{.java}
        HashMap<String, Object> h = omqclient.getUserConnectionInfo(name);
        @endcode

        @param name the name of the @ref userconn "connection"

        @return a hash describing the given @ref userconn "user connections"; the return value corresponds to the return value of @ref ConnectionProvider::AbstractConnection::getInfo(); if the connection is invalid or unknown an exception is thrown

        @throw CONNECTION-ERROR The given connection is invalid or unknown

        @note connection-specific exceptions could be thrown initializing connections
    */
    @SuppressWarnings("unchecked")
    public HashMap<String, Object> getUserConnectionInfo(String name) throws Throwable {
        return (HashMap<String, Object>)obj.callMethod("getUserConnectionInfo", name);
    }

    //! Returns the URL corresponding to a defined @ref userconn "user connection"
    /** @par Example:
        @code{.java}
        String url = omqclient.getUserConnectionUrl(name);
        @endcode

        @param name the name of the @ref userconn "connection"

        @return the URL string for the connection

        @throw CONNECTION-ERROR The given connection is invalid or unknown

        @note other connection-specific exceptions could be thrown initializing connections
    */
    public String getUserConnectionUrl(String name) throws Throwable {
        return (String)obj.callMethod("getUserConnectionUrl", name);
    }

    //! returns the datasource connection string for the given datasource if defined in @ref dsconn
    /** @par Example:
        @code{.java}
        String connstr = omqclient.getDatasourceConnectionString("app2");
        @endcode

        An exception is thrown if the datasource is not known

        @param name the name of the datasource to retrieve

        @return the datasource connection string for the given datasource

        @throw INVALID-DATASOURCE unknown datasource

        @see getDatasourcePool()
    */
    public String getDatasourceConnectionString(String name) throws Throwable {
        return (String)obj.callMethod("getDatasourceConnectionString", name);
    }

    //! returns the path to the configuration directory for this instance of Qorus
    /** @return the path to the configuration directory for this instance of Qorus
    */
    public String getConfigDir() throws Throwable {
        return (String)obj.callMethod("getConfigDir");
    }

    //! returns the path to the application root directory
    /** for LSB instances, always returns "/var/opt/qorus"
        @return the path to the application root directory
    */
    public String getAppDir() throws Throwable {
        return (String)obj.callMethod("getAppDir");
    }

    //! returns a DatasourcePool object for the given string if defined in @ref dsconn
    /** @par Example:
        @code{.java}
DatasourcePool app2p = omqclient.getDatasourcePool("app2");
        @endcode

        An exception is thrown if the datasource is not known.  The same DatasourcePool object will always be returned
        from this method.

        @param name the name of the datasource to use as a basis for creating the DatasourcePool object
        @param min override the minimum connection setting
        @param max override the maximum connection setting

        @return the DatasourcePool object for the given string

        @see getNewDatasourcePool()
    */
    public DatasourcePool getDatasourcePool(String name, int min, int max) throws Throwable {
        return (DatasourcePool)obj.callMethod("getDatasourcePool", name, min, max);
    }

    //! returns a DatasourcePool object for the given string if defined in @ref dsconn
    /** @par Example:
        @code{.java}
DatasourcePool app2p = omqclient.getDatasourcePool("app2");
        @endcode

        An exception is thrown if the datasource is not known.  The same DatasourcePool object will always be returned
        from this method.

        @param name the name of the datasource to use as a basis for creating the DatasourcePool object

        @return the DatasourcePool object for the given string

        @see getNewDatasourcePool()
    */
    public DatasourcePool getDatasourcePool(String name) throws Throwable {
        return (DatasourcePool)obj.callMethod("getDatasourcePool", name);
    }

    // returns a new DatasourcePool object for the given string if defined in @ref dsconn
    /** @par Example:
        @code{.java}
DatasourcePool app2p = omqclient.getNewDatasourcePool("app2");
        @endcode

        An exception is thrown if the datasource is not known

        @param name the name of the datasource to use as a basis for creating the DatasourcePool object
        @param min the minumum number of connections to open when the object is created
        @param max the maximum number of connections to manage; not more than these connections will be opened

        @return the Datasource object for the given string

        @see getDatasourcePool()
    */
    public DatasourcePool getNewDatasourcePool(String name, int min, int max) throws Throwable {
        return (DatasourcePool)obj.callMethod("getNewDatasourcePool", name, min, max);
    }

    // returns a new DatasourcePool object for the given string if defined in @ref dsconn
    /** @par Example:
        @code{.java}
DatasourcePool app2p = omqclient.getNewDatasourcePool("app2");
        @endcode

        An exception is thrown if the datasource is not known

        @param name the name of the datasource to use as a basis for creating the DatasourcePool object

        @return the Datasource object for the given string

        @see getDatasourcePool()
    */
    public DatasourcePool getNewDatasourcePool(String name) throws Throwable {
        return (DatasourcePool)obj.callMethod("getNewDatasourcePool", name);
    }

    //! returns a hash of @ref remoteconn "remote connections" keyed by remote connection name or @ref nothing if no @ref remoteconn "remote connections" are defined
    /** @par Example:
        @code{.java}
HashMap<String, Object> h = omqclient.getRemoteInfo();
        @endcode

        @return a hash of @ref remoteconn "remote connections" keyed by remote connection name or @ref nothing if no @ref remoteconn "remote connections" are defined; hash values correspond to the return value of @ref ConnectionProvider::AbstractConnection::getInfo()

        @throw REMOTE-LOAD-ERROR Missing @ref remoteconn config file or malformed syntax
    */
    @SuppressWarnings("unchecked")
    public HashMap<String, Object> getRemoteInfo() throws Throwable {
        return (HashMap<String, Object>)obj.callMethod("getRemoteInfo");
    }

    //! returns a hash of the given @ref remoteconn "remote connection"
    /** @par Example:
        @code{.java}
HashMap<String, Object> h = omqclient.getRemoteInfo(conn);
        @endcode

        @param name the name of the @ref remoteconn "remote connection"

        @return a hash of the given @ref remoteconn "remote connection"; the return value corresponds to the return value of @ref ConnectionProvider::AbstractConnection::getInfo(); if the connection is invalid or unknown, an exception is thrown

        @throw REMOTE-LOAD-ERROR Missing @ref remoteconn configuration or malformed syntax
        @throw GET-REMOTE-ERROR requested connection is not defined
    */
    @SuppressWarnings("unchecked")
    public HashMap<String, Object> getRemoteInfo(String name) throws Throwable {
        return (HashMap<String, Object>)obj.callMethod("getRemoteInfo", name);
    }

    //! returns the URL for a Qorus @ref remoteconn "remote connection" from the connection name
    /** @par Example:
        @code{.java}
String url = omqclient.getRemoteUrl(conn);
        @endcode

        @param name the name of the @ref remoteconn "remote connection"

        @return the URL for the connection

        @throw REMOTE-LOAD-ERROR Missing @ref remoteconn configuration or malformed syntax
        @throw GET-REMOTE-ERROR requested connection is not defined
    */
    public String getRemoteUrl(String name) throws Throwable {
        return (String)obj.callMethod("getRemoteUrl", name);
    }

    //! returns a connection for RESTful communication with a remote Qorus server based on connection parameters parsed in the @ref remoteconn
    /**
        @param name a string key/name of the remote instance
        @param connect if @ref Qore::False "False", then the object will be created in an unconnected state

        @return a QorusSystemRestHelper instance corresponding to the remote instance

        @throw REMOTE-LOAD-ERROR Missing @ref remoteconn configuration or malformed syntax
        @throw GET-REMOTE-ERROR requested connection is not defined
    */
    public QorusSystemRestHelper getRemoteRest(String name, boolean connect) throws Throwable {
        return (QorusSystemRestHelper)obj.callMethod("getRemoteRest", name, connect);
    }

    //! returns a connection for RESTful communication with a remote Qorus server based on connection parameters parsed in the @ref remoteconn
    /**
        @param name a string key/name of the remote instance

        @return a QorusSystemRestHelper instance corresponding to the remote instance; the object will already be
        connected when returned

        @throw REMOTE-LOAD-ERROR Missing @ref remoteconn configuration or malformed syntax
        @throw GET-REMOTE-ERROR requested connection is not defined
    */
    public QorusSystemRestHelper getRemoteRest(String name) throws Throwable {
        return (QorusSystemRestHelper)obj.callMethod("getRemoteRest", name);
    }

    //! returns a hash with connection parameters for a remote Qorus server based on connection parameters parsed in the @ref remoteconn
    /**
        @param name a string key/name of the remote instance
        @param with_password if @ref True then the password is also returned

        @return a hash with connection parameters

        @throw REMOTE-LOAD-ERROR Missing @ref remoteconn configuration or malformed syntax
        @throw GET-REMOTE-ERROR requested connection is not defined
    */
    @SuppressWarnings("unchecked")
    public HashMap<String, Object> getRemoteConfig(String name, boolean with_password) throws Throwable {
        return (HashMap<String, Object>)obj.callMethod("getRemoteConfig", name, with_password);
    }

    //! returns a hash with connection parameters for a remote Qorus server based on connection parameters parsed in the @ref remoteconn
    /**
        @param name a string key/name of the remote instance

        @return a hash with connection parameters; no password info is returned with this variant

        @throw REMOTE-LOAD-ERROR Missing @ref remoteconn configuration or malformed syntax
        @throw GET-REMOTE-ERROR requested connection is not defined
    */
    @SuppressWarnings("unchecked")
    public HashMap<String, Object> getRemoteConfig(String name) throws Throwable {
        return (HashMap<String, Object>)obj.callMethod("getRemoteConfig", name);
    }

    //! returns a complete path for the configuration file given as an argument or an exception is thrown if the file does not exist
    /** @param name the config file name without any directory component
        @param opt the name of the option giving the file location (default: name + "-file")

        @return a complete path for the configuration file given as an argument

        @throw MISSING-FILE the given file cannot be located
    */
    public String getConfigFile(String name, String opt) throws Throwable {
        return (String)obj.callMethod("getConfigFile", name, opt);
    }

    //! returns a complete path for the configuration file given as an argument or an exception is thrown if the file does not exist
    /** @param name the config file name without any directory component; the option used will be
        <i>name</i><tt>-file</tt>

        @return a complete path for the configuration file given as an argument

        @throw MISSING-FILE the given file cannot be located
    */
    public String getConfigFile(String name) throws Throwable {
        return (String)obj.callMethod("getConfigFile", name);
    }

    //! returns the options from the given domain as a hash
    /** an empty hash is returned for domains not present in the options file
        @param domain the option domain to return
        @return the options from the given domain as a hash
    */
    @SuppressWarnings("unchecked")
    public HashMap<String, Object> getOptions(String domain) throws Throwable {
        return (HashMap<String, Object>)obj.callMethod("getOptions", domain);
    }

    //! returns the options from all domains as a hash of hashes
    /** the top-level hash keys are the domain names
        @return the options from all domains as a hash of hashes
    */
    @SuppressWarnings("unchecked")
    public HashMap<String, Object> getOptions() throws Throwable {
        return (HashMap<String, Object>)obj.callMethod("getOptions");
    }

    //! this method allows a datasource to be created or redefined from the text passed
    /** @par Example:
        @code{.java}
        omqclient.setDatasourceFromText("omq=driver:user/pass@db%host:port");
        @endcode

        @param line the datasource text to use to create or redefine a datasource (ex: dsname=driver:user/pass@@dbname%host:port)
    */
    public void setDatasourceFromText(String line) throws Throwable {
        obj.callMethod("setDatasourceFromText", line);
    }

    //! returns a hash of information about the given workflow based on the workflowid passed
    /** an exception is thrown if the workflowid is invalid
        @param wfid the workflowid of the workflow

        @return a hash of workflow information including "keylist": a list of valid workflow keys

        @see getWorkflowInfoName()
    */
    @SuppressWarnings("unchecked")
    public HashMap<String, Object> getWorkflowInfoID(int wfid) throws Throwable {
        return (HashMap<String, Object>)obj.callMethod("getWorkflowInfoID", wfid);
    }

    //! returns a hash of information about the given workflow based on the workflow name and version passed
    /** an exception is thrown if the workflow name and version are invalid

        @param name the name the workflow
        @param version the name the workflow

        @return a hash of workflow information including "keylist": a list of valid workflow keys

        @see QorusClientAPI::getWorkflowInfoID()
    */
    @SuppressWarnings("unchecked")
    public HashMap<String, Object> getWorkflowInfoName(String name, String version) throws Throwable {
        return (HashMap<String, Object>)obj.callMethod("getWorkflowInfoName", name, version);
    }

    // returns a hash of options originally read form the options file
    @SuppressWarnings("unchecked")
    public HashMap<String, Object> getOriginalOptionHash() throws Throwable {
        return (HashMap<String, Object>)obj.callMethod("getOriginalOptionHash");
    }

    //! creates a workflow order data instance from the workflowid and order parameters and returns the workflow_instanceid
    /** @param wfid the workflow ID of the workflow order to create
        @param ext_order_id the optional external_order_instanceid of the workflow order to create; may be null, but
        at least one of \a ext_order_id and \a sdata must be present
        @param sdata the static data for the order; may be null, but at least one of \a ext_order_id and \a sdata must
        be present
        @param ddata the dynamic data for the order; may be null
        @param orderkeys a hash giving the order keys for the order (key=value); may be null
        @param priority gives the order priority (default @ref OMQ.DefaultOrderPriority)
        @param pwfiid the loosely-coupled parent workflow instance ID

        @return a string giving the new workflow_instanceid for the workflow order created

        @throw CREATE-ORDER-ERROR missing both static data and external order instance ID arguments
    */
    public int createWorkflowInstanceID(int wfid, String ext_order_id, Map<String, Object> sdata,
        Map<String, Object> ddata, Map<String, Object> orderkeys, int priority, int pwfiid) throws Throwable {
        return Integer.parseInt((String)obj.callMethod("createWorkflowInstanceID", wfid, ext_order_id, sdata, ddata,
            orderkeys, priority, pwfiid));
    }

    //! creates a workflow order data instance from the workflowid and order parameters and returns the workflow_instanceid
    /** @param wfid the workflow ID of the workflow order to create
        @param ext_order_id the optional external_order_instanceid of the workflow order to create; may be null, but
        at least one of \a ext_order_id and \a sdata must be present
        @param sdata the static data for the order; may be null, but at least one of \a ext_order_id and \a sdata must
        be present
        @param ddata the dynamic data for the order; may be null
        @param orderkeys a hash giving the order keys for the order (key=value); may be null
        @param pwfiid the loosely-coupled parent workflow instance ID

        @return a string giving the new workflow_instanceid for the workflow order created

        @throw CREATE-ORDER-ERROR missing both static data and external order instance ID arguments
    */
    public int createWorkflowInstanceID(int wfid, String ext_order_id, Map<String, Object> sdata,
        Map<String, Object> ddata, Map<String, Object> orderkeys, int pwfiid) throws Throwable {
        return Integer.parseInt((String)obj.callMethod("createWorkflowInstanceID", wfid, ext_order_id, sdata, ddata,
            orderkeys, null, pwfiid));
    }

    //! creates a workflow order data instance from the workflowid and order parameters and returns the workflow_instanceid
    /** @param wfid the workflow ID of the workflow order to create
        @param ext_order_id the optional external_order_instanceid of the workflow order to create; may be null, but
        at least one of \a ext_order_id and \a sdata must be present
        @param sdata the static data for the order; may be null, but at least one of \a ext_order_id and \a sdata must
        be present
        @param ddata the dynamic data for the order; may be null
        @param orderkeys a hash giving the order keys for the order (key=value); may be null

        @return a string giving the new workflow_instanceid for the workflow order created

        @throw CREATE-ORDER-ERROR missing both static data and external order instance ID arguments
    */
    public int createWorkflowInstanceID(int wfid, String ext_order_id, Map<String, Object> sdata,
        Map<String, Object> ddata, Map<String, Object> orderkeys) throws Throwable {
        return Integer.parseInt((String)obj.callMethod("createWorkflowInstanceID", wfid, ext_order_id, sdata, ddata,
            orderkeys));
    }

    //! creates a workflow order data instance from the workflowid and order parameters and returns the workflow_instanceid
    /** @param wfid the workflow ID of the workflow order to create
        @param sdata the static data for the order; may be null, but at least one of \a ext_order_id and \a sdata must
        be present
        @param ddata the dynamic data for the order; may be null
        @param orderkeys a hash giving the order keys for the order (key=value); may be null

        @return a string giving the new workflow_instanceid for the workflow order created

        @throw CREATE-ORDER-ERROR missing both static data and external order instance ID arguments
    */
    public int createWorkflowInstanceID(int wfid, Map<String, Object> sdata, Map<String, Object> ddata,
        Map<String, Object> orderkeys) throws Throwable {
        return Integer.parseInt((String)obj.callMethod("createWorkflowInstanceID", wfid, null, sdata, ddata,
            orderkeys));
    }

    //! creates a workflow order data instance from the workflowid and order parameters and returns the workflow_instanceid
    /** @param wfid the workflow ID of the workflow order to create
        @param sdata the static data for the order; may be null, but at least one of \a ext_order_id and \a sdata must
        be present
        @param orderkeys a hash giving the order keys for the order (key=value); may be null

        @return a string giving the new workflow_instanceid for the workflow order created

        @throw CREATE-ORDER-ERROR missing both static data and external order instance ID arguments
    */
    public int createWorkflowInstanceID(int wfid, Map<String, Object> sdata, Map<String, Object> orderkeys)
        throws Throwable {
        return Integer.parseInt((String)obj.callMethod("createWorkflowInstanceID", wfid, null, sdata, null,
            orderkeys));
    }

    //! creates a workflow order data instance from the workflowid and order parameters and returns the workflow_instanceid
    /** @param wfid the workflow ID of the workflow order to create
        @param sdata the static data for the order; may be null, but at least one of \a ext_order_id and \a sdata must
        be present

        @return a string giving the new workflow_instanceid for the workflow order created

        @throw CREATE-ORDER-ERROR missing both static data and external order instance ID arguments
    */
    public int createWorkflowInstanceID(int wfid, Map<String, Object> sdata) throws Throwable {
        return Integer.parseInt((String)obj.callMethod("createWorkflowInstanceID", wfid, null, sdata));
    }

    //! creates a workflow order data instance from the workflow and version and order parameters and returns the workflow_instanceid
    /** @param name the name of the workflow for the order to create
        @param version the version of the workflow for the order to create
        @param ext_order_id the optional external_order_instanceid of the workflow order to create
        @param sdata the static data for the order
        @param ddata the dynamic data for the order
        @param orderkeys a hash giving the order keys for the order (key=value)
        @param priority gives the order priority (default @ref OMQ::DefaultOrderPriority)
        @param pwfiid the loosely-coupled parent workflow instance ID

        @return a string giving the new workflow_instanceid for the workflow order created

        @throw CREATE-ORDER-ERROR missing both static data and external order instance ID arguments
    */
    public int createWorkflowInstanceName(String name, String version, String ext_order_id, Map<String, Object> sdata,
        Map<String, Object> ddata, Map<String, Object> orderkeys, int priority, int pwfiid) throws Throwable {
        return Integer.parseInt((String)obj.callMethod("createWorkflowInstanceName", name, version, ext_order_id,
            sdata, ddata, orderkeys, priority, pwfiid));
    }

    //! creates a workflow order data instance from the workflow and version and order parameters and returns the workflow_instanceid
    /** @param name the name of the workflow for the order to create
        @param version the version of the workflow for the order to create
        @param ext_order_id the optional external_order_instanceid of the workflow order to create
        @param sdata the static data for the order
        @param ddata the dynamic data for the order
        @param orderkeys a hash giving the order keys for the order (key=value)
        @param pwfiid the loosely-coupled parent workflow instance ID

        @return a string giving the new workflow_instanceid for the workflow order created

        @throw CREATE-ORDER-ERROR missing both static data and external order instance ID arguments
    */
    public int createWorkflowInstanceName(String name, String version, String ext_order_id, Map<String, Object> sdata,
        Map<String, Object> ddata, Map<String, Object> orderkeys, int pwfiid) throws Throwable {
        return Integer.parseInt((String)obj.callMethod("createWorkflowInstanceName", name, version, ext_order_id,
            sdata, ddata, orderkeys, null, pwfiid));
    }

    //! creates a workflow order data instance from the workflow and version and order parameters and returns the workflow_instanceid
    /** @param name the name of the workflow for the order to create
        @param version the version of the workflow for the order to create
        @param ext_order_id the optional external_order_instanceid of the workflow order to create
        @param sdata the static data for the order
        @param ddata the dynamic data for the order
        @param orderkeys a hash giving the order keys for the order (key=value)

        @return a string giving the new workflow_instanceid for the workflow order created

        @throw CREATE-ORDER-ERROR missing both static data and external order instance ID arguments
    */
    public int createWorkflowInstanceName(String name, String version, String ext_order_id, Map<String, Object> sdata,
        Map<String, Object> ddata, Map<String, Object> orderkeys) throws Throwable {
        return Integer.parseInt((String)obj.callMethod("createWorkflowInstanceName", name, version, ext_order_id,
            sdata, ddata, orderkeys));
    }

    //! creates a workflow order data instance from the workflow and version and order parameters and returns the workflow_instanceid
    /** @param name the name of the workflow for the order to create
        @param version the version of the workflow for the order to create
        @param sdata the static data for the order
        @param ddata the dynamic data for the order
        @param orderkeys a hash giving the order keys for the order (key=value)

        @return a string giving the new workflow_instanceid for the workflow order created

        @throw CREATE-ORDER-ERROR missing both static data and external order instance ID arguments
    */
    public int createWorkflowInstanceName(String name, String version, Map<String, Object> sdata,
        Map<String, Object> ddata, Map<String, Object> orderkeys) throws Throwable {
        return Integer.parseInt((String)obj.callMethod("createWorkflowInstanceName", name, version, null,
            sdata, ddata, orderkeys));
    }

    //! creates a workflow order data instance from the workflow and version and order parameters and returns the workflow_instanceid
    /** @param name the name of the workflow for the order to create
        @param version the version of the workflow for the order to create
        @param sdata the static data for the order
        @param orderkeys a hash giving the order keys for the order (key=value)

        @return a string giving the new workflow_instanceid for the workflow order created

        @throw CREATE-ORDER-ERROR missing both static data and external order instance ID arguments
    */
    public int createWorkflowInstanceName(String name, String version, Map<String, Object> sdata,
        Map<String, Object> orderkeys) throws Throwable {
        return Integer.parseInt((String)obj.callMethod("createWorkflowInstanceName", name, version, null,
            sdata, null, orderkeys));
    }

    //! creates a workflow order data instance from the workflow and version and order parameters and returns the workflow_instanceid
    /** @param name the name of the workflow for the order to create
        @param version the version of the workflow for the order to create
        @param sdata the static data for the order

        @return a string giving the new workflow_instanceid for the workflow order created

        @throw CREATE-ORDER-ERROR missing both static data and external order instance ID arguments
    */
    public int createWorkflowInstanceName(String name, String version, Map<String, Object> sdata) throws Throwable {
        return Integer.parseInt((String)obj.callMethod("createWorkflowInstanceName", name, version, null, sdata));
    }

    //! parses the given file as a Qorus option file and returns a hash
    /** returns a hash of the option information, keyed by "domain" (i.e. qorus, qorus-client); the return hash only
        has the option data that is set in the file; no options are derived or automatically set by this method

        @param fn the file name of the options file to parse

        @return a hash of the options keyed by "domain" (i.e. qorus, qorus-client)
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> parseOptionsFile(String fn) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("QorusClientAPI", "parseOptionsFile", fn);
    }

    //! parses a datasource string and returns the hash
    /** an exception will be thrown if no driver name is given
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> parseDatasource(String str) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("QorusClientAPI", "parse_ds", str);
    }
}
