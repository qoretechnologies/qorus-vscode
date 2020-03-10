/** Qorus Java Common User API
 *
 */

package com.qoretechnologies.qorus;

// java imports
import java.util.HashMap;
import java.time.ZonedDateTime;

// jni module imports
import org.qore.jni.QoreJavaApi;
import org.qore.jni.QoreObject;

// Qorus imports
import com.qoretechnologies.qorus.OMQ;

// Qore imports
import org.qore.lang.AbstractDatasource;
import org.qore.lang.DatasourcePool;
import org.qore.lang.sqlutil.AbstractTable;
import org.qore.lang.mapper.Mapper;
import org.qore.lang.tablemapper.InboundTableMapper;
import org.qore.lang.tablemapper.InboundIdentityTableMapper;
import org.qore.lang.tablemapper.AbstractSqlStatementOutboundMapper;
import org.qore.lang.tablemapper.SqlStatementOutboundMapper;
import org.qore.lang.tablemapper.RawSqlStatementOutboundMapper;
import org.qore.lang.dataprovider.AbstractDataProvider;
import org.qore.lang.dataprovider.AbstractDataProviderType;
import org.qore.lang.HTTPClient;
import org.qore.lang.restclient.RestClient;
import org.qore.lang.smtpclient.SmtpClient;
import org.qore.lang.soapclient.SoapClient;

//! main interface API class for the Java Qorus API
public class UserApi extends OMQ {
    //! creates a user audit event (with audit event code @ref OMQ.AE_USER_EVENT) against the workflow, service, or job instance
    /** @param user_event the user event code string
        @param info1 optional informational string for the \c AUDIT_EVENTS.INFO1 field
        @param info2 optional informational string for the \c AUDIT_EVENTS.INFO2 field
        @return null if user event auditing is not enabled (see system option @ref audit), or the integer audit event id

        @note nothing will be written to the \c AUDIT_EVENTS table if the @ref audit system option does not include the \c "user-events" (@ref OMQ.AO_USER_EVENTS) option; in case this is not set, the call will have no effect

        @see
        - @ref OMQ::UserApi::UserApi::auditUserEvent() "UserApi::auditUserEvent()"
        - @ref audit_user_event()
    */
    static public Integer auditUserEvent(String user_event, String info1, String info2) throws Throwable {
        return (Integer)QoreJavaApi.callStaticMethod("UserApi", "auditUserEvent", user_event, info1, info2);
    }

    //! creates a user audit event (with audit event code @ref OMQ.AE_USER_EVENT) against the workflow, service, or job instance
    /** @param user_event the user event code string
        @param info1 optional informational string for the \c AUDIT_EVENTS.INFO1 field
        @return null if user event auditing is not enabled (see system option @ref audit), or the integer audit event id

        @note nothing will be written to the \c AUDIT_EVENTS table if the @ref audit system option does not include the \c "user-events" (@ref OMQ.AO_USER_EVENTS) option; in case this is not set, the call will have no effect

        @see
        - @ref OMQ::UserApi::UserApi::auditUserEvent() "UserApi::auditUserEvent()"
        - @ref audit_user_event()
    */
    static public Integer auditUserEvent(String user_event, String info1) throws Throwable {
        return (Integer)QoreJavaApi.callStaticMethod("UserApi", "auditUserEvent", user_event, info1);
    }

    //! creates a user audit event (with audit event code @ref OMQ.AE_USER_EVENT) against the workflow, service, or job instance
    /** @param user_event the user event code string
        @return null if user event auditing is not enabled (see system option @ref audit), or the integer audit event id

        @note nothing will be written to the \c AUDIT_EVENTS table if the @ref audit system option does not include the \c "user-events" (@ref OMQ.AO_USER_EVENTS) option; in case this is not set, the call will have no effect

        @see
        - @ref OMQ::UserApi::UserApi::auditUserEvent() "UserApi::auditUserEvent()"
        - @ref audit_user_event()
    */
    static public Integer auditUserEvent(String user_event) throws Throwable {
        return (Integer)QoreJavaApi.callStaticMethod("UserApi", "auditUserEvent", user_event);
    }

    //! checks if the given audit event (given as a string) is enabled
    /** @param opt the audit event code to check; see @ref JavaAuditEventStrings for possible values
        @return true if the event is audited, false if not

        @throw AUDIT-EVENT-ERROR the given audit event string does not exist

        @see
        - @ref OMQ::UserApi::UserApi::auditCheckEventString() "UserApi::auditCheckEventString()"
        - @ref audit_check_event_string()
    */
    static public boolean auditCheckEventString(String opt) throws Throwable {
        return (boolean)QoreJavaApi.callStaticMethod("UserApi", "auditCheckEventString", opt);
    }

    //! checks if the given audit event (given as an integer code) is enabled
    /** @param opt the audit event code to check; see @ref JavaAuditEventCodes for possible values
        @return true if the event is audited, false if not

        @see
        - @ref OMQ::UserApi::UserApi::auditCheckEvent() "UserApi::auditCheckEvent()"
        - @ref audit_check_event()
    */
    static public boolean auditCheckEvent(int opt) throws Throwable {
        return (boolean)QoreJavaApi.callStaticMethod("UserApi", "auditCheckEvent", opt);
    }

    //! returns the audit event mask
    /** @return the audit event mask

        @see
        - @ref OMQ::UserApi::UserApi::auditGetMask() "UserApi::auditGetMask()"
        - @ref audit_get_mask()
    */
    static public int auditGetMask() throws Throwable {
        return (int)QoreJavaApi.callStaticMethod("UserApi", "auditGetMask");
    }

    //! posts an application event of class @ref OMQ.QE_CLASS_USER
    /** @param severity see @ref ErrorSeverityCodes for possible values
        @param info the user-defined information for the event

        @throw POST-USER-EVENT-ERROR invalid severity value

        @see
        - @ref OMQ::UserApi::UserApi::postUserEvent() "UserApi::postUserEvent()"
        - @ref post_user_event()
    */
    static public int postUserEvent(String severity, Object info) throws Throwable {
        return (int)QoreJavaApi.callStaticMethod("UserApi", "postUserEvent", severity, info);
    }

    //! returns Qorus runtime properties as a hash
    /** @return Qorus runtime properties as a hash; if no properties are set, returns an empty hash

        @see
        - @ref OMQ::UserApi::UserApi::runtimeProperties() "UserApi::runtimeProperties()"
        - @ref runtime_properties()
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> runtimeProperties() throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("UserApi", "runtimeProperties");
    }

    //! calls a system @ref rpcapi "RPC API" and returns the result; the API is called with system permissions (no restrictions)
    /** include any arguments after the method name, ex:
        @code{.java}
        callNetworkApi("omq.system.exec-synchronous-existing", hash);
        @endcode

        @param call the full @ref rpcapi "RPC API" method name (ex: \c "omq.system.exec-synchronous-exiting"); see @ref qorusapi for a full list
        @param args the arguments to the call

        @return the return value of the method

        @throw UNKNOWN-API-CALL invalid API method
        @throw INVALID-INTERNAL-API-CALL API may not be called internally (ex: omq.system.shutdown-wait())

        @see
        - @ref OMQ::UserApi::UserApi::callNetworkApi() "UserApi::callNetworkApi()"
        - @ref call_network_api()
        - @ref callNetworkApiArgsWithAuthentication() to call with the permissions as a specific user
        - @ref callNetworkApiArgs()
        - @ref callRestApi()
        - @ref callRestApiWithAuthentication()
    */
    static public Object callNetworkApi(String call, Object... args) throws Throwable {
        return QoreJavaApi.callStaticMethod("UserApi", "callNetworkApiArgs", call, args);
    }

    //! calls a system @ref rpcapi "RPC API" with the argument list to the API method as a top-level argument to this function; the API is called with system permissions (no restrictions)
    /** @param call the full @ref rpcapi "RPC API" method name (ex: \c "omq.system.exec-synchronous-exiting"); see @ref qorusapi for a full list
        @param args any arguments to the method; if multiple argument should be passed to the method, use a list of arguments here

        @return the return value of the method

        @throw UNKNOWN-API-CALL invalid API method
        @throw INVALID-INTERNAL-API-CALL API may not be called internally (ex: omq.system.shutdown-wait())

        @see
        - @ref OMQ::UserApi::UserApi::callNetworkApiArgs() "UserApi::callNetworkApiArgs()"
        - @ref call_network_api_args()
        - @ref callNetworkApiArgsWithAuthentication() to call with the permissions as a specific user
        - @ref callNetworkApi()
        - @ref callRestApi()
        - @ref callRestApiWithAuthentication()
    */
    static public Object callNetworkApiArgs(String call, Object[] args) throws Throwable {
        return QoreJavaApi.callStaticMethod("UserApi", "callNetworkApiArgs", call, args);
    }

    //! calls a system @ref rpcapi "RPC API" with authentication information (username and password)
    /** @param user the username to use for the call
        @param pass the password to use for the call
        @param call the full @ref rpcapi "RPC API" method name (ex: \c "omq.system.exec-synchronous-exiting"); see @ref qorusapi for a full list
        @param args any arguments to the method; if multiple argument should be passed to the method, use a list of arguments here

        @return the return value of the method

        @throw UNKNOWN-API-CALL invalid API method
        @throw INVALID-INTERNAL-API-CALL API may not be called internally (ex: omq.system.shutdown-wait())

        @see
        - @ref OMQ::UserApi::UserApi::callNetworkApiArgsWithAuthentication() "UserApi::callNetworkApiArgsWithAuthentication()"
        - @ref call_network_api_args_with_authentication()
        - @ref callNetworkApiArgs()
        - @ref callNetworkApi()
        - @ref callRestApi()
        - @ref callRestApiWithAuthentication()
    */
    static public Object callNetworkApiArgsWithAuthentication(String user, String pass, String call, Object[] args) throws Throwable {
        return QoreJavaApi.callStaticMethod("UserApi", "callNetworkApiArgsWithAuthentication", user, pass, call, args);
    }

    //! calls a system @ref restapi "REST API" method and returns the result; the API is called with system permissions (no restrictions)
    /** @par Example:
        @code{.java}
        int pid = (int)UserApi.callRestApi("GET", "system/pid");
        @endcode

        @param method the HTTP method name
        @param path the URI path without the leading \c "api"; if it does not begin with \c "latest" or \c "v//" (for a REST API version), then \c "/latest/" is prepended ot the path, meaning that the latest version of the REST API will be used
        @param body_args the arguments to the call

        @return the return value of the method

        @note to use a specific REST API version, make sure \c path begins with \c "/api"

        @see
        - @ref OMQ::UserApi::UserApi::callRestApi() "UserApi::callRestApi()"
        - call_rest_api()
        - @ref callRestApiWithAuthentication() to call with the permissions as a specific user
        - @ref RestHandler::RestHandler::handleExternalRequest() "RestHandler::handleExternalRequest()" for information about possible exceptions
    */
    static public Object callRestApi(String method, String path, HashMap<String, Object> body_args) throws Throwable {
        return QoreJavaApi.callStaticMethod("UserApi", "callRestApi", method, path, body_args);
    }

    //! calls a system @ref restapi "REST API" method and returns the result; the API is called with system permissions (no restrictions)
    /** @par Example:
        @code{.java}
        int pid = (int)UserApi.callRestApi("GET", "system/pid");
        @endcode

        @param method the HTTP method name
        @param path the URI path without the leading \c "api"; if it does not begin with \c "latest" or \c "v//" (for a REST API version), then \c "/latest/" is prepended ot the path, meaning that the latest version of the REST API will be used

        @return the return value of the method

        @note to use a specific REST API version, make sure \c path begins with \c "/api"

        @see
        - @ref OMQ::UserApi::UserApi::callRestApi() "UserApi::callRestApi()"
        - call_rest_api()
        - @ref callRestApiWithAuthentication() to call with the permissions as a specific user
        - @ref RestHandler::RestHandler::handleExternalRequest() "RestHandler::handleExternalRequest()" for information about possible exceptions
    */
    static public Object callRestApi(String method, String path) throws Throwable {
        return QoreJavaApi.callStaticMethod("UserApi", "callRestApi", method, path);
    }

    //! calls a system @ref restapi "REST API" method with authentication information (username and password) and returns the result
    /** @par Example:
        @code{.java}
        int pid = callRestApiWithAuthentication(user, pass, "PUT", "system?action=shutdown");
        @endcode

        @param user the username to use for the call
        @param pass the password to use for the call
        @param method the HTTP method name
        @param path the URI path without the leading \c "api"; if it does not begin with \c "latest" or \c "v//" (for a REST API version), then \c "/latest/" is prepended ot the path, meaning that the latest version of the REST API will be used
        @param body_args the arguments to the call

        @return the return value of the method

        @note to use a specific REST API version, make sure \c path begins with \c "/api"

        @see
        - @ref OMQ::UserApi::UserApi::callRestApiWithAuthentication() "UserApi::callRestApiWithAuthentication()"
        - call_rest_api_with_authentication()
        - @ref RestHandler::RestHandler::handleExternalRequest() "RestHandler::handleExternalRequest()" for information about possible exceptions
    */
    static public Object callRestApiWithAuthentication(String user, String pass, String method, String path, HashMap<String, Object> body_args) throws Throwable {
        return QoreJavaApi.callStaticMethod("UserApi", "callRestApiWithAuthentication", user, pass, method, path, body_args);
    }

    //! get a cached table object (suitable for DML) if present, otherwise it creates one from scratch
    /** @par Example:
        @code{.java}
org.qore.lang.sqlutil.AbstractTable t = UserApi.getSqlTable("pgsql:user/password@db", "my_table");
try {
    // use the table object
} finally {
    t.release();
}
        @endcode

        @param datasource a @ref dsconn "Qorus datasource" name
        @param table_name the name of the table to be acquired; the handling of this parameter is identical to that in @ref SqlUtil::Table::constructor(); names are converted to lower-case before performing the lookup and storage in the cache to ensure that the cache is based on case-insensitive lookups

        @return an @ref org.qore.lang.sqlutil.AbstractTable "AbstractTable" object corresponding to the parameters

        @throw INVALID-DATASOURCE this exception is thrown if the \a datasource argument cannot be matched to a known @ref dsconn "datasource"

        @note
        - other exceptions can be thrown when acquiring the table, for example if the given table is not accessible or if there are technical errors communicating with the database server, etc
        - you need to call clear_sql_table_cache() any time the table structure has changed

        @see
        - @ref OMQ::UserApi::UserApi::getSqlTable() "UserApi::getSqlTable()"
        - @ref get_sql_table()
        - @ref sql-cache
    **/
    static public AbstractTable getSqlTable(String datasource, String table_name) throws Throwable {
        return new AbstractTable((QoreObject)QoreJavaApi.callStaticMethodSave("UserApi", "getSqlTable", datasource, table_name));
    }

    //! get a cached table object (suitable for DML) if present, otherwise it creates one from scratch
    /** @par Example:
        @code{.java}
org.qore.lang.sqlutil.AbstractTable t = UserApi.getSqlTable(datasource_pool, "my_table");
try {
    // use the table object
} finally {
    t.release();
}
        @endcode

        @param datasource a @ref org.qore.lang.DatasourcePool "DatasourcePool" object for a @ref dsconn "Qorus datasource"; note that if the @ref org.qore.lang.DatasourcePool "DatasourcePool" object cannot be matched back to a known @ref dsconn "Qorus datasource", an \c INVALID-DATASOURCE exception will be thrown
        @param table_name the name of the table to be acquired; the handling of this parameter is identical to that in @ref SqlUtil::Table::constructor(); names are converted to lower-case before performing the lookup and storage in the cache to ensure that the cache is based on case-insensitive lookups

        @return an @ref org.qore.lang.sqlutil.AbstractTable "AbstractTable" object corresponding to the parameters

        @throw INVALID-DATASOURCE this exception is thrown if the \a datasource argument cannot be matched to a known @ref dsconn "Qorus datasource"

        @note
        - \c INVALID-DATASOURCE exceptions can be thrown with a valid Qorus datasource if the given @ref dsconn "datasource" has been reset since it was acquired
        - other exceptions can be thrown when acquiring the table, for example if the given table is not accessible or if there are technical errors communicating with the database server, etc
        - you need to call clearSqlTableCache() any time the table structure has changed

        @see
        - @ref OMQ::UserApi::UserApi::getSqlTable() "UserApi::getSqlTable()"
        - @ref get_sql_table()
        - @ref sql-cache
    **/
    static public AbstractTable getSqlTable(AbstractDatasource datasource, String table_name) throws Throwable {
        return new AbstractTable((QoreObject)QoreJavaApi.callStaticMethodSave("UserApi", "getSqlTable", datasource.getQoreObject(), table_name));
    }

    //! get information about cached object
    /** @return hash the whole sql cache

        Resulting hash (keys are @ref dsconn "datasource" names) of hashes (keys are cache types) of hashes (keys are names of individual cached objects) provides the information about given cached objects as a value. This information has the form of hash with the following keys:

        - count - how many times it was used
        - created - datetime of the first call (when the cache was created)
        - object - stored object that is cached

        @par Example:
        @code{.java}
HashMap<String, Object> cache = UserApi.getSqlCacheInfo();
HashMap<String, Object> cache_for_my_datasource = (HashMap<String, Object>)cache.get("my_datasource");
HashMap<String, Object> table_cache_for_my_datasource = (HashMap<String, Object>)cache_for_my_datasource.get("tables");
boolean is_mytable_cached = table_cache_for_my_datasource.containsKey("my_table");
ZonedDateTime date_when_mytable_was_cached = (ZonedDateTime)((HashMap<String, Object>)table_cache_for_my_datasource.get("my_table")).get("created");
        @endcode

        @see
        - @ref OMQ::UserApi::UserApi::getSqlCacheInfo() "UserApi::getSqlCacheInfo()"
        - @ref sql-cache
        - @ref get_sql_cache_info()
    **/
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getSqlCacheInfo() throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("UserApi", "getSqlCacheInfo");
    }

    //! clears the entry for the given @ref dsconn "datasource" and table from the @ref sql-cache "SQL cache" (for example, if database objects have been updated in the dataserver)
    /** @param datasource the name of a Qorus @ref dsconn "datasource"
        @param table_name the table name to clear

        @par Example:
        @code{.java}
        UserApi.clearSqlTableCache("omquser", "table");
        @endcode

        See
        - @ref OMQ::UserApi::UserApi::clearSqlTableCache() "UserApi::clearSqlTableCache()"
        - @ref sql-cache
        - @ref clear_sql_table_cache()
    **/
    static public void clearSqlTableCache(String datasource, String table_name) throws Throwable {
        QoreJavaApi.callStaticMethod("UserApi", "clearSqlTableCache", datasource, table_name);
    }

    //! clears all objects for given @ref dsconn "datasource" from the @ref sql-cache "SQL cache" (for example, if database objects have been updated in the dataserver)
    /** @param datasource the name of a Qorus @ref dsconn "datasource"

        @par Example:
        @code{.java}
        UserApi.clearSqlTableCache("omquser");
        @endcode

        @see
        - @ref OMQ::UserApi::UserApi::clearSqlTableCache() "UserApi::clearSqlTableCache()"
        - @ref sql-cache
        - @ref clear_sql_table_cache()
    **/
    static public void clearSqlTableCache(String datasource) throws Throwable {
        QoreJavaApi.callStaticMethod("UserApi", "clearSqlTableCache", datasource);
    }

    //! Gets a lookup value from the value map by a key; the value map must be registered to the current interface
    /** @param mapname name of the value map
        @param key a key name

        @return the value assigned to the key

        @throw VALUE-MAP-ERROR the given value map is unknown or not registered to the current interface

        @see
        - @ref OMQ::UserApi::UserApi::getValueMap() "UserApi::getValueMap()"
        - @ref value-maps
        - @ref valuemap-devel
        - @ref get_value_map()
     */
    static public Object getValueMap(String mapname, String key) throws Throwable {
        return QoreJavaApi.callStaticMethod("UserApi", "getValueMap", mapname, key);
    }

    //! Gets all value maps valid for the current interface
    /** @return a list of hashes describing available value maps; keys are value map names; values are hashes with the following keys:
        - \c "id": the internal ID of the value map
        - \c "name": the name of the value map
        - \c "description": a string describing the value map
        - \c "author": the author tag
        - \c "throws_exception": a tag that controls the behavior when an unknown mapping is referenced (@ref value-map-exceptions)
        - \c "valuetype": the type of values in the map
        - \c "created": the created time stamp
        - \c "modified": the last modified time stamp

        @see
        - @ref OMQ::UserApi::UserApi::getValueMaps() "UserApi::getValueMaps()"
        - @ref value-maps
        - @ref valuemap-devel
        - @ref get_value_map()
     */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object>[] getValueMaps() throws Throwable {
        return (HashMap<String, Object>[])QoreJavaApi.callStaticMethod("UserApi", "getValueMaps");
    }

    //! posts a successful SLA event for SLA monitoring and performance tracking
    /** @par Example:
        @code{.java}
        UserApi.postSlaEventSuccess(sla, value);
        @endcode

        @param sla the SLA name
        @param value the SLA performance value

        @return true if the event was posted, false if not (because the SLA does not exist)

        @see
        - @ref OMQ::UserApi::UserApi::postSlaEventSuccess() "UserApi::postSlaEventSuccess()"
        - @ref post_sla_event_success()
    */
    static public boolean postSlaEventSuccess(String sla, float value) throws Throwable {
        return (boolean)QoreJavaApi.callStaticMethod("UserApi", "postSlaEventSuccess", sla, value);
    }

    //! posts an unsuccessful SLA event for SLA monitoring and performance tracking
    /** @par Example:
        @code{.java}
        UserApi.postSlaEventError(sla, value, err, desc);
        @endcode

        @param sla the SLA name
        @param value the SLA performance value
        @param err the error code for the SLA event error
        @param desc the error description for the SLA event error

        @return true if the event was posted, false if not (because the SLA does not exist)

        @see
        - @ref OMQ::UserApi::UserApi::postSlaEventError() "UserApi::postSlaEventError()"
        - @ref post_sla_event_error()
    */
    static public boolean postSlaEventError(String sla, float value, String err, String desc) throws Throwable {
        return (boolean)QoreJavaApi.callStaticMethod("UserApi", "postSlaEventError", sla, value, err, desc);
    }

    //! flushes all pending SLA events to disk and returns after the data has been committed
    /** @par Example:
        @code{.java}
        UserApi.flushSlaEvents();
        @endcode

        @see
        - @ref OMQ::UserApi::UserApi::flushSlaEvents() "UserApi::flushSlaEvents()"
        - @ref flush_sla_events()
    */
    static public void flushSlaEvents() throws Throwable {
        QoreJavaApi.callStaticMethod("UserApi", "flushSlaEvents");
    }

    //! returns information about the given system service (if it's currently loaded)
    /** @param name the name of the system service to query
        @return a hash of user information or null if the service is not loaded; the hash will have the following structure:
        - \c type: \c "system"
        - \c name: the name of the service
        - \c version: version of the service
        - \c desc: description of the service
        - \c serviceid: service ID
        - \c status: @ref OMQ.SSRunning or @ref OMQ.SSLoaded
        - \c threads: number of running threads in the service
        - \c autostart: true of false if the autostart flag is set
        - \c loaded: date/time the service was loaded
        - \c methods: list of hashes for each method with \c name and \c desc keys

        @note prior to Qorus 3.0.2 this function was known as getSystemServiceInfo(), and is still imported with this old camel-case name for backwards compatibility

        @see
        - @ref OMQ::UserApi::UserApi::getSystemServiceInfo() "UserApi::getSystemServiceInfo()"
        - @ref get_system_service_info()
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getSystemServiceInfo(String name) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("UserApi", "getSystemServiceInfo", name);
    }

    //! returns information about the given service (if it's currently loaded)
    /**
        @param type the type of service (either \c "system" or \c "user"; case is ignored)
        @param name the name of the system service to query

        @return a hash of service information or null if the service is not loaded; the hash will have the following structure:
        - \c type: either \c "system" or \c "user" corresponding to the argument
        - \c name: the name of the service
        - \c version: version of the service
        - \c patch: the patch string for the service
        - \c desc: description of the service
        - \c author: the author of the service
        - \c serviceid: service ID
        - \c parse_options: parse options for the service
        - \c status: @ref OMQ.SSRunning or @ref OMQ.SSLoaded
        - \c log: path to the service log file
        - \c active_calls: number of active service calls and persistent connection handlers currently in progress
        - \c waiting_threads: number of threads waiting on the service (for a service reset or unload action)
        - \c threads: number of running threads in the service
        - \c autostart: true of false if the autostart flag is set
        - \c manual_autostart: true of false the autostart value has been manually set
        - \c loaded: date/time the service was loaded
        - \c methods: list of hashes for each method with \c name and \c desc keys
        - \c resources: list of service resources
        - \c resource_files: list of service file resources
        - \c options: service options
        - \c groups: interface groups that the service belongs to
        - \c alerts: any alerts raised against the service

        @see
        - @ref OMQ::UserApi::UserApi::getServiceInfo() "UserApi::getServiceInfo()"
        - @ref get_service_info()
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getServiceInfo(String type, String name) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("UserApi", "getServiceInfo", type, name);
    }

    //! returns a list of hashes giving information about the currently-running workflow execution instances
    /** @param name workflow name for filtering the result list
        @param ver workflow version for filtering the result list (only used if \a name also passed)

        @return a list of hashes giving information about the currently-running workflow execution instances; if no matching workflow execution instances are running, then an empty list is returned; otherwise each list element is a hash with the following keys:
        - \c executionID: the workflow execution instance id
        - \c name: the name of the workflow
        - \c version: version of the workflow
        - \c workflowid: the workflowid of the workflow
        - \c mode: @ref OMQ.WM_Normal or @ref OMQ.WM_Recovery
        - \c sync: true if the execution instance is synchronous, false if not
        - \c iterations: number of segment iterations performed so far
        - \c totalSegments: number of segments executed
        - \c errors: total number of errors encountered
        - \c warnings: total number of warnings raised
        - \c starttime: date/time the execution instance was started
        - \c options: options set on the workflow execution instance
        - \c logfile: log file name
        - \c remote: true if the workflow is running as a remote @ref qwf "qwf" process, false if not

        @note prior to Qorus 3.0.2 this function was known as getRunningWorkflowList(), and is still imported with this old camel-case name for backwards compatibility

        @see
        - @ref OMQ::UserApi::UserApi::getRunningWorkflowList() "UserApi::getRunningWorkflowList()"
        - @ref get_running_workflow_list()
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object>[] getRunningWorkflowList(String name, String ver) throws Throwable {
        return (HashMap<String, Object>[])QoreJavaApi.callStaticMethod("UserApi", "getRunningWorkflowList", name, ver);
    }

    //! returns a list of hashes giving information about the currently-running workflow execution instances
    /** @param name workflow name for filtering the result list

        @return a list of hashes giving information about the currently-running workflow execution instances; if no matching workflow execution instances are running, then an empty list is returned; otherwise each list element is a hash with the following keys:
        - \c executionID: the workflow execution instance id
        - \c name: the name of the workflow
        - \c version: version of the workflow
        - \c workflowid: the workflowid of the workflow
        - \c mode: @ref OMQ.WM_Normal or @ref OMQ.WM_Recovery
        - \c sync: true if the execution instance is synchronous, false if not
        - \c iterations: number of segment iterations performed so far
        - \c totalSegments: number of segments executed
        - \c errors: total number of errors encountered
        - \c warnings: total number of warnings raised
        - \c starttime: date/time the execution instance was started
        - \c options: options set on the workflow execution instance
        - \c logfile: log file name
        - \c remote: true if the workflow is running as a remote @ref qwf "qwf" process, false if not

        @note prior to Qorus 3.0.2 this function was known as getRunningWorkflowList(), and is still imported with this old camel-case name for backwards compatibility

        @see
        - @ref OMQ::UserApi::UserApi::getRunningWorkflowList() "UserApi::getRunningWorkflowList()"
        - @ref get_running_workflow_list()
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object>[] getRunningWorkflowList(String name) throws Throwable {
        return (HashMap<String, Object>[])QoreJavaApi.callStaticMethod("UserApi", "getRunningWorkflowList", name);
    }

    //! returns a list of hashes giving information about the currently-running workflow execution instances
    /** @return a list of hashes giving information about the currently-running workflow execution instances; if no matching workflow execution instances are running, then an empty list is returned; otherwise each list element is a hash with the following keys:
        - \c executionID: the workflow execution instance id
        - \c name: the name of the workflow
        - \c version: version of the workflow
        - \c workflowid: the workflowid of the workflow
        - \c mode: @ref OMQ.WM_Normal or @ref OMQ.WM_Recovery
        - \c sync: true if the execution instance is synchronous, false if not
        - \c iterations: number of segment iterations performed so far
        - \c totalSegments: number of segments executed
        - \c errors: total number of errors encountered
        - \c warnings: total number of warnings raised
        - \c starttime: date/time the execution instance was started
        - \c options: options set on the workflow execution instance
        - \c logfile: log file name
        - \c remote: true if the workflow is running as a remote @ref qwf "qwf" process, false if not

        @note prior to Qorus 3.0.2 this function was known as getRunningWorkflowList(), and is still imported with this old camel-case name for backwards compatibility

        @see
        - @ref OMQ::UserApi::UserApi::getRunningWorkflowList() "UserApi::getRunningWorkflowList()"
        - @ref get_running_workflow_list()
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object>[] getRunningWorkflowList() throws Throwable {
        return (HashMap<String, Object>[])QoreJavaApi.callStaticMethod("UserApi", "getRunningWorkflowList");
    }

    //! returns a hash of the workflow execution instance info if the ID is valid or an empty hash if not
    /** returns an empty hash if the workflow execution ID is not currently valid
        @param id workflow execution instance id

        @return a hash of the workflow execution instance info if the ID is valid or an empty hash if not; if valid, the hash will have the following keys:
        - \c name: the name of the workflow
        - \c version: version of the workflow
        - \c workflowid: the workflowid of the workflow
        - \c executionID: the workflow execution instance id (same as the argument)
        - \c mode: @ref OMQ.WM_Normal or @ref OMQ.WM_Recovery
        - \c sync: true if the execution instance is synchronous, false if not
        - \c iterations: number of segment iterations performed so far
        - \c totalSegments: number of segments executed
        - \c errors: total number of errors encountered
        - \c warnings: total number of warnings raised
        - \c starttime: date/time the execution instance was started
        - \c options: options set on the workflow execution instance
        - \c logfile: log file name
        - \c remote: true if the workflow is running as a remote @ref qwf "qwf" process, false if not

        @note prior to Qorus 3.0.2 this function was known as getRunningWorkflowInfo(), and is still imported with this old camel-case name for backwards compatibility

        @see
        - @ref OMQ::UserApi::UserApi::getRunningWorkflowInfo() "UserApi::getRunningWorkflowInfo()"
        - @ref get_running_workflow_info()
        - @ref get_running_workflow_list()
        */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getRunningWorkflowInfo(int id) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("UserApi", "getRunningWorkflowInfo", id);
    }

    //! creates a workflow order data instance in the database with status @ref OMQ.StatReady "READY"
    /** Creates a workflow order data instance of the specified type with the data passed.

        To ensure that a given workflow order is only created once for a given unique key value, make sure
        your workflow defines @ref keylist "order keys", and use one of the following options to guarantee
        uniqueness of the order:
        - \c global_unique_key
        - \c workflow_specific_unique_key
        - \c workflow_unique_key

        @param name the name of the workflow
        @param version the version of the workflow; if this parameter is not passed, then the latest version of the workflow
        (determined by the latest created date for the workflow_instance entry) will be used
        @param params The hash passed must have at either a \c staticdata key or an \c external_order_instanceid key, valid keys:
        - \c dynamicdata: (optional hash) the initial @ref dynamicdata "dynamic data" for the order
        - \c external_order_instanceid: (optional/required string) the external order instance ID for the workflow data; one
          of \c staticdata or \c external_order_instanceid must be provided
        - \c global_unique_key: (optional hash) a hash giving one or more unique @ref keylist "order keys" for the order
          (across all workflows regardless of workflowid, name, or version); keys are order key names and values are the
          string key values; if this key already exists for any order in the system, then the order creation will fail with a
          \c DUPLICATE-ORDER-KEY error; the hash key must be a valid order key, and the value is the unique key value;
          this value will also be created as an order key
        - \c orderkeys: (optional hash) a hash of @ref keylist "order keys" for the order
        - \c parent_workflow_instanceid: (optional int) a loosely-coupled workflow that will be marked as the parent of this
          workflow; if this key is not set, and this function is called from workflow code (even indirectly, by calling a
          service method that calls this function in the same thread as the call from workflow code), the new order will be
          loosely-coupled with the calling workflow order as the parent; to keep this from happening, set the value of this
          key to false
        - \c priority: the order priority (optional int, default @ref OMQ.DefaultOrderPriority) from 0 - 999; priority 0 is the
          highest; 999 is the lowest
        - \c scheduled: (optional date) the earliest date and time the order can be processed; if this date is given as a
          future date/time value and a @ref OMQ.StatReady status is given, then the initial status of the workflow order data
          instance will be automatically changed to @ref OMQ.StatScheduled instead of @ref OMQ.StatReady
        - \c sensitive_data: (optional hash) a hash of sensitive data information for the workflow; this key can only be used
          when submitting the data over a secure (encrypted) connection; the keys are sensitive data key types, values are
          hashes keyed by sensitive data values, and the hash values have the following keys:
            - \c aliases: (optional list of strings) zero or more string aliases for the sensitive data
            - \c data: (required hash) the sensitive data hash itself
            - \c meta: (optional hash) a hash of metadata for the sensitive data with the following recommended keys
              (recommended keys are not enforced by the API itself):
                - \c PURPOSE: free-form information about the purpose of the sensitive data
                - \c CATEGORIES: free-form information about the categories of sensitive data
                - \c RECIPIENTS: free-form information about the recipients or recipient catories of sensitive data
                - \c STORAGE: free-form information about the storage time or rules for sensitive data
        - \c staticdata: (optional/required hash) the initial @ref staticdata "data" for the order; one of
          \c staticdata or \c external_order_instanceid must be provided
        - \c tempdata: (optional hash) the initial @ref tempdata "temporary data" for the order
        - \c workflow_specific_unique_key: (optional hash) a hash giving one or more unique @ref keylist "order keys" for
          the particular workflowid (which matches a unique name and workflow version); keys are order key names and values
          are the string key values; if any of the keys given already exists for an order with the target workflowid, then
          the order creation will fail with a \c DUPLICATE-ORDER-KEY error; the hash key must be a valid order key, and
          the value is the unique key value; this value will also be created as an order key
        - \c workflow_unique_key: (optional hash) a hash giving one or more unique @ref keylist "order keys" for the
          particular workflow by name only (across all workflows with the same name regardless of version);
          keys are order key names and values are the string key values; if this key already exists for a workflow order
          with the same name, then the order creation will fail with a \c DUPLICATE-ORDER-KEY error; the hash key must be a
          valid order key, and the value is the unique key value; this value will also be created as an order key

        @return the workflow instance ID created

        @throw SUBMIT-ORDER-ERROR invalid \a status value
        @throw ORDER-DATA-ERROR missing either \c external_order_instanceid or \c staticdata, unknown workflow; invalid keys
        or sensitive data format
        @throw DUPLICATE-ORDER-KEY the given unique key already exists in the defined scope, also sets \c arg with a
        \c workflow_instance_ids key with a list of all conflicting workflow instance IDs
        @throw WORKFLOW-KEY-ERROR invalid workflow key given

        @note
        - Prior to Qorus 3.0.2 this function was known as createOrder(), and is still imported with this old camel-case name
          for backwards compatibility
        - In the \a params argument above, either the \c staticdata or \c external_order_instanceid values must be provided;
          \c staticdata may be omitted if \c external_order_instanceid is provided and vice-versa
        - The \c global_unique_key, \c workflow_specific_unique_key, and \c workflow_unique_key options can be used to
          ensure that given workflow order data is only created once; note that any archiving schema is also searched when
          checking for duplicate keys.  These options may be combined, but it's recommended to use no more than one key for
          uniqueness.

        @see
        - @ref OMQ::UserApi::UserApi::createOrder() "UserApi::createOrder()"
        - @ref create_order()
        - @ref createRemoteOrder()
    */
    static public int createOrder(String name, String version, HashMap<String, Object> params) throws Throwable {
        return (int)QoreJavaApi.callStaticMethod("UserApi", "createOrder", name, version, params, OMQ.StatReady);
    }

    //! creates a workflow order data instance in the database
    /** Creates a workflow order data instance of the specified type with the data passed.

        To ensure that a given workflow order is only created once for a given unique key value, make sure
        your workflow defines @ref keylist "order keys", and use one of the following options to guarantee
        uniqueness of the order:
        - \c global_unique_key
        - \c workflow_specific_unique_key
        - \c workflow_unique_key

        @param name the name of the workflow
        @param version the version of the workflow; if this parameter is not passed, then the latest version of the workflow
        (determined by the latest created date for the workflow_instance entry) will be used
        @param params The hash passed must have at either a \c staticdata key or an \c external_order_instanceid key, valid keys:
        - \c dynamicdata: (optional hash) the initial @ref dynamicdata "dynamic data" for the order
        - \c external_order_instanceid: (optional/required string) the external order instance ID for the workflow data; one
          of \c staticdata or \c external_order_instanceid must be provided
        - \c global_unique_key: (optional hash) a hash giving one or more unique @ref keylist "order keys" for the order
          (across all workflows regardless of workflowid, name, or version); keys are order key names and values are the
          string key values; if this key already exists for any order in the system, then the order creation will fail with a
          \c DUPLICATE-ORDER-KEY error; the hash key must be a valid order key, and the value is the unique key value;
          this value will also be created as an order key
        - \c orderkeys: (optional hash) a hash of @ref keylist "order keys" for the order
        - \c parent_workflow_instanceid: (optional int) a loosely-coupled workflow that will be marked as the parent of this
          workflow; if this key is not set, and this function is called from workflow code (even indirectly, by calling a
          service method that calls this function in the same thread as the call from workflow code), the new order will be
          loosely-coupled with the calling workflow order as the parent; to keep this from happening, set the value of this
          key to false
        - \c priority: the order priority (optional int, default @ref OMQ.DefaultOrderPriority) from 0 - 999; priority 0 is the
          highest; 999 is the lowest
        - \c scheduled: (optional date) the earliest date and time the order can be processed; if this date is given as a
          future date/time value and a @ref OMQ.StatReady status is given, then the initial status of the workflow order data
          instance will be automatically changed to @ref OMQ.StatScheduled instead of @ref OMQ.StatReady
        - \c sensitive_data: (optional hash) a hash of sensitive data information for the workflow; this key can only be used
          when submitting the data over a secure (encrypted) connection; the keys are sensitive data key types, values are
          hashes keyed by sensitive data values, and the hash values have the following keys:
            - \c aliases: (optional list of strings) zero or more string aliases for the sensitive data
            - \c data: (required hash) the sensitive data hash itself
            - \c meta: (optional hash) a hash of metadata for the sensitive data with the following recommended keys
              (recommended keys are not enforced by the API itself):
                - \c PURPOSE: free-form information about the purpose of the sensitive data
                - \c CATEGORIES: free-form information about the categories of sensitive data
                - \c RECIPIENTS: free-form information about the recipients or recipient catories of sensitive data
                - \c STORAGE: free-form information about the storage time or rules for sensitive data
        - \c staticdata: (optional/required hash) the initial @ref staticdata "data" for the order; one of
          \c staticdata or \c external_order_instanceid must be provided
        - \c tempdata: (optional hash) the initial @ref tempdata "temporary data" for the order
        - \c workflow_specific_unique_key: (optional hash) a hash giving one or more unique @ref keylist "order keys" for
          the particular workflowid (which matches a unique name and workflow version); keys are order key names and values
          are the string key values; if any of the keys given already exists for an order with the target workflowid, then
          the order creation will fail with a \c DUPLICATE-ORDER-KEY error; the hash key must be a valid order key, and
          the value is the unique key value; this value will also be created as an order key
        - \c workflow_unique_key: (optional hash) a hash giving one or more unique @ref keylist "order keys" for the
          particular workflow by name only (across all workflows with the same name regardless of version);
          keys are order key names and values are the string key values; if this key already exists for a workflow order
          with the same name, then the order creation will fail with a \c DUPLICATE-ORDER-KEY error; the hash key must be a
          valid order key, and the value is the unique key value; this value will also be created as an order key
        @param status create the workflow order data instance with this status; may be either:
        - @ref OMQ.StatReady which is the default value
        - @ref OMQ.StatBlocked meaning: do not process the order, wait for unblocking later

        @return the workflow instance ID created

        @throw SUBMIT-ORDER-ERROR invalid \a status value
        @throw ORDER-DATA-ERROR missing either \c external_order_instanceid or \c staticdata, unknown workflow; invalid keys
        or sensitive data format
        @throw DUPLICATE-ORDER-KEY the given unique key already exists in the defined scope, also sets \c arg with a
        \c workflow_instance_ids key with a list of all conflicting workflow instance IDs
        @throw WORKFLOW-KEY-ERROR invalid workflow key given

        @note
        - Prior to Qorus 3.0.2 this function was known as createOrder(), and is still imported with this old camel-case name
          for backwards compatibility
        - In the \a params argument above, either the \c staticdata or \c external_order_instanceid values must be provided;
          \c staticdata may be omitted if \c external_order_instanceid is provided and vice-versa
        - The \c global_unique_key, \c workflow_specific_unique_key, and \c workflow_unique_key options can be used to
          ensure that given workflow order data is only created once; note that any archiving schema is also searched when
          checking for duplicate keys.  These options may be combined, but it's recommended to use no more than one key for
          uniqueness.

        @see
        - @ref OMQ::UserApi::UserApi::createOrder() "UserApi::createOrder()"
        - @ref create_order()
        - @ref createRemoteOrder()
    */
    static public int createOrder(String name, String version, HashMap<String, Object> params, String status) throws Throwable {
        return (int)QoreJavaApi.callStaticMethod("UserApi", "createOrder", name, version, params, status);
    }

    //! creates a workflow order data instance in the database with status @ref OMQ.StatReady "READY"
    /** Creates a workflow order data instance of the specified type with the data passed.

        To ensure that a given workflow order is only created once for a given unique key value, make sure
        your workflow defines @ref keylist "order keys", and use one of the following options to guarantee
        uniqueness of the order:
        - \c global_unique_key
        - \c workflow_specific_unique_key
        - \c workflow_unique_key

        @param name the name of the workflow; the latest version of the workflow (determined by the latest created
        date for the workflow_instance entry) will be used
        (determined by the latest created date for the workflow_instance entry) will be used
        @param params The hash passed must have at either a \c staticdata key or an \c external_order_instanceid key, valid keys:
        - \c dynamicdata: (optional hash) the initial @ref dynamicdata "dynamic data" for the order
        - \c external_order_instanceid: (optional/required string) the external order instance ID for the workflow data; one
          of \c staticdata or \c external_order_instanceid must be provided
        - \c global_unique_key: (optional hash) a hash giving one or more unique @ref keylist "order keys" for the order
          (across all workflows regardless of workflowid, name, or version); keys are order key names and values are the
          string key values; if this key already exists for any order in the system, then the order creation will fail with a
          \c DUPLICATE-ORDER-KEY error; the hash key must be a valid order key, and the value is the unique key value;
          this value will also be created as an order key
        - \c orderkeys: (optional hash) a hash of @ref keylist "order keys" for the order
        - \c parent_workflow_instanceid: (optional int) a loosely-coupled workflow that will be marked as the parent of this
          workflow; if this key is not set, and this function is called from workflow code (even indirectly, by calling a
          service method that calls this function in the same thread as the call from workflow code), the new order will be
          loosely-coupled with the calling workflow order as the parent; to keep this from happening, set the value of this
          key to false
        - \c priority: the order priority (optional int, default @ref OMQ.DefaultOrderPriority) from 0 - 999; priority 0 is the
          highest; 999 is the lowest
        - \c scheduled: (optional date) the earliest date and time the order can be processed; if this date is given as a
          future date/time value and a @ref OMQ.StatReady status is given, then the initial status of the workflow order data
          instance will be automatically changed to @ref OMQ.StatScheduled instead of @ref OMQ.StatReady
        - \c sensitive_data: (optional hash) a hash of sensitive data information for the workflow; this key can only be used
          when submitting the data over a secure (encrypted) connection; the keys are sensitive data key types, values are
          hashes keyed by sensitive data values, and the hash values have the following keys:
            - \c aliases: (optional list of strings) zero or more string aliases for the sensitive data
            - \c data: (required hash) the sensitive data hash itself
            - \c meta: (optional hash) a hash of metadata for the sensitive data with the following recommended keys
              (recommended keys are not enforced by the API itself):
                - \c PURPOSE: free-form information about the purpose of the sensitive data
                - \c CATEGORIES: free-form information about the categories of sensitive data
                - \c RECIPIENTS: free-form information about the recipients or recipient catories of sensitive data
                - \c STORAGE: free-form information about the storage time or rules for sensitive data
        - \c staticdata: (optional/required hash) the initial @ref staticdata "data" for the order; one of
          \c staticdata or \c external_order_instanceid must be provided
        - \c tempdata: (optional hash) the initial @ref tempdata "temporary data" for the order
        - \c workflow_specific_unique_key: (optional hash) a hash giving one or more unique @ref keylist "order keys" for
          the particular workflowid (which matches a unique name and workflow version); keys are order key names and values
          are the string key values; if any of the keys given already exists for an order with the target workflowid, then
          the order creation will fail with a \c DUPLICATE-ORDER-KEY error; the hash key must be a valid order key, and
          the value is the unique key value; this value will also be created as an order key
        - \c workflow_unique_key: (optional hash) a hash giving one or more unique @ref keylist "order keys" for the
          particular workflow by name only (across all workflows with the same name regardless of version);
          keys are order key names and values are the string key values; if this key already exists for a workflow order
          with the same name, then the order creation will fail with a \c DUPLICATE-ORDER-KEY error; the hash key must be a
          valid order key, and the value is the unique key value; this value will also be created as an order key

        @return the workflow instance ID created

        @throw SUBMIT-ORDER-ERROR invalid \a status value
        @throw ORDER-DATA-ERROR missing either \c external_order_instanceid or \c staticdata, unknown workflow; invalid keys
        or sensitive data format
        @throw DUPLICATE-ORDER-KEY the given unique key already exists in the defined scope, also sets \c arg with a
        \c workflow_instance_ids key with a list of all conflicting workflow instance IDs
        @throw WORKFLOW-KEY-ERROR invalid workflow key given

        @note
        - Prior to Qorus 3.0.2 this function was known as createOrder(), and is still imported with this old camel-case name
          for backwards compatibility
        - In the \a params argument above, either the \c staticdata or \c external_order_instanceid values must be provided;
          \c staticdata may be omitted if \c external_order_instanceid is provided and vice-versa
        - The \c global_unique_key, \c workflow_specific_unique_key, and \c workflow_unique_key options can be used to
          ensure that given workflow order data is only created once; note that any archiving schema is also searched when
          checking for duplicate keys.  These options may be combined, but it's recommended to use no more than one key for
          uniqueness.

        @see
        - @ref OMQ::UserApi::UserApi::createOrder() "UserApi::createOrder()"
        - @ref create_order()
        - @ref createRemoteOrder()
    */
    static public int createOrder(String name, HashMap<String, Object> params) throws Throwable {
        return (int)QoreJavaApi.callStaticMethod("UserApi", "createOrder", name, null, params, OMQ.StatReady);
    }

    //! creates a workflow order data instance in the database
    /** Creates a workflow order data instance of the specified type with the data passed.

        To ensure that a given workflow order is only created once for a given unique key value, make sure
        your workflow defines @ref keylist "order keys", and use one of the following options to guarantee
        uniqueness of the order:
        - \c global_unique_key
        - \c workflow_specific_unique_key
        - \c workflow_unique_key

        @param name the name of the workflow; the latest version of the workflow (determined by the latest created
        date for the workflow_instance entry) will be used
        @param params The hash passed must have at either a \c staticdata key or an \c external_order_instanceid key, valid keys:
        - \c dynamicdata: (optional hash) the initial @ref dynamicdata "dynamic data" for the order
        - \c external_order_instanceid: (optional/required string) the external order instance ID for the workflow data; one
          of \c staticdata or \c external_order_instanceid must be provided
        - \c global_unique_key: (optional hash) a hash giving one or more unique @ref keylist "order keys" for the order
          (across all workflows regardless of workflowid, name, or version); keys are order key names and values are the
          string key values; if this key already exists for any order in the system, then the order creation will fail with a
          \c DUPLICATE-ORDER-KEY error; the hash key must be a valid order key, and the value is the unique key value;
          this value will also be created as an order key
        - \c orderkeys: (optional hash) a hash of @ref keylist "order keys" for the order
        - \c parent_workflow_instanceid: (optional int) a loosely-coupled workflow that will be marked as the parent of this
          workflow; if this key is not set, and this function is called from workflow code (even indirectly, by calling a
          service method that calls this function in the same thread as the call from workflow code), the new order will be
          loosely-coupled with the calling workflow order as the parent; to keep this from happening, set the value of this
          key to false
        - \c priority: the order priority (optional int, default @ref OMQ.DefaultOrderPriority) from 0 - 999; priority 0 is the
          highest; 999 is the lowest
        - \c scheduled: (optional date) the earliest date and time the order can be processed; if this date is given as a
          future date/time value and a @ref OMQ.StatReady status is given, then the initial status of the workflow order data
          instance will be automatically changed to @ref OMQ.StatScheduled instead of @ref OMQ.StatReady
        - \c sensitive_data: (optional hash) a hash of sensitive data information for the workflow; this key can only be used
          when submitting the data over a secure (encrypted) connection; the keys are sensitive data key types, values are
          hashes keyed by sensitive data values, and the hash values have the following keys:
            - \c aliases: (optional list of strings) zero or more string aliases for the sensitive data
            - \c data: (required hash) the sensitive data hash itself
            - \c meta: (optional hash) a hash of metadata for the sensitive data with the following recommended keys
              (recommended keys are not enforced by the API itself):
                - \c PURPOSE: free-form information about the purpose of the sensitive data
                - \c CATEGORIES: free-form information about the categories of sensitive data
                - \c RECIPIENTS: free-form information about the recipients or recipient catories of sensitive data
                - \c STORAGE: free-form information about the storage time or rules for sensitive data
        - \c staticdata: (optional/required hash) the initial @ref staticdata "data" for the order; one of
          \c staticdata or \c external_order_instanceid must be provided
        - \c tempdata: (optional hash) the initial @ref tempdata "temporary data" for the order
        - \c workflow_specific_unique_key: (optional hash) a hash giving one or more unique @ref keylist "order keys" for
          the particular workflowid (which matches a unique name and workflow version); keys are order key names and values
          are the string key values; if any of the keys given already exists for an order with the target workflowid, then
          the order creation will fail with a \c DUPLICATE-ORDER-KEY error; the hash key must be a valid order key, and
          the value is the unique key value; this value will also be created as an order key
        - \c workflow_unique_key: (optional hash) a hash giving one or more unique @ref keylist "order keys" for the
          particular workflow by name only (across all workflows with the same name regardless of version);
          keys are order key names and values are the string key values; if this key already exists for a workflow order
          with the same name, then the order creation will fail with a \c DUPLICATE-ORDER-KEY error; the hash key must be a
          valid order key, and the value is the unique key value; this value will also be created as an order key
        @param status create the workflow order data instance with this status; may be either:
        - @ref OMQ.StatReady which is the default value
        - @ref OMQ.StatBlocked meaning: do not process the order, wait for unblocking later

        @return the workflow instance ID created

        @throw SUBMIT-ORDER-ERROR invalid \a status value
        @throw ORDER-DATA-ERROR missing either \c external_order_instanceid or \c staticdata, unknown workflow; invalid keys
        or sensitive data format
        @throw DUPLICATE-ORDER-KEY the given unique key already exists in the defined scope, also sets \c arg with a
        \c workflow_instance_ids key with a list of all conflicting workflow instance IDs
        @throw WORKFLOW-KEY-ERROR invalid workflow key given

        @note
        - Prior to Qorus 3.0.2 this function was known as createOrder(), and is still imported with this old camel-case name
          for backwards compatibility
        - In the \a params argument above, either the \c staticdata or \c external_order_instanceid values must be provided;
          \c staticdata may be omitted if \c external_order_instanceid is provided and vice-versa
        - The \c global_unique_key, \c workflow_specific_unique_key, and \c workflow_unique_key options can be used to
          ensure that given workflow order data is only created once; note that any archiving schema is also searched when
          checking for duplicate keys.  These options may be combined, but it's recommended to use no more than one key for
          uniqueness.

        @see
        - @ref OMQ::UserApi::UserApi::createOrder() "UserApi::createOrder()"
        - @ref create_order()
        - @ref createRemoteOrder()
    */
    static public int createOrder(String name, HashMap<String, Object> params, String status) throws Throwable {
        return (int)QoreJavaApi.callStaticMethod("UserApi", "createOrder", name, null, params, status);
    }

    //! creates a workflow order data instance in a remote Qorus instance
    /** Creates a workflow order data instance of the specified type with the data passed in the specified remote Qorus instance.

        To ensure that a given workflow order is only created once for a given unique key value, make sure
        your workflow defines @ref keylist "order keys", and use one of the following options to guarantee
        uniqueness of the order:
        - \c global_unique_key
        - \c workflow_specific_unique_key
        - \c workflow_unique_key

        @param remote the name of the @ref remoteconn "remote Qorus connection"
        @param name the name of the workflow
        @param version the version of the workflow; if this parameter is not passed, then the latest version of the workflow
        (determined by the latest created date for the workflow_instance entry) will be used
        @param params The hash passed must have at either a \c staticdata key or an \c external_order_instanceid key, valid
        keys:
        - \c dynamicdata: (optional hash) the initial @ref dynamicdata "dynamic data" for the order
        - \c external_order_instanceid: (optional/required string) the external order instance ID for the workflow data; one
          of \c staticdata or \c external_order_instanceid must be provided
        - \c global_unique_key: (optional hash) a hash giving one or more unique @ref keylist "order keys" for the order
          (across all workflows regardless of workflowid, name, or version); keys are order key names and values are the
          string key values; if this key already exists for any order in the system, then the order creation will fail with a
          \c DUPLICATE-ORDER-KEY error; the hash key must be a valid order key, and the value is the unique key value;
          this value will also be created as an order key
        - \c orderkeys: (optional hash) a hash of @ref keylist "order keys" for the order
        - \c parent_workflow_instanceid: (optional int) a loosely-coupled workflow that will be marked as the parent of this
          workflow; if this key is not set, and this function is called from workflow code (even indirectly, by calling a
          service method that calls this function in the same thread as the call from workflow code), the new order will be
          loosely-coupled with the calling workflow order as the parent; to keep this from happening, set the value of this
          key to false
        - \c priority: the order priority (optional int, default @ref OMQ.DefaultOrderPriority) from 0 - 999; priority 0 is the
          highest; 999 is the lowest
        - \c scheduled: (optional date) the earliest date and time the order can be processed; if this date is given as a
          future date/time value and a @ref OMQ.StatReady status is given, then the initial status of the workflow order data
          instance will be automatically changed to @ref OMQ.StatScheduled instead of @ref OMQ.StatReady
        - \c sensitive_data: (optional hash) a hash of sensitive data information for the workflow; this key can only be used
          when submitting the data over a secure (encrypted) connection; the keys are sensitive data key types, values are
          hashes keyed by sensitive data values, and the hash values have the following keys:
            - \c aliases: (optional list of strings) zero or more string aliases for the sensitive data
            - \c data: (required hash) the sensitive data hash itself
            - \c meta: (optional hash) a hash of metadata for the sensitive data with the following recommended keys
             (recommended keys are not enforced by the API itself):
                - \c PURPOSE: free-form information about the purpose of the sensitive data
                - \c CATEGORIES: free-form information about the categories of sensitive data
                - \c RECIPIENTS: free-form information about the recipients or recipient catories of sensitive data
                - \c STORAGE: free-form information about the storage time or rules for sensitive data
        - \c staticdata: (optional/required hash) the initial @ref staticdata "data" for the order; one of
          \c staticdata or \c external_order_instanceid must be provided
        - \c tempdata: (optional hash) the initial @ref tempdata "temporary data" for the order
        - \c workflow_specific_unique_key: (optional hash) a hash giving one or more unique @ref keylist "order keys" for
          the particular workflowid (which matches a unique name and workflow version); keys are order key names and values
          are the string key values; if any of the keys given already exists for an order with the target workflowid, then
          the order creation will fail with a \c DUPLICATE-ORDER-KEY error; the hash key must be a valid order key, and
          the value is the unique key value; this value will also be created as an order key
        - \c workflow_unique_key: (optional hash) a hash giving one or more unique @ref keylist "order keys" for the
          particular workflow by name only (across all workflows with the same name regardless of version);
          keys are order key names and values are the string key values; if this key already exists for a workflow order
          with the same name, then the order creation will fail with a \c DUPLICATE-ORDER-KEY error; the hash key must be a
          valid order key, and the value is the unique key value; this value will also be created as an order key
        @param status create the workflow order data instance with this status; may be either:
        - @ref OMQ.StatReady which is the default value
        - @ref OMQ.StatBlocked meaning: do not process the order, wait for unblocking later
        @param register_dependency if true (the default) then if the connection is monitored as down, the
        calling interface will be temporarily disabled until the connection is up again

        @return the workflow instance ID created

        @throw GET-REMOTE-ERROR The given @ref remoteconn "connection" is not known
        @throw SUBMIT-ORDER-ERROR invalid \a status value
        @throw WORKFLOW-ERROR unknown or invalid workflow
        @throw ORDER-DATA-ERROR missing either \c external_order_instanceid or \c staticdata, invalid keys or sensitive data
        format
        @throw DUPLICATE-ORDER-KEY the given unique key already exists in the defined scope, also sets \c arg with a
        \c workflow_instance_ids key with a list of all conflicting workflow instance IDs
        @throw WORKFLOW-KEY-ERROR invalid workflow key given

        @note
        - In the \a params argument above, either the \c staticdata or \c external_order_instanceid values must be provided;
          \c staticdata may be omitted if \c external_order_instanceid is provided and vice-versa
        - The \c global_unique_key, \c workflow_specific_unique_key, and \c workflow_unique_key options can be used to
          ensure that given workflow order data is only created once; note that any archiving schema is also searched when
          checking for duplicate keys.  These options may be combined, but it's recommended to use no more than one key for
          uniqueness.

        @see
        - @ref OMQ::UserApi::UserApi::createRemoteOrder() "UserApi::createRemoteOrder()"
        - @ref create_remote_order()
        - @ref createOrder()
    */
    static public int createRemoteOrder(String remote, String name, String version, HashMap<String, Object> params, String status, boolean register_dependency) throws Throwable {
        return (int)QoreJavaApi.callStaticMethod("UserApi", "createRemoteOrder", remote, name, version, params, status, register_dependency);
    }

    //! creates a workflow order data instance in a remote Qorus instance, establishing a connection dependency with the calling interface
    /** Creates a workflow order data instance of the specified type with the data passed in the specified remote Qorus instance.

        To ensure that a given workflow order is only created once for a given unique key value, make sure
        your workflow defines @ref keylist "order keys", and use one of the following options to guarantee
        uniqueness of the order:
        - \c global_unique_key
        - \c workflow_specific_unique_key
        - \c workflow_unique_key

        @param remote the name of the @ref remoteconn "remote Qorus connection"
        @param name the name of the workflow
        @param version the version of the workflow; if this parameter is not passed, then the latest version of the workflow
        (determined by the latest created date for the workflow_instance entry) will be used
        @param params The hash passed must have at either a \c staticdata key or an \c external_order_instanceid key, valid
        keys:
        - \c dynamicdata: (optional hash) the initial @ref dynamicdata "dynamic data" for the order
        - \c external_order_instanceid: (optional/required string) the external order instance ID for the workflow data; one
          of \c staticdata or \c external_order_instanceid must be provided
        - \c global_unique_key: (optional hash) a hash giving one or more unique @ref keylist "order keys" for the order
          (across all workflows regardless of workflowid, name, or version); keys are order key names and values are the
          string key values; if this key already exists for any order in the system, then the order creation will fail with a
          \c DUPLICATE-ORDER-KEY error; the hash key must be a valid order key, and the value is the unique key value;
          this value will also be created as an order key
        - \c orderkeys: (optional hash) a hash of @ref keylist "order keys" for the order
        - \c parent_workflow_instanceid: (optional int) a loosely-coupled workflow that will be marked as the parent of this
          workflow; if this key is not set, and this function is called from workflow code (even indirectly, by calling a
          service method that calls this function in the same thread as the call from workflow code), the new order will be
          loosely-coupled with the calling workflow order as the parent; to keep this from happening, set the value of this
          key to false
        - \c priority: the order priority (optional int, default @ref OMQ.DefaultOrderPriority) from 0 - 999; priority 0 is the
          highest; 999 is the lowest
        - \c scheduled: (optional date) the earliest date and time the order can be processed; if this date is given as a
          future date/time value and a @ref OMQ.StatReady status is given, then the initial status of the workflow order data
          instance will be automatically changed to @ref OMQ.StatScheduled instead of @ref OMQ.StatReady
        - \c sensitive_data: (optional hash) a hash of sensitive data information for the workflow; this key can only be used
          when submitting the data over a secure (encrypted) connection; the keys are sensitive data key types, values are
          hashes keyed by sensitive data values, and the hash values have the following keys:
            - \c aliases: (optional list of strings) zero or more string aliases for the sensitive data
            - \c data: (required hash) the sensitive data hash itself
            - \c meta: (optional hash) a hash of metadata for the sensitive data with the following recommended keys
             (recommended keys are not enforced by the API itself):
                - \c PURPOSE: free-form information about the purpose of the sensitive data
                - \c CATEGORIES: free-form information about the categories of sensitive data
                - \c RECIPIENTS: free-form information about the recipients or recipient catories of sensitive data
                - \c STORAGE: free-form information about the storage time or rules for sensitive data
        - \c staticdata: (optional/required hash) the initial @ref staticdata "data" for the order; one of
          \c staticdata or \c external_order_instanceid must be provided
        - \c tempdata: (optional hash) the initial @ref tempdata "temporary data" for the order
        - \c workflow_specific_unique_key: (optional hash) a hash giving one or more unique @ref keylist "order keys" for
          the particular workflowid (which matches a unique name and workflow version); keys are order key names and values
          are the string key values; if any of the keys given already exists for an order with the target workflowid, then
          the order creation will fail with a \c DUPLICATE-ORDER-KEY error; the hash key must be a valid order key, and
          the value is the unique key value; this value will also be created as an order key
        - \c workflow_unique_key: (optional hash) a hash giving one or more unique @ref keylist "order keys" for the
          particular workflow by name only (across all workflows with the same name regardless of version);
          keys are order key names and values are the string key values; if this key already exists for a workflow order
          with the same name, then the order creation will fail with a \c DUPLICATE-ORDER-KEY error; the hash key must be a
          valid order key, and the value is the unique key value; this value will also be created as an order key
        @param status create the workflow order data instance with this status; may be either:
        - @ref OMQ.StatReady which is the default value
        - @ref OMQ.StatBlocked meaning: do not process the order, wait for unblocking later

        @return the workflow instance ID created

        @throw GET-REMOTE-ERROR The given @ref remoteconn "connection" is not known
        @throw SUBMIT-ORDER-ERROR invalid \a status value
        @throw WORKFLOW-ERROR unknown or invalid workflow
        @throw ORDER-DATA-ERROR missing either \c external_order_instanceid or \c staticdata, invalid keys or sensitive data
        format
        @throw DUPLICATE-ORDER-KEY the given unique key already exists in the defined scope, also sets \c arg with a
        \c workflow_instance_ids key with a list of all conflicting workflow instance IDs
        @throw WORKFLOW-KEY-ERROR invalid workflow key given

        @note
        - In the \a params argument above, either the \c staticdata or \c external_order_instanceid values must be provided;
          \c staticdata may be omitted if \c external_order_instanceid is provided and vice-versa
        - The \c global_unique_key, \c workflow_specific_unique_key, and \c workflow_unique_key options can be used to
          ensure that given workflow order data is only created once; note that any archiving schema is also searched when
          checking for duplicate keys.  These options may be combined, but it's recommended to use no more than one key for
          uniqueness.

        @see
        - @ref OMQ::UserApi::UserApi::createRemoteOrder() "UserApi::createRemoteOrder()"
        - @ref create_remote_order()
        - @ref createOrder()
    */
    static public int createRemoteOrder(String remote, String name, String version, HashMap<String, Object> params, String status) throws Throwable {
        return (int)QoreJavaApi.callStaticMethod("UserApi", "createRemoteOrder", remote, name, version, params, status, true);
    }

    //! creates a workflow order data instance in a remote Qorus instance with status @ref OMQ.StatReady "READY" amd establishing a connection dependency with the calling interface
    /** Creates a workflow order data instance of the specified type with the data passed in the specified remote Qorus instance.

        To ensure that a given workflow order is only created once for a given unique key value, make sure
        your workflow defines @ref keylist "order keys", and use one of the following options to guarantee
        uniqueness of the order:
        - \c global_unique_key
        - \c workflow_specific_unique_key
        - \c workflow_unique_key

        @param remote the name of the @ref remoteconn "remote Qorus connection"
        @param name the name of the workflow
        @param version the version of the workflow; if this parameter is not passed, then the latest version of the workflow
        (determined by the latest created date for the workflow_instance entry) will be used
        @param params The hash passed must have at either a \c staticdata key or an \c external_order_instanceid key, valid
        keys:
        - \c dynamicdata: (optional hash) the initial @ref dynamicdata "dynamic data" for the order
        - \c external_order_instanceid: (optional/required string) the external order instance ID for the workflow data; one
          of \c staticdata or \c external_order_instanceid must be provided
        - \c global_unique_key: (optional hash) a hash giving one or more unique @ref keylist "order keys" for the order
          (across all workflows regardless of workflowid, name, or version); keys are order key names and values are the
          string key values; if this key already exists for any order in the system, then the order creation will fail with a
          \c DUPLICATE-ORDER-KEY error; the hash key must be a valid order key, and the value is the unique key value;
          this value will also be created as an order key
        - \c orderkeys: (optional hash) a hash of @ref keylist "order keys" for the order
        - \c parent_workflow_instanceid: (optional int) a loosely-coupled workflow that will be marked as the parent of this
          workflow; if this key is not set, and this function is called from workflow code (even indirectly, by calling a
          service method that calls this function in the same thread as the call from workflow code), the new order will be
          loosely-coupled with the calling workflow order as the parent; to keep this from happening, set the value of this
          key to false
        - \c priority: the order priority (optional int, default @ref OMQ.DefaultOrderPriority) from 0 - 999; priority 0 is the
          highest; 999 is the lowest
        - \c scheduled: (optional date) the earliest date and time the order can be processed; if this date is given as a
          future date/time value and a @ref OMQ.StatReady status is given, then the initial status of the workflow order data
          instance will be automatically changed to @ref OMQ.StatScheduled instead of @ref OMQ.StatReady
        - \c sensitive_data: (optional hash) a hash of sensitive data information for the workflow; this key can only be used
          when submitting the data over a secure (encrypted) connection; the keys are sensitive data key types, values are
          hashes keyed by sensitive data values, and the hash values have the following keys:
            - \c aliases: (optional list of strings) zero or more string aliases for the sensitive data
            - \c data: (required hash) the sensitive data hash itself
            - \c meta: (optional hash) a hash of metadata for the sensitive data with the following recommended keys
             (recommended keys are not enforced by the API itself):
                - \c PURPOSE: free-form information about the purpose of the sensitive data
                - \c CATEGORIES: free-form information about the categories of sensitive data
                - \c RECIPIENTS: free-form information about the recipients or recipient catories of sensitive data
                - \c STORAGE: free-form information about the storage time or rules for sensitive data
        - \c staticdata: (optional/required hash) the initial @ref staticdata "data" for the order; one of
          \c staticdata or \c external_order_instanceid must be provided
        - \c tempdata: (optional hash) the initial @ref tempdata "temporary data" for the order
        - \c workflow_specific_unique_key: (optional hash) a hash giving one or more unique @ref keylist "order keys" for
          the particular workflowid (which matches a unique name and workflow version); keys are order key names and values
          are the string key values; if any of the keys given already exists for an order with the target workflowid, then
          the order creation will fail with a \c DUPLICATE-ORDER-KEY error; the hash key must be a valid order key, and
          the value is the unique key value; this value will also be created as an order key
        - \c workflow_unique_key: (optional hash) a hash giving one or more unique @ref keylist "order keys" for the
          particular workflow by name only (across all workflows with the same name regardless of version);
          keys are order key names and values are the string key values; if this key already exists for a workflow order
          with the same name, then the order creation will fail with a \c DUPLICATE-ORDER-KEY error; the hash key must be a
          valid order key, and the value is the unique key value; this value will also be created as an order key

        @return the workflow instance ID created

        @throw GET-REMOTE-ERROR The given @ref remoteconn "connection" is not known
        @throw SUBMIT-ORDER-ERROR invalid \a status value
        @throw WORKFLOW-ERROR unknown or invalid workflow
        @throw ORDER-DATA-ERROR missing either \c external_order_instanceid or \c staticdata, invalid keys or sensitive data
        format
        @throw DUPLICATE-ORDER-KEY the given unique key already exists in the defined scope, also sets \c arg with a
        \c workflow_instance_ids key with a list of all conflicting workflow instance IDs
        @throw WORKFLOW-KEY-ERROR invalid workflow key given

        @note
        - In the \a params argument above, either the \c staticdata or \c external_order_instanceid values must be provided;
          \c staticdata may be omitted if \c external_order_instanceid is provided and vice-versa
        - The \c global_unique_key, \c workflow_specific_unique_key, and \c workflow_unique_key options can be used to
          ensure that given workflow order data is only created once; note that any archiving schema is also searched when
          checking for duplicate keys.  These options may be combined, but it's recommended to use no more than one key for
          uniqueness.

        @see
        - @ref OMQ::UserApi::UserApi::createRemoteOrder() "UserApi::createRemoteOrder()"
        - @ref create_remote_order()
        - @ref createOrder()
    */
    static public int createRemoteOrder(String remote, String name, String version, HashMap<String, Object> params) throws Throwable {
        return (int)QoreJavaApi.callStaticMethod("UserApi", "createRemoteOrder", remote, name, version, params, OMQ.StatReady, true);
    }

    //! creates a workflow order data instance in a remote Qorus instance
    /** Creates a workflow order data instance of the specified type with the data passed in the specified remote Qorus instance.

        To ensure that a given workflow order is only created once for a given unique key value, make sure
        your workflow defines @ref keylist "order keys", and use one of the following options to guarantee
        uniqueness of the order:
        - \c global_unique_key
        - \c workflow_specific_unique_key
        - \c workflow_unique_key

        @param remote the name of the @ref remoteconn "remote Qorus connection"
        @param name the name of the workflow; the latest version of the workflow (determined by the latest created
        date for the workflow_instance entry) will be used
        @param params The hash passed must have at either a \c staticdata key or an \c external_order_instanceid key, valid
        keys:
        - \c dynamicdata: (optional hash) the initial @ref dynamicdata "dynamic data" for the order
        - \c external_order_instanceid: (optional/required string) the external order instance ID for the workflow data; one
          of \c staticdata or \c external_order_instanceid must be provided
        - \c global_unique_key: (optional hash) a hash giving one or more unique @ref keylist "order keys" for the order
          (across all workflows regardless of workflowid, name, or version); keys are order key names and values are the
          string key values; if this key already exists for any order in the system, then the order creation will fail with a
          \c DUPLICATE-ORDER-KEY error; the hash key must be a valid order key, and the value is the unique key value;
          this value will also be created as an order key
        - \c orderkeys: (optional hash) a hash of @ref keylist "order keys" for the order
        - \c parent_workflow_instanceid: (optional int) a loosely-coupled workflow that will be marked as the parent of this
          workflow; if this key is not set, and this function is called from workflow code (even indirectly, by calling a
          service method that calls this function in the same thread as the call from workflow code), the new order will be
          loosely-coupled with the calling workflow order as the parent; to keep this from happening, set the value of this
          key to false
        - \c priority: the order priority (optional int, default @ref OMQ.DefaultOrderPriority) from 0 - 999; priority 0 is the
          highest; 999 is the lowest
        - \c scheduled: (optional date) the earliest date and time the order can be processed; if this date is given as a
          future date/time value and a @ref OMQ.StatReady status is given, then the initial status of the workflow order data
          instance will be automatically changed to @ref OMQ.StatScheduled instead of @ref OMQ.StatReady
        - \c sensitive_data: (optional hash) a hash of sensitive data information for the workflow; this key can only be used
          when submitting the data over a secure (encrypted) connection; the keys are sensitive data key types, values are
          hashes keyed by sensitive data values, and the hash values have the following keys:
            - \c aliases: (optional list of strings) zero or more string aliases for the sensitive data
            - \c data: (required hash) the sensitive data hash itself
            - \c meta: (optional hash) a hash of metadata for the sensitive data with the following recommended keys
             (recommended keys are not enforced by the API itself):
                - \c PURPOSE: free-form information about the purpose of the sensitive data
                - \c CATEGORIES: free-form information about the categories of sensitive data
                - \c RECIPIENTS: free-form information about the recipients or recipient catories of sensitive data
                - \c STORAGE: free-form information about the storage time or rules for sensitive data
        - \c staticdata: (optional/required hash) the initial @ref staticdata "data" for the order; one of
          \c staticdata or \c external_order_instanceid must be provided
        - \c tempdata: (optional hash) the initial @ref tempdata "temporary data" for the order
        - \c workflow_specific_unique_key: (optional hash) a hash giving one or more unique @ref keylist "order keys" for
          the particular workflowid (which matches a unique name and workflow version); keys are order key names and values
          are the string key values; if any of the keys given already exists for an order with the target workflowid, then
          the order creation will fail with a \c DUPLICATE-ORDER-KEY error; the hash key must be a valid order key, and
          the value is the unique key value; this value will also be created as an order key
        - \c workflow_unique_key: (optional hash) a hash giving one or more unique @ref keylist "order keys" for the
          particular workflow by name only (across all workflows with the same name regardless of version);
          keys are order key names and values are the string key values; if this key already exists for a workflow order
          with the same name, then the order creation will fail with a \c DUPLICATE-ORDER-KEY error; the hash key must be a
          valid order key, and the value is the unique key value; this value will also be created as an order key
        @param status create the workflow order data instance with this status; may be either:
        - @ref OMQ.StatReady which is the default value
        - @ref OMQ.StatBlocked meaning: do not process the order, wait for unblocking later
        @param register_dependency if true (the default) then if the connection is monitored as down, the
        calling interface will be temporarily disabled until the connection is up again

        @return the workflow instance ID created

        @throw GET-REMOTE-ERROR The given @ref remoteconn "connection" is not known
        @throw SUBMIT-ORDER-ERROR invalid \a status value
        @throw WORKFLOW-ERROR unknown or invalid workflow
        @throw ORDER-DATA-ERROR missing either \c external_order_instanceid or \c staticdata, invalid keys or sensitive data
        format
        @throw DUPLICATE-ORDER-KEY the given unique key already exists in the defined scope, also sets \c arg with a
        \c workflow_instance_ids key with a list of all conflicting workflow instance IDs
        @throw WORKFLOW-KEY-ERROR invalid workflow key given

        @note
        - In the \a params argument above, either the \c staticdata or \c external_order_instanceid values must be provided;
          \c staticdata may be omitted if \c external_order_instanceid is provided and vice-versa
        - The \c global_unique_key, \c workflow_specific_unique_key, and \c workflow_unique_key options can be used to
          ensure that given workflow order data is only created once; note that any archiving schema is also searched when
          checking for duplicate keys.  These options may be combined, but it's recommended to use no more than one key for
          uniqueness.

        @see
        - @ref OMQ::UserApi::UserApi::createRemoteOrder() "UserApi::createRemoteOrder()"
        - @ref create_remote_order()
        - @ref createOrder()
    */
    static public int createRemoteOrder(String remote, String name, HashMap<String, Object> params, String status, boolean register_dependency) throws Throwable {
        return (int)QoreJavaApi.callStaticMethod("UserApi", "createRemoteOrder", remote, name, null, params, status, register_dependency);
    }

    //! creates a workflow order data instance in a remote Qorus instance, establishing a connection dependency with the calling interface
    /** Creates a workflow order data instance of the specified type with the data passed in the specified remote Qorus instance.

        To ensure that a given workflow order is only created once for a given unique key value, make sure
        your workflow defines @ref keylist "order keys", and use one of the following options to guarantee
        uniqueness of the order:
        - \c global_unique_key
        - \c workflow_specific_unique_key
        - \c workflow_unique_key

        @param remote the name of the @ref remoteconn "remote Qorus connection"
        @param name the name of the workflow; the latest version of the named worklow is used to create the order
        @param params The hash passed must have at either a \c staticdata key or an \c external_order_instanceid key, valid
        keys:
        - \c dynamicdata: (optional hash) the initial @ref dynamicdata "dynamic data" for the order
        - \c external_order_instanceid: (optional/required string) the external order instance ID for the workflow data; one
          of \c staticdata or \c external_order_instanceid must be provided
        - \c global_unique_key: (optional hash) a hash giving one or more unique @ref keylist "order keys" for the order
          (across all workflows regardless of workflowid, name, or version); keys are order key names and values are the
          string key values; if this key already exists for any order in the system, then the order creation will fail with a
          \c DUPLICATE-ORDER-KEY error; the hash key must be a valid order key, and the value is the unique key value;
          this value will also be created as an order key
        - \c orderkeys: (optional hash) a hash of @ref keylist "order keys" for the order
        - \c parent_workflow_instanceid: (optional int) a loosely-coupled workflow that will be marked as the parent of this
          workflow; if this key is not set, and this function is called from workflow code (even indirectly, by calling a
          service method that calls this function in the same thread as the call from workflow code), the new order will be
          loosely-coupled with the calling workflow order as the parent; to keep this from happening, set the value of this
          key to false
        - \c priority: the order priority (optional int, default @ref OMQ.DefaultOrderPriority) from 0 - 999; priority 0 is the
          highest; 999 is the lowest
        - \c scheduled: (optional date) the earliest date and time the order can be processed; if this date is given as a
          future date/time value and a @ref OMQ.StatReady status is given, then the initial status of the workflow order data
          instance will be automatically changed to @ref OMQ.StatScheduled instead of @ref OMQ.StatReady
        - \c sensitive_data: (optional hash) a hash of sensitive data information for the workflow; this key can only be used
          when submitting the data over a secure (encrypted) connection; the keys are sensitive data key types, values are
          hashes keyed by sensitive data values, and the hash values have the following keys:
            - \c aliases: (optional list of strings) zero or more string aliases for the sensitive data
            - \c data: (required hash) the sensitive data hash itself
            - \c meta: (optional hash) a hash of metadata for the sensitive data with the following recommended keys
             (recommended keys are not enforced by the API itself):
                - \c PURPOSE: free-form information about the purpose of the sensitive data
                - \c CATEGORIES: free-form information about the categories of sensitive data
                - \c RECIPIENTS: free-form information about the recipients or recipient catories of sensitive data
                - \c STORAGE: free-form information about the storage time or rules for sensitive data
        - \c staticdata: (optional/required hash) the initial @ref staticdata "data" for the order; one of
          \c staticdata or \c external_order_instanceid must be provided
        - \c tempdata: (optional hash) the initial @ref tempdata "temporary data" for the order
        - \c workflow_specific_unique_key: (optional hash) a hash giving one or more unique @ref keylist "order keys" for
          the particular workflowid (which matches a unique name and workflow version); keys are order key names and values
          are the string key values; if any of the keys given already exists for an order with the target workflowid, then
          the order creation will fail with a \c DUPLICATE-ORDER-KEY error; the hash key must be a valid order key, and
          the value is the unique key value; this value will also be created as an order key
        - \c workflow_unique_key: (optional hash) a hash giving one or more unique @ref keylist "order keys" for the
          particular workflow by name only (across all workflows with the same name regardless of version);
          keys are order key names and values are the string key values; if this key already exists for a workflow order
          with the same name, then the order creation will fail with a \c DUPLICATE-ORDER-KEY error; the hash key must be a
          valid order key, and the value is the unique key value; this value will also be created as an order key
        @param status create the workflow order data instance with this status; may be either:
        - @ref OMQ.StatReady which is the default value
        - @ref OMQ.StatBlocked meaning: do not process the order, wait for unblocking later

        @return the workflow instance ID created

        @throw GET-REMOTE-ERROR The given @ref remoteconn "connection" is not known
        @throw SUBMIT-ORDER-ERROR invalid \a status value
        @throw WORKFLOW-ERROR unknown or invalid workflow
        @throw ORDER-DATA-ERROR missing either \c external_order_instanceid or \c staticdata, invalid keys or sensitive data
        format
        @throw DUPLICATE-ORDER-KEY the given unique key already exists in the defined scope, also sets \c arg with a
        \c workflow_instance_ids key with a list of all conflicting workflow instance IDs
        @throw WORKFLOW-KEY-ERROR invalid workflow key given

        @note
        - In the \a params argument above, either the \c staticdata or \c external_order_instanceid values must be provided;
          \c staticdata may be omitted if \c external_order_instanceid is provided and vice-versa
        - The \c global_unique_key, \c workflow_specific_unique_key, and \c workflow_unique_key options can be used to
          ensure that given workflow order data is only created once; note that any archiving schema is also searched when
          checking for duplicate keys.  These options may be combined, but it's recommended to use no more than one key for
          uniqueness.

        @see
        - @ref OMQ::UserApi::UserApi::createRemoteOrder() "UserApi::createRemoteOrder()"
        - @ref create_remote_order()
        - @ref createOrder()
    */
    static public int createRemoteOrder(String remote, String name, HashMap<String, Object> params, String status) throws Throwable {
        return (int)QoreJavaApi.callStaticMethod("UserApi", "createRemoteOrder", remote, name, null, params, status, true);
    }

    //! creates a workflow order data instance in a remote Qorus instance with status @ref OMQ.StatReady "READY" amd establishing a connection dependency with the calling interface
    /** Creates a workflow order data instance of the specified type with the data passed in the specified remote Qorus instance.

        To ensure that a given workflow order is only created once for a given unique key value, make sure
        your workflow defines @ref keylist "order keys", and use one of the following options to guarantee
        uniqueness of the order:
        - \c global_unique_key
        - \c workflow_specific_unique_key
        - \c workflow_unique_key

        @param remote the name of the @ref remoteconn "remote Qorus connection"
        @param name the name of the workflow; the latest version of the workflow (determined by the latest created
        date for the workflow_instance entry) will be used
        @param params The hash passed must have at either a \c staticdata key or an \c external_order_instanceid key, valid
        keys:
        - \c dynamicdata: (optional hash) the initial @ref dynamicdata "dynamic data" for the order
        - \c external_order_instanceid: (optional/required string) the external order instance ID for the workflow data; one
          of \c staticdata or \c external_order_instanceid must be provided
        - \c global_unique_key: (optional hash) a hash giving one or more unique @ref keylist "order keys" for the order
          (across all workflows regardless of workflowid, name, or version); keys are order key names and values are the
          string key values; if this key already exists for any order in the system, then the order creation will fail with a
          \c DUPLICATE-ORDER-KEY error; the hash key must be a valid order key, and the value is the unique key value;
          this value will also be created as an order key
        - \c orderkeys: (optional hash) a hash of @ref keylist "order keys" for the order
        - \c parent_workflow_instanceid: (optional int) a loosely-coupled workflow that will be marked as the parent of this
          workflow; if this key is not set, and this function is called from workflow code (even indirectly, by calling a
          service method that calls this function in the same thread as the call from workflow code), the new order will be
          loosely-coupled with the calling workflow order as the parent; to keep this from happening, set the value of this
          key to false
        - \c priority: the order priority (optional int, default @ref OMQ.DefaultOrderPriority) from 0 - 999; priority 0 is the
          highest; 999 is the lowest
        - \c scheduled: (optional date) the earliest date and time the order can be processed; if this date is given as a
          future date/time value and a @ref OMQ.StatReady status is given, then the initial status of the workflow order data
          instance will be automatically changed to @ref OMQ.StatScheduled instead of @ref OMQ.StatReady
        - \c sensitive_data: (optional hash) a hash of sensitive data information for the workflow; this key can only be used
          when submitting the data over a secure (encrypted) connection; the keys are sensitive data key types, values are
          hashes keyed by sensitive data values, and the hash values have the following keys:
            - \c aliases: (optional list of strings) zero or more string aliases for the sensitive data
            - \c data: (required hash) the sensitive data hash itself
            - \c meta: (optional hash) a hash of metadata for the sensitive data with the following recommended keys
             (recommended keys are not enforced by the API itself):
                - \c PURPOSE: free-form information about the purpose of the sensitive data
                - \c CATEGORIES: free-form information about the categories of sensitive data
                - \c RECIPIENTS: free-form information about the recipients or recipient catories of sensitive data
                - \c STORAGE: free-form information about the storage time or rules for sensitive data
        - \c staticdata: (optional/required hash) the initial @ref staticdata "data" for the order; one of
          \c staticdata or \c external_order_instanceid must be provided
        - \c tempdata: (optional hash) the initial @ref tempdata "temporary data" for the order
        - \c workflow_specific_unique_key: (optional hash) a hash giving one or more unique @ref keylist "order keys" for
          the particular workflowid (which matches a unique name and workflow version); keys are order key names and values
          are the string key values; if any of the keys given already exists for an order with the target workflowid, then
          the order creation will fail with a \c DUPLICATE-ORDER-KEY error; the hash key must be a valid order key, and
          the value is the unique key value; this value will also be created as an order key
        - \c workflow_unique_key: (optional hash) a hash giving one or more unique @ref keylist "order keys" for the
          particular workflow by name only (across all workflows with the same name regardless of version);
          keys are order key names and values are the string key values; if this key already exists for a workflow order
          with the same name, then the order creation will fail with a \c DUPLICATE-ORDER-KEY error; the hash key must be a
          valid order key, and the value is the unique key value; this value will also be created as an order key

        @return the workflow instance ID created

        @throw GET-REMOTE-ERROR The given @ref remoteconn "connection" is not known
        @throw SUBMIT-ORDER-ERROR invalid \a status value
        @throw WORKFLOW-ERROR unknown or invalid workflow
        @throw ORDER-DATA-ERROR missing either \c external_order_instanceid or \c staticdata, invalid keys or sensitive data
        format
        @throw DUPLICATE-ORDER-KEY the given unique key already exists in the defined scope, also sets \c arg with a
        \c workflow_instance_ids key with a list of all conflicting workflow instance IDs
        @throw WORKFLOW-KEY-ERROR invalid workflow key given

        @note
        - In the \a params argument above, either the \c staticdata or \c external_order_instanceid values must be provided;
          \c staticdata may be omitted if \c external_order_instanceid is provided and vice-versa
        - The \c global_unique_key, \c workflow_specific_unique_key, and \c workflow_unique_key options can be used to
          ensure that given workflow order data is only created once; note that any archiving schema is also searched when
          checking for duplicate keys.  These options may be combined, but it's recommended to use no more than one key for
          uniqueness.

        @see
        - @ref OMQ::UserApi::UserApi::createRemoteOrder() "UserApi::createRemoteOrder()"
        - @ref create_remote_order()
        - @ref createOrder()
    */
    static public int createRemoteOrder(String remote, String name, HashMap<String, Object> params) throws Throwable {
        return (int)QoreJavaApi.callStaticMethod("UserApi", "createRemoteOrder", remote, name, null, params, OMQ.StatReady, true);
    }

    //! executes a workflow order synchronously and returns the final status and order ID in a hash
    /** @param name the workflow name
        @param version the workflow version (if null then the latest version of the workflow will be used)
        @param sdata the static data hash for the workflow order
        @param opts the options for the synchronous workflow execution instance
        @param ddata the optional initial dynamic data hash for the workflow order
        @param priority the order priority for the order
        @param orderkeys optional order keys for the order
        @param external_order_instanceid the optional external order instanceid for the order
        @param parent_workflow_instanceid: an optional loosely-coupled workflow order ID that will be marked as the
        parent of this order; if this key is not set, and this method is called from workflow code (even indirectly,
        by calling a service method that calls this method in the same thread as the call from workflow code), the
        new order will be loosely-coupled with the calling workflow order as the parent; to keep this from happening,
        set the value of this key to false

        @return a hash of workflow order information with the following keys:
        - \c workflow_instanceid (int): the workflow order instance ID
        - \c status: (String) the order status commit to the database (for possible values, see @ref StatusDescriptions)

        @see
        - @ref OMQ::UserApi::UserApi::execSynchronousWorkflow() "UserApi::execSynchronousWorkflow()"
        - exec_synchronous_workflow()
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> execSynchronousWorkflow(String name, String version, HashMap<String, Object> sdata, HashMap<String, Object> opts, HashMap<String, Object> ddata, int priority, HashMap<String, Object> orderkeys, String external_order_instanceid, int parent_workflow_instanceid) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("UserApi", "execSynchronousWorkflow", name, version, sdata, opts, ddata, priority, orderkeys, external_order_instanceid, parent_workflow_instanceid);
    }

    //! executes a workflow order synchronously and returns the final status and order ID in a hash
    /** @param name the workflow name; the latest version of the workflow will be used
        @param sdata the static data hash for the workflow order
        @param opts the options for the synchronous workflow execution instance
        @param ddata the optional initial dynamic data hash for the workflow order
        @param priority the order priority for the order
        @param orderkeys optional order keys for the order
        @param external_order_instanceid the optional external order instanceid for the order
        @param parent_workflow_instanceid: an optional loosely-coupled workflow order ID that will be marked as the
        parent of this order; if this key is not set, and this method is called from workflow code (even indirectly,
        by calling a service method that calls this method in the same thread as the call from workflow code), the
        new order will be loosely-coupled with the calling workflow order as the parent; to keep this from happening,
        set the value of this key to false

        @return a hash of workflow order information with the following keys:
        - \c workflow_instanceid (int): the workflow order instance ID
        - \c status: (String) the order status commit to the database (for possible values, see @ref StatusDescriptions)

        @see
        - @ref OMQ::UserApi::UserApi::execSynchronousWorkflow() "UserApi::execSynchronousWorkflow()"
        - exec_synchronous_workflow()
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> execSynchronousWorkflow(String name, HashMap<String, Object> sdata, HashMap<String, Object> opts, HashMap<String, Object> ddata, int priority, HashMap<String, Object> orderkeys, String external_order_instanceid, int parent_workflow_instanceid) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("UserApi", "execSynchronousWorkflow", name, null, sdata, opts, ddata, priority, orderkeys, external_order_instanceid, parent_workflow_instanceid);
    }

    //! executes a workflow order synchronously and returns the final status and order ID in a hash
    /** @param name the workflow name; the latest version of the workflow will be used
        @param sdata the static data hash for the workflow order
        @param opts the options for the synchronous workflow execution instance
        @param ddata the optional initial dynamic data hash for the workflow order
        @param priority the order priority for the order
        @param orderkeys optional order keys for the order
        @param external_order_instanceid the optional external order instanceid for the order

        @return a hash of workflow order information with the following keys:
        - \c workflow_instanceid (int): the workflow order instance ID
        - \c status: (String) the order status commit to the database (for possible values, see @ref StatusDescriptions)

        @see
        - @ref OMQ::UserApi::UserApi::execSynchronousWorkflow() "UserApi::execSynchronousWorkflow()"
        - exec_synchronous_workflow()
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> execSynchronousWorkflow(String name, HashMap<String, Object> sdata, HashMap<String, Object> opts, HashMap<String, Object> ddata, int priority, HashMap<String, Object> orderkeys, String external_order_instanceid) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("UserApi", "execSynchronousWorkflow", name, null, sdata, opts, ddata, priority, orderkeys, external_order_instanceid);
    }

    //! executes a workflow order synchronously and returns the final status and order ID in a hash
    /** @param name the workflow name; the latest version of the workflow will be used
        @param sdata the static data hash for the workflow order
        @param opts the options for the synchronous workflow execution instance
        @param ddata the optional initial dynamic data hash for the workflow order
        @param priority the order priority for the order
        @param orderkeys optional order keys for the order

        @return a hash of workflow order information with the following keys:
        - \c workflow_instanceid (int): the workflow order instance ID
        - \c status: (String) the order status commit to the database (for possible values, see @ref StatusDescriptions)

        @see
        - @ref OMQ::UserApi::UserApi::execSynchronousWorkflow() "UserApi::execSynchronousWorkflow()"
        - exec_synchronous_workflow()
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> execSynchronousWorkflow(String name, HashMap<String, Object> sdata, HashMap<String, Object> opts, HashMap<String, Object> ddata, int priority, HashMap<String, Object> orderkeys) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("UserApi", "execSynchronousWorkflow", name, null, sdata, opts, ddata, priority, orderkeys);
    }

    //! executes a workflow order synchronously and returns the final status and order ID in a hash
    /** @param name the workflow name; the latest version of the workflow will be used
        @param sdata the static data hash for the workflow order
        @param opts the options for the synchronous workflow execution instance
        @param ddata the optional initial dynamic data hash for the workflow order
        @param priority the order priority for the order

        @return a hash of workflow order information with the following keys:
        - \c workflow_instanceid (int): the workflow order instance ID
        - \c status: (String) the order status commit to the database (for possible values, see @ref StatusDescriptions)

        @see
        - @ref OMQ::UserApi::UserApi::execSynchronousWorkflow() "UserApi::execSynchronousWorkflow()"
        - exec_synchronous_workflow()
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> execSynchronousWorkflow(String name, HashMap<String, Object> sdata, HashMap<String, Object> opts, HashMap<String, Object> ddata, int priority) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("UserApi", "execSynchronousWorkflow", name, null, sdata, opts, ddata, priority);
    }

    //! executes a workflow order synchronously and returns the final status and order ID in a hash
    /** @param name the workflow name; the latest version of the workflow will be used
        @param sdata the static data hash for the workflow order
        @param opts the options for the synchronous workflow execution instance
        @param ddata the optional initial dynamic data hash for the workflow order

        @return a hash of workflow order information with the following keys:
        - \c workflow_instanceid (int): the workflow order instance ID
        - \c status: (String) the order status commit to the database (for possible values, see @ref StatusDescriptions)

        @see
        - @ref OMQ::UserApi::UserApi::execSynchronousWorkflow() "UserApi::execSynchronousWorkflow()"
        - exec_synchronous_workflow()
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> execSynchronousWorkflow(String name, HashMap<String, Object> sdata, HashMap<String, Object> opts, HashMap<String, Object> ddata) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("UserApi", "execSynchronousWorkflow", name, null, sdata, opts, ddata);
    }

    //! executes a workflow order synchronously and returns the final status and order ID in a hash
    /** @param name the workflow name; the latest version of the workflow will be used
        @param sdata the static data hash for the workflow order
        @param opts the options for the synchronous workflow execution instance

        @return a hash of workflow order information with the following keys:
        - \c workflow_instanceid (int): the workflow order instance ID
        - \c status: (String) the order status commit to the database (for possible values, see @ref StatusDescriptions)

        @see
        - @ref OMQ::UserApi::UserApi::execSynchronousWorkflow() "UserApi::execSynchronousWorkflow()"
        - exec_synchronous_workflow()
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> execSynchronousWorkflow(String name, HashMap<String, Object> sdata, HashMap<String, Object> opts) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("UserApi", "execSynchronousWorkflow", name, null, sdata, opts);
    }

    //! executes a workflow order synchronously and returns the final status and order ID in a hash
    /** @param name the workflow name; the latest version of the workflow will be used
        @param sdata the static data hash for the workflow order

        @return a hash of workflow order information with the following keys:
        - \c workflow_instanceid (int): the workflow order instance ID
        - \c status: (String) the order status commit to the database (for possible values, see @ref StatusDescriptions)

        @see
        - @ref OMQ::UserApi::UserApi::execSynchronousWorkflow() "UserApi::execSynchronousWorkflow()"
        - exec_synchronous_workflow()
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> execSynchronousWorkflow(String name, HashMap<String, Object> sdata) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("UserApi", "execSynchronousWorkflow", name, null, sdata);
    }

    //! returns the value of all system options
    /**
        @see
        - @ref OMQ::UserApi::UserApi::getQorusOptions() "UserApi::getQorusOptions()"
        - @ref get_qorus_options()
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getQorusOptions() throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("UserApi", "getQorusOptions");
    }

    //! returns the value of the given system option
    /**
        @see
        - @ref OMQ::UserApi::UserApi::getQorusOptions() "UserApi::getQorusOptions()"
        - @ref get_qorus_options()
    */
    static public Object getQorusOptions(String opt) throws Throwable {
        return QoreJavaApi.callStaticMethod("UserApi", "getQorusOptions", opt);
    }

    //! returns the value of the given system options
    /**
        @see
        - @ref OMQ::UserApi::UserApi::getQorusOptions() "UserApi::getQorusOptions()"
        - @ref get_qorus_options()
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getQorusOptions(String... opts) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("UserApi", "getQorusOptionsArggs", (Object[])opts);
    }

    //! returns the value of the given system options
    /**
        @see
        - @ref OMQ::UserApi::UserApi::getQorusOptionsArgs() "UserApi::getQorusOptionsArgs()"
        - @ref get_qorus_options_args()
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getQorusOptionsArgs(String[] opts) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("UserApi", "getQorusOptionsArgs", (Object[])opts);
    }

    //! returns a hash giving information about system options
    /**
        @see
        - @ref OMQ::UserApi::UserApi::getQorusOptionInfo() "UserApi::getQorusOptionInfo()"
        - @ref get_qorus_option_info()
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getQorusOptionInfo() throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("UserApi", "getQorusOptionInfo");
    }

    //! returns a hash giving information about system options
    /**
        @see
        - @ref OMQ::UserApi::UserApi::getQorusOptionInfoArgs() "UserApi::getQorusOptionInfoArgs()"
        - @ref get_qorus_option_info()
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getQorusOptionInfoArgs(String[] args) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("UserApi", "getQorusOptionInfoArgs", (Object[])args);
    }

    //! Returns information on all active jobs visible to the calling user
    /** If any active jobs are not accessible to the calling user, then they are filtered from the hash returned.
        @return a hash is keyed by job name; the hash values are job information hashes with the following keys:
        - \c jobid: the metadata jobid of the job type
        - \c name: the job name
        - \c version: the job version
        - \c description: the job description
        - \c trigger: a string describing the timer/trigger for the job
        - [\c job_instanceid]: the id of the job instance (will only have a value if the job is currently executing)
        - [\c last_executed]: the last executed date/time of the job (null if not yet executed)
        - [\c last_executed_job_instanceid]: the last executed instance id of the job
        - [\c expiry_date]: the expiry date of the job, if any; if this date is present, then the job will not run automatically after this date
        - \c single_instance: true if the job can only be run in a single Qorus instance, false if no such restriction is enabled
        - [\c next]: the next trigger date/time; this key is only included if the job is active
        - \c active: this value is always true because this API only returns information about active jobs

        @see
        - @ref OMQ::UserApi::UserApi::getActiveJobs() "UserApi::getActiveJobs()"
        - @ref get_active_jobs()
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getActiveJobs() throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("UserApi", "getActiveJobs");
    }

    //! Returns an object corresponding to a defined @ref userconn "user connection"
    /**
        @param name the name of the @ref userconn "connection"
        @param connect if false an unconnected object will be returned, otherwise the object is already connected
        @param register_dependency if true (the default) then if the connection is monitored as down, the calling interface will be temporarily disabled until the connection is up again
        @param rtopts any runtime options accepted by the connection

        @return the object representing the connection

        @throw CONNECTION-ERROR The given connection is not known

        @since Qorus 4.1.1 returns a native Java object for %Qore-based connections when possible

        @see
        - @ref OMQ::UserApi::UserApi::getUserConnection() "UserApi::getUserConnection()"
        - @ref get_user_connection()
    */
    static public Object getUserConnection(String name, boolean connect, boolean register_dependency, HashMap<String, Object> rtopts) throws Throwable {
        return doUserConnectionIntern(QoreJavaApi.callStaticMethodSave("UserApi", "getUserConnection", name, connect, register_dependency, rtopts));
    }

    //! Returns an object corresponding to a defined @ref userconn "user connection"
    /**
        @param name the name of the @ref userconn "connection"
        @param connect if false an unconnected object will be returned, otherwise the object is already connected
        @param register_dependency if true (the default) then if the connection is monitored as down, the calling interface will be temporarily disabled until the connection is up again

        @return the object representing the connection

        @throw CONNECTION-ERROR The given connection is not known

        @since Qorus 4.1.1 returns a native Java object for %Qore-based connections when possible

        @see
        - @ref OMQ::UserApi::UserApi::getUserConnection() "UserApi::getUserConnection()"
        - @ref get_user_connection()
    */
    static public Object getUserConnection(String name, boolean connect, boolean register_dependency) throws Throwable {
        return doUserConnectionIntern(QoreJavaApi.callStaticMethodSave("UserApi", "getUserConnection", name, connect, register_dependency));
    }

    //! Returns an object corresponding to a defined @ref userconn "user connection", establishing a dependency by default between the calling inteerface and the connection
    /**
        @param name the name of the @ref userconn "connection"
        @param connect if false an unconnected object will be returned, otherwise the object is already connected

        @return the object representing the connection

        @throw CONNECTION-ERROR The given connection is not known

        @since Qorus 4.1.1 returns a native Java object for %Qore-based connections when possible

        @see
        - @ref OMQ::UserApi::UserApi::getUserConnection() "UserApi::getUserConnection()"
        - @ref get_user_connection()
    */
    static public Object getUserConnection(String name, boolean connect) throws Throwable {
        return doUserConnectionIntern(QoreJavaApi.callStaticMethodSave("UserApi", "getUserConnection", name, connect));
    }

    //! Returns an object corresponding to a defined @ref userconn "user connection", performing an automatic connection to the target and establishing a dependency by default between the calling inteerface and the connection
    /**
        @param name the name of the @ref userconn "connection"

        @return the object representing the connection

        @throw CONNECTION-ERROR The given connection is not known

        @since Qorus 4.1.1 returns a native Java object for %Qore-based connections when possible

        @see
        - @ref OMQ::UserApi::UserApi::getUserConnection() "UserApi::getUserConnection()"
        - @ref get_user_connection()
    */
    static public Object getUserConnection(String name) throws Throwable {
        return doUserConnectionIntern(QoreJavaApi.callStaticMethodSave("UserApi", "getUserConnection", name));
    }

    //! Returns any tags set on the given @ref userconn "user connection"
    /**
        @param name the name of the @ref userconn "connection"

        @return any tags set on the given @ref userconn "user connection"

        @throw CONNECTION-ERROR The given connection is not known

        @see
        - getUserConnection()
        - @ref OMQ::UserApi::UserApi::getUserConnectionTags() "UserApi::getUserConnectionTags()"

        @since Qorus 4.0.3
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getUserConnectionTags(String name) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("UserApi", "getUserConnectionTags", name);
    }

    //! returns a @ref org.qore.lang.DatasourcePool "DatasourcePool" object for the given @ref dsconn "datasource" name
    /** @par Example:
        @code{.java}
        // acquiree a org.qore.lang.DatasourcePool object managing a weak reference to a Qore::SQL::DatasourcePool object
        org.qore.lang.DatasourcePool dsp = UserApi.getDatasourcePool(dspname, true);
        try {
            // ... use the pool
            // then release the connection back to the pool
            dsp.commit();
        } catch (Throwable e) {
            dsp.rollback();
        } finally {
            // release the weak reference to the Qore object
            dsp.release();
        }
        @endcode

        @param name the name of the @ref dsconn "datasource"
        @param register_dependency if true (the default) then if the connection is
        monitored as down, the calling interface will be temporarily disabled until the connection is up again

        @return a @ref org.qore.lang.DatasourcePool "DatasourcePool" object

        @throw DATASOURCE-ERROR unknown or system @ref dsconn "datasource"

        @note It is recommended to release the weak reference to the @ref org.qore.lang.DatasourcePool when done using
        it by calling @ref org.qore.lang.DatasourcePool.release() as in the example above, otherwise releasing the weak
        reference depends on Java object finalization, which is not deterministic.

        @see
        - @ref OMQ::UserApi::UserApi::getDatasourcePool() "UserApi::getDatasourcePool()"
        - @ref get_datasource_pool()
    */
    static public DatasourcePool getDatasourcePool(String name, boolean register_dependency) throws Throwable {
        QoreObject dsp = (QoreObject)QoreJavaApi.callStaticMethodSave("UserApi", "getDatasourcePool", name, register_dependency);
        return new DatasourcePool(dsp);
    }

    //! returns a @ref org.qore.lang.DatasourcePool "DatasourcePool" object for the given @ref dsconn "datasource" name; a dependency is created between the calling interface and the @ref dsconn "datasource"
    /** @par Example:
        @code{.java}
        // acquiree a org.qore.lang.DatasourcePool object managing a weak reference to a Qore::SQL::DatasourcePool object
        org.qore.lang.DatasourcePool dsp = UserApi.getDatasourcePool(dspname);
        try {
            // ... use the pool
            // then release the connection back to the pool
            dsp.commit();
        } catch (Throwable e) {
            dsp.rollback();
        } finally {
            // release the weak reference to the Qore object
            dsp.release();
        }
        @endcode

        @param name the name of the @ref dsconn "datasource"

        @return a @ref org.qore.lang.DatasourcePool "DatasourcePool" object

        @throw DATASOURCE-ERROR unknown or system @ref dsconn "datasource"

        @note It is recommended to release the weak reference to the @ref org.qore.lang.DatasourcePool when done using
        it by calling @ref org.qore.lang.DatasourcePool.release() as in the example above, otherwise releasing the weak
        reference depends on Java object finalization, which is not deterministic.

        @see
        - @ref OMQ::UserApi::UserApi::getDatasourcePool() "UserApi::getDatasourcePool()"
        - @ref get_datasource_pool()
    */
    static public DatasourcePool getDatasourcePool(String name) throws Throwable {
        QoreObject dsp = (QoreObject)QoreJavaApi.callStaticMethodSave("UserApi", "getDatasourcePool", name);
        return new DatasourcePool(dsp);
    }

    //! returns a hash of information for the given @ref dsconn "datasource", if known, otherwise throws an exception
    /** @param name the name of the @ref dsconn "datasource"

        @return a hash of information for the given @ref dsconn "datasource", if known, otherwise throws an exception; the following keys are returned in the hash:
        - \c name (string): the name of the @ref dsconn "datasource" connection (corresponding to the argument \a name)
        - \c type (string): \c datasource constant
        - \c url (string): a connection string
        - \c url_hash (hash): parsed connection string and options
          - \c type (string): driver name
          - \c user (string): the username for the @ref dsconn "datasource" connection, if any
          - \c pass (string): the password for the @ref dsconn "datasource" connection, if any
          - \c charset (string): the DB-specific character encoding for the @ref dsconn "datasource" connection
          - \c db (string): The database name of the @ref dsconn "datasource" connection
          - \c options (hash): an optional hash of options for the DBI driver for this @ref dsconn "datasource" connection; also \c "min" and \c "max" for the DatasourcePool minimum and maximum options
        - \c locked (bool): a flag indicating if the @ref dsconn "datasource" is locked or not (the system datasource \c "omq" is locked)
        - \c up (bool): a flag indicating if monitoring has discovered if the @ref dsconn "datasource" is up or not
        - \c desc (string): a string description of the @ref dsconn "datasource"
        - \c monitor (bool): a flag indicating if the @ref dsconn "datasource" is monitored or not
        - \c status (string): \c "OK" if the @ref dsconn "datasource" is up or an error string if the datasource is down; set by monitoring
        - \c last_check (date/time): the date and time of the last monitoring check
        - \c shared_pool (string): a string giving the pool state (only present if a pool has been initialized on the @ref dsconn "datasource")
        - \c deps (list): a list of hashes giving interface objects that depend on the connection; each entry is a hash with the following keys:
          - \c type: \c "WORKFLOW", \c "SERVICE", or \c "JOB"
          - \c workflowid: for workflows, gives the workflow ID
          - \c serviceid: for services, gives the service ID
          - \c jobid: for jobs, gives the job ID
          - \c name: the name of the workflow, service, or job
          - \c version: the version of the workflow, service, or job
          - \c desc: a string description of the object

        @throw DATASOURCE-ERROR unknown @ref dsconn "datasource"

        @see
        - @ref OMQ::UserApi::UserApi::getDatasourceInfo() "UserApi::getDatasourceInfo()"
        - @ref get_datasource_info()
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getDatasourceInfo(String name) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("UserApi", "getDatasourcePool", name);
    }

    //! Returns a new QorusSystemRestHelper object corresponding to a defined @ref remoteconn "Qorus remote connection"
    /**
        @param name the name of the @ref remoteconn "remote connection"
        @param connect if false an unconnected object will be returned, otherwise the object is already connected
        @param register_dependency if true (the default) then if the connection is monitored as down, the calling interface will be temporarily disabled until the connection is up again

        @return a new QorusSystemRestHelper object

        @throw GET-REMOTE-ERROR The given @ref remoteconn "connection" is not known

        @see
        - @ref OMQ::UserApi::UserApi::getRemoteRestConnection() "UserApi::getRemoteRestConnection()"
        - get_remote_rest_connection
    */
    static public QorusSystemRestHelper getRemoteRestConnection(String name, boolean connect, boolean register_dependency) throws Throwable {
        return new QorusSystemRestHelper((QoreObject)QoreJavaApi.callStaticMethodSave("UserApi", "getRemoteRestConnection", name, connect, register_dependency));
    }

    //! Returns a new QorusSystemRestHelper object corresponding to a defined @ref remoteconn "Qorus remote connection"; a dependency is established between the current interface and the @ref remoteconn "remote connection"
    /**
        @param name the name of the @ref remoteconn "remote connection"
        @param connect if false an unconnected object will be returned, otherwise the object is already connected

        @return a new QorusSystemRestHelper object

        @throw GET-REMOTE-ERROR The given @ref remoteconn "connection" is not known

        @see
        - @ref OMQ::UserApi::UserApi::getRemoteRestConnection() "UserApi::getRemoteRestConnection()"
        - get_remote_rest_connection
    */
    static public QorusSystemRestHelper getRemoteRestConnection(String name, boolean connect) throws Throwable {
        return new QorusSystemRestHelper((QoreObject)QoreJavaApi.callStaticMethodSave("UserApi", "getRemoteRestConnection", name, connect));
    }

    //! Returns a new QorusSystemRestHelper object corresponding to a defined @ref remoteconn "Qorus remote connection"; a dependency is established between the current interface and the @ref remoteconn "remote connection" and the connection is connected automatically
    /**
        @param name the name of the @ref remoteconn "remote connection"

        @return a new QorusSystemRestHelper object

        @throw GET-REMOTE-ERROR The given @ref remoteconn "connection" is not known

        @see
        - @ref OMQ::UserApi::UserApi::getRemoteRestConnection() "UserApi::getRemoteRestConnection()"
        - get_remote_rest_connection
    */
    static public QorusSystemRestHelper getRemoteRestConnection(String name) throws Throwable {
        return new QorusSystemRestHelper((QoreObject)QoreJavaApi.callStaticMethodSave("UserApi", "getRemoteRestConnection", name));
    }

    //! raises a transient system alert from a workflow, service, or job
    /**
        @param alert the name of the alert (ex: \c "DATA-SIZE-EXCEEDED")
        @param reason the reason or verbose description of the alert
        @param info optional key / value details for the alert

        @see
        - @ref OMQ::UserApi::UserApi::raiseTransientAlert() "UserApi::raiseTransientAlert()"
        - @ref raise_transient_alert()
    */
    static public void raiseTransientAlert(String alert, String reason, HashMap<String, Object> info) throws Throwable {
        QoreJavaApi.callStaticMethod("UserApi", "raiseTransientAlert", alert, reason, info);
    }

    //! raises a transient system alert from a workflow, service, or job
    /**
        @param alert the name of the alert (ex: \c "DATA-SIZE-EXCEEDED")
        @param reason the reason or verbose description of the alert

        @see
        - @ref OMQ::UserApi::UserApi::raiseTransientAlert() "UserApi::raiseTransientAlert()"
        - @ref raise_transient_alert()
    */
    static public void raiseTransientAlert(String alert, String reason) throws Throwable {
        QoreJavaApi.callStaticMethod("UserApi", "raiseTransientAlert", alert, reason);
    }

    //! returns a string giving the local system URL
    /** @param username the username for the new connection
        @param password the password for the new connection

        @return a string giving the local system URL

        @see
        - @ref OMQ::UserApi::UserApi::qorusGetLocalUrl() "UserApi::qorusGetLocalUrl()"
        - @ref qorus_get_local_url()
    */
    static public String qorusGetLocalUrl(String username, String password) throws Throwable {
        return (String)QoreJavaApi.callStaticMethod("UserApi", "qorusGetLocalUrl", username, password);
    }

    //! returns a string giving the local system URL
    /** @return a string giving the local system URL

        @see
        - @ref OMQ::UserApi::UserApi::qorusGetLocalUrl() "UserApi::qorusGetLocalUrl()"
        - @ref qorus_get_local_url()
    */
    static public String qorusGetLocalUrl() throws Throwable {
        return (String)QoreJavaApi.callStaticMethod("UserApi", "qorusGetLocalUrl");
    }

    //! Changes option values on a workflow, service, or job
    /** if called from workflow code, and the workflow has defined workflow options and an invalid option is passed to
        the method, an exception will be raised; however all other valid options in the hash will be set before the
        exception is raised.

        @param hash a hash of option-value pairs

        @throw WORKFLOW-OPTION-ERROR invalid option name

        @see @ref OMQ::UserApi::UserApi::setOption() "UserApi::setOption()"
    */
    static public void setOption(HashMap<String, Object> hash) throws Throwable {
        QoreJavaApi.callStaticMethod("UserApi", "setOption", hash);
    }

    //! Changes a single option value on a workflow, service, or job
    /** if called from workflow code, and the workflow has defined workflow options and an invalid option is passed to
        the method, an exception will be raised; however all other valid options in the hash will be set before the
        exception is raised.

        @param option the option to set
        @param value the value to set for the option

        @throw WORKFLOW-OPTION-ERROR invalid option name

        @see @ref OMQ::UserApi::UserApi::setOption() "UserApi::setOption()"
    */
    static public void setOption(String option, Object value) throws Throwable {
        HashMap<String, Object> opts = new HashMap<String, Object>() {
            {
                put(option, value);
            }
        };

        QoreJavaApi.callStaticMethod("UserApi", "setOption", opts);
    }

    //! Returns the value of the named workflow, service, or job option or options
    /** If the option is not set on the workflow, service, or job level (depending on the calling context) and it is a
        valid system option, then the value of the system option will be returned.

        @return a hash of option keys and values is returned; note that if called from a workflow and no arguments are
        passed to the method all workflow-level options are returned as a hash

        @note When called from workflow code, invalid options do not cause an errors to be raised; the associated key
        values in the hash returned will be null

        @see @ref OMQ::UserApi::UserApi::getOption() "UserApi::getOption()"
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getOption(String... keys) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethodArgs("UserApi", "getOption", keys);
    }

    //! Returns the value of the named workflow, service, or job option
    /** If the option is not set on the workflow, service, or job level (depending on the calling context) and it is a
        valid system option, then the value of the system option will be returned.

        @return the value of the requested option

        @note Invalid options do not cause an errors to be raised; the associated key values in the hash returned will
        be null

        @see @ref OMQ::UserApi::UserApi::getOption() "UserApi::getOption()"
    */
    static public Object getOption(String key) throws Throwable {
        return QoreJavaApi.callStaticMethod("UserApi", "getOption", key);
    }

    //! Returns the value of all workflow, service, or job options depending on the calling context
    /** @return all workflow, service, or job options are returned as a hash depending on the calling context

        @see @ref OMQ::UserApi::UserApi::getOption() "UserApi::getOption()"
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getOption() throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("UserApi", "getOption");
    }

    //! block the given workflow order data instance
    /** @param wfiid the workflow order instance ID to block

        @return a hash with the following key:
        - \c workflow_status: the status of the workflow order

        An exception will be thrown if the status is @ref OMQ.StatInProgress

        @throw BLOCK-WORKFLOW-ERROR invalid status, foreign session id, missing original status, uncancel operation already in progress

        @see
        - @ref OMQ::UserApi::UserApi::blockOrder() "UserApi::blockOrder()"
        - @ref block_order()
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> blockOrder(int wfiid) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("UserApi", "blockOrder", wfiid);
    }

    //! unblocks the given workflow order data instance
    /** @param wfiid the workflow order instance ID to unblock
        @param tempdata optional @ref tempdata "workflow order tempdata" to pass to the workflow order (will only be used if the order is immediately cached as a part of the unblock_order() call) (may be null)
        @param orderkeys optional workflow order data keys (may be null)

        @return a hash with the following key:
        - \c workflow_status: the status of the workflow order

        @throw BLOCK-WORKFLOW-ERROR invalid status, foreign session id, missing original status, uncancel operation already in progress

        @see
        - @ref OMQ::UserApi::UserApi::unblockOrder() "UserApi::unblockOrder()"
        - @ref unblock_order()
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> unblockOrder(int wfiid, HashMap<String, Object> tempdata, HashMap<String, Object> orderkeys) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("UserApi", "unblockOrder", wfiid, tempdata, orderkeys);
    }

    //! unblocks the given workflow order data instance
    /** @param wfiid the workflow order instance ID to unblock
        @param tempdata optional @ref tempdata "workflow order tempdata" to pass to the workflow order (will only be used if the order is immediately cached as a part of the unblock_order() call)

        @return a hash with the following key:
        - \c workflow_status: the status of the workflow order

        @throw BLOCK-WORKFLOW-ERROR invalid status, foreign session id, missing original status, uncancel operation already in progress

        @see
        - @ref OMQ::UserApi::UserApi::unblockOrder() "UserApi::unblockOrder()"
        - @ref unblock_order()
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> unblockOrder(int wfiid, HashMap<String, Object> tempdata) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("UserApi", "unblockOrder", wfiid, tempdata);
    }

        //! unblocks the given workflow order data instance
    /** @param wfiid the workflow order instance ID to unblock

        @return a hash with the following key:
        - \c workflow_status: the status of the workflow order

        @throw BLOCK-WORKFLOW-ERROR invalid status, foreign session id, missing original status, uncancel operation already in progress

        @see
        - @ref OMQ::UserApi::UserApi::unblockOrder() "UserApi::unblockOrder()"
        - @ref unblock_order()
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> unblockOrder(int wfiid) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("UserApi", "unblockOrder", wfiid);
    }

    //! cancel the given workflow order data instance
    /** @param wfiid the workflow order instance ID to cancel

        @return a hash with the following key:
        - \c workflow_status: the status of the workflow order

        An exception will be thrown if the status is @ref OMQ.StatInProgress

        @throw CANCEL-WORKFLOW-ERROR invalid status, foreign session id, missing original status, uncancel operation already in progress

        @see
        - @ref OMQ::UserApi::UserApi::cancelOrder() "UserApi::cancelOrder()"
        - @ref cancel_order()
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> cancelOrder(int wfiid) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("UserApi", "cancelOrder", wfiid);
    }

    //! uncancels the given workflow order data instance
    /** @param wfiid the workflow order instance ID to uncancel
        @param tempdata temporary data to provide when uncanceling the order

        @return a hash with the following key:
        - \c workflow_status: the status of the workflow order

        @throw CANCEL-WORKFLOW-ERROR invalid status, foreign session id, missing original status, uncancel operation already in progress

        @see
        - @ref OMQ::UserApi::UserApi::uncancelOrder() "UserApi::uncancelOrder()"
        - @ref uncancel_order()
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> uncancelOrder(int wfiid, HashMap<String, Object> tempdata) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("UserApi", "uncancelOrder", wfiid, tempdata);
    }

    //! uncancels the given workflow order data instance
    /** @param wfiid the workflow order instance ID to uncancel

        @return a hash with the following key:
        - \c workflow_status: the status of the workflow order

        @throw CANCEL-WORKFLOW-ERROR invalid status, foreign session id, missing original status, uncancel operation already in progress

        @see
        - @ref OMQ::UserApi::UserApi::uncancelOrder() "UserApi::uncancelOrder()"
        - @ref uncancel_order()
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> uncancelOrder(int wfiid) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("UserApi", "uncancelOrder", wfiid);
    }

    //! returns a hash for the current user context
    /** @par Example:
        @code{.java}
HashMap<String, Object> h = UserApi.getUserContextInfo();
        @endcode

        @return a hash describing the current user context or null if called outside a workflow, service, or job; hash keys are as follows:
        - when called in a service:
          - \c "type": \c "service"
          - \c "servicetype": the type of service (\c "user" or \c "system")
          - \c "name": the name of the service
          - \c "version": the version of the service
          - \c "id": the service id
          - \c "context_user": the current username context, if any
        - when called in a job:
          - \c "type": \c "job"
          - \c "name": the name of the job
          - \c "version": the version of the job
          - \c "id": the job id
          - \c "job_instanceid": the job_instanceid of the current job instance
          - \c "context_user": the current username context, if any
        - when called in a workflow:
          - \c "type": \c "workflow"
          - \c "name": the name of the workflow
          - \c "version": the version of the workflow
          - \c "id": the workflow id
          - \c "workflow_instanceid": the workflow_instanceid of the current workflow instance (if available)
          - \c "stepname": the name of the current step (if available)
          - \c "stepversion": the version of the current step (if available)
          - \c "stepid": the id of the current step (if available)
          - \c "ind": the name of the current step index (if available)
          - \c "execid": the execution ID of the current workflow execution instance (if available)
          - \c "context_user": the current username context, if any

        @see
        - @ref OMQ::UserApi::UserApi::getUserContextInfo() "UserApi::getUserContextInfo()"
        - @ref get_user_context_info()

        @since Qorus 4.1 added the \a context_user key
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getUserContextInfo() throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("UserApi", "getUserContextInfo");
    }

    //! returns the current username for any external user-initiated call or @ref nothing if executing in a system context
    /** @return the current username for any external user-initiated call or @ref nothing if executing in a system context

        @since Qorus 4.1
    */
    static public String getContextUserName() throws Throwable {
        return (String)QoreJavaApi.callStaticMethod("UserApi", "getContextUserName");
    }

    //! returns the data provider given by a path string
    /** @par Example:
        @code{.java}
AbstractDataProvider d = UserApi.getDataProvider("connection/rest-billing-1/accounts/POST");
        @endcode

        @param path the path to the dataprovider; the first element must be one of the following:
        - \c connection: for @ref userconn "user connections"
        - \c datasource: for @ref dsconn "datasources"
        - \c remote: for Qorus @ref remoteconn "remote connections"
        .
        The second element should be the name of the connection, and further elements should be the path to the data
        provider.

        @throw DATA-PROVIDER-ERROR the given data provider is unknown

        @see OMQ::UserApi::UserApi::getDataProvider() "UserApi::getDataProvider()"

        @since Qorus 4.1
    */
    static public AbstractDataProvider getDataProvider(String path) throws Throwable {
        return new AbstractDataProvider((QoreObject)QoreJavaApi.callStaticMethodSave("UserApi", "getDataProvider", path));
    }

    //! returns a data provider type identified by a path string
    /** @par Example:
        @code{.java}
AbstractDataProviderType type = UserApi.getTypeFromPath("type/qore/ftp/event");
        @endcode

        @param path the path to the type; the first element must be one of the following:
        - \c type: indicates that the rest of the path identifies a registered data provider type
        - \c connection: indicates that the following path element identifies a @ref userconn "user connection"
        - \c datasource: indicates that the following path element identifies a @ref dsconn "datasource"
        - \c remote: indicates that the following path element identifies a Qorus @ref remoteconn "remote connection"
        .
        For type paths in data providers (i.e. \c connection, \c datasource, and \c remote), the path element after
        the provider must be one of the following:
        - \c request: for the request type
        - \c response: for the response type
        - \c error: for the error response type, in which case the next path element provides the error code
        - \c record: for the record type

        @throw DATA-TYPE-ERROR the given type is unknown

        @since Qorus 4.1.1
    */
    static public AbstractDataProviderType getTypeFromPath(String path) throws Throwable {
        return new AbstractDataProviderType((QoreObject)QoreJavaApi.callStaticMethodSave("UserApi", "getTypeFromPath", path));
    }

    //! returns the value of the given configuration item on global level; throws an exception if there is no value on global level for the configuration item
    /** @param item the name of the configuration item to retrieve the value
        @param local_context local context supplied by the caller (plus user context info is added - see
                             @ref UserApi.getUserContextInfo() method)
        @param expand_complex_values if true then lists and hashes will have their string values expanded recursively

        @return the value of the given configuration item on global level

        @throw CONFIG-ITEM-ERROR thrown if the configuration item is not valid

        @since Qorus 4.1.1
    */
    static public Object getGlobalConfigItemValue(String item, HashMap<String, Object> local_context,
                                                  boolean expand_complex_values) throws Throwable {
        return QoreJavaApi.callStaticMethod("UserApi", "getGlobalConfigItemValue", item, local_context, expand_complex_values);
    }

    //! returns the value of the given configuration item on global level; throws an exception if there is no value on global level for the configuration item
    /** @param item the name of the configuration item to retrieve the value
        @param local_context local context supplied by the caller (plus user context info is added - see
                             @ref UserApi.getUserContextInfo() method)

        @return the value of the given configuration item on global level

        @throw CONFIG-ITEM-ERROR thrown if the configuration item is not valid

        @since Qorus 4.1.1
    */
    static public Object getGlobalConfigItemValue(String item, HashMap<String, Object> local_context) throws Throwable {
        return QoreJavaApi.callStaticMethod("UserApi", "getGlobalConfigItemValue", item, local_context);
    }

    //! returns the value of the given configuration item on global level; throws an exception if there is no value on global level for the configuration item
    /** @param item the name of the configuration item to retrieve the value

        @return the value of the given configuration item on global level

        @throw CONFIG-ITEM-ERROR thrown if the configuration item is not valid

        @since Qorus 4.0.3
    */
    static public Object getGlobalConfigItemValue(String item) throws Throwable {
        return QoreJavaApi.callStaticMethod("UserApi", "getGlobalConfigItemValue", item);
    }

    //! returns the given mapper if registered for the current interface
    /** @par Example:
        @code{.java}
Mapper m = UserApi.getMapper("my_mapper");
        @endcode

        @param name the name of the mapper
        @param rtopts any runtime options accepted by the mapper

        @throw MAPPER-ERROR the given mapper is unknown or not registered to the current interface

        @see
        - @ref OMQ::UserApi::UserApi::getMapper() "UserApi::getMapper()"
        - @ref get_mapper()
        - @ref mappers
        - @ref mapper-devel
    */
    static public Mapper getMapper(String name, HashMap<String, Object> rtopts) throws Throwable {
        return getMapperIntern((QoreObject)QoreJavaApi.callStaticMethodSave("UserApi", "getMapper", name, rtopts));
    }

        //! returns the given mapper if registered for the current interface
    /** @par Example:
        @code{.java}
Mapper m = UserApi.getMapper("my_mapper");
        @endcode

        @param name the name of the mapper

        @throw MAPPER-ERROR the given mapper is unknown or not registered to the current interface

        @see
        - @ref OMQ::UserApi::UserApi::getMapper() "UserApi::getMapper()"
        - @ref get_mapper()
        - @ref mappers
        - @ref mapper-devel
    */
    static public Mapper getMapper(String name) throws Throwable {
        return getMapperIntern((QoreObject)QoreJavaApi.callStaticMethodSave("UserApi", "getMapper", name));
    }

    //! posts a workflow synchronization event given the event type name and the unique event key
    /** @par Example:
        @code{.java}
        UserApi.postSyncEvent(type, key);
        @endcode

        @param eventtype the event type name
        @param eventkey the event key in the event type queue to post

        @return true if the event was posted for the first time, false if the event had already been posted beforehand

        @throw UNKNOWN-EVENT unknown event type name

        @see
        - @ref OMQ::UserApi::UserApi::postSyncEvent() "UserApi::postSyncEvent()"
        - @ref post_sync_event()
        - @ref eventsteps
        - @ref rest_api_PUT_latest_sync-events__type___key__post
    */
    static public boolean postSyncEvent(String eventtype, String eventkey) throws Throwable {
        return (boolean)QoreJavaApi.callStaticMethod("UserApi", "postSyncEvent", eventtype, eventkey);
    }

    //! returns the current Qorus application session ID
    /** @return the current Qorus application session ID

        @see @ref appsessionmodel for more information about the session ID

        @see
        - @ref OMQ::UserApi::UserApi::getSessionId() "UserApi::getSessionId()"
        - @ref get_session_id()
    */
    static public int getSessionId() throws Throwable {
        return (int)QoreJavaApi.callStaticMethod("UserApi", "getSessionId");
    }

    //! returns a hash of system info
    /** @return a hash of system info with the following keys:
        - \c instance-key: value of the system option by the same name
        - \c session-id: the session ID for the current Qorus application session
        - \c omq-version: the version string for the Qorus server
        - \c omq-version-code: a numeric code of the Qorus server version, where @code{.py} major = (x / 10000), minor = (x / 100) % 100, sub = x % 100 @endcode this value is suitable for comparisons (ex: for Qorus 2.6.0, \c omq-version-code = 20600) <!-- % -->
        - \c qore-version: the version string for the qore build used
        - \c datamodel-version: the datamodel version required by this version of Qorus
        - \c omq-schema: the datasource string for the system schema (without the password)
        - \c omquser-schema: the datasource string for the user schema (without the password)
        - \c starttime: the date and time when the instance was started
        - \c hostname: the hostname of the machine where the Qorus server is running
        - \c pid: the PID of the Qorus server process
        - \c threads: number of threads currently active
        - \c schema-properties: a hash of schema properties with the following keys:
        - \c omq-schema-version
        - \c omq-schema-compatibility
        - \c omq-load-schema-compatibility
        - \c logfile: the path for the system log file

        @see
        - @ref OMQ::UserApi::UserApi::getSystemInfo() "UserApi::getSystemInfo()"
        - @ref get_system_info()
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getSystemInfo() throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("UserApi", "getSystemInfo");
    }

    //! returns a hash of all system properties in all domains
    /** @par Example:
        @code{.java}
HashMap<String, Object> h = UserApi.propGet();
        @endcode

        @return a hash of all system properties in all domains; the top-level keys are domain keys which have as values hashes with all key-value pairs set in the domain

        @see
        - @ref OMQ::UserApi::UserApi::propGet() "UserApi::propGet()"
        - @ref prop_get()
        - @ref propUpdate()
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> propGet() throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("UserApi", "propGet");
    }

    //! returns a hash of all key-value pairs in the given domain or null if the system property domain does not exist
    /** @par Example:
        @code{.java}
HashMap<String, Object> h = UserApi.propGet(domain);
        @endcode

        @return a hash of all key-value pairs in the given domain or null if the system property domain does not exist

        @see
        - @ref OMQ::UserApi::UserApi::propGet() "UserApi::propGet()"
        - @ref prop_get()
        - @ref propUpdate()
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> propGet(String domain) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("UserApi", "propGet", domain);
    }

    //! returns the value of the given system property key in the given domain or null if the system property does not exist
    /** @par Example:
        @code{.java}
Object val = propGet(domain, key);
        @endcode

        @return the value of the given system property key in the given domain

        @see
        - @ref OMQ::UserApi::UserApi::propGet() "UserApi::propGet()"
        - @ref prop_get()
        - @ref propUpdate()
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> propGet(String domain, String key) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("UserApi", "propGet", domain, key);
    }

    //! changes (inserts, updates, or deletes) the value of a single system property
    /** @par Example:
        @code{.java}
        UserApi.propUpdate(domain, key, val);
        @endcode

        Updates the value of the property in the domain passed.  If the property does not exist, then it is created.
        If the value is null, then the property will be deleted.
        Changes are committed to the database and the internal cache before the method call returns.
        No changes may be made in the system \c "omq" domain.

        @param domain the domain of the property to set
        @param key the key to set
        @param value the value to set in the property domain; if null is passed here, and the property exists, it will be deleted

        @return the action code, \c "INSERT", \c "UPDATE", \c "DELETE", \c "IGNORED" (if a non-existent key should be deleted)

        @throw PARAMETER-ERROR if the domain or key arguments are empty strings
        @throw PROP-ERROR serialized value exceeds 240 characters (column limit)
        @throw UPDATE-ERROR changes attempted in the \c "omq" domain

        @see
        - @ref OMQ::UserApi::UserApi::propUpdate() "UserApi::propUpdate()"
        - @ref prop_update()
        - @ref propGet()
     */
    static public String propUpdate(String domain, String key, Object value) throws Throwable {
        return (String)QoreJavaApi.callStaticMethod("UserApi", "propUpdate", domain, key, value);
    }

    //! Writes the information passed to the workflow, service, job, or system log file depending on the calling context if the interface logger level is equal or lower
    /**
        @param msg the message to log

        @see
        - @ref OMQ::UserApi::UserApi::logFatal() "UserApi::logFatal()"
    */
    static public void logFatal(String msg) throws Throwable{
        QoreJavaApi.callStaticMethod("UserApi", "logFatal", msg);
    }

    //! Writes the information passed to the workflow, service, job, or system log file depending on the calling context if the interface logger level is equal or lower
    /**
        @param msg the message to log

        @see
        - @ref OMQ::UserApi::UserApi::logError() "UserApi::logError()"
    */
    static public void logError(String msg) throws Throwable{
        QoreJavaApi.callStaticMethod("UserApi", "logError", msg);
    }

    //! Writes the information passed to the workflow, service, job, or system log file depending on the calling context if the interface logger level is equal or lower
    /**
        @param msg the message to log

        @see
        - @ref OMQ::UserApi::UserApi::logWarn() "UserApi::logWarn()"
    */
    static public void logWarn(String msg) throws Throwable{
        QoreJavaApi.callStaticMethod("UserApi", "logWarn", msg);
    }

    //! Writes the information passed to the workflow, service, job, or system log file depending on the calling context if the interface logger level is equal or lower
    /**
        @param msg the message to log

        @see
        - @ref OMQ::UserApi::UserApi::logInfo() "UserApi::logInfo()"
    */
    static public void logInfo(String msg) throws Throwable{
        QoreJavaApi.callStaticMethod("UserApi", "logInfo", msg);
    }

    //! Writes the information passed to the workflow, service, job, or system log file depending on the calling context if the interface logger level is equal or lower
    /**
        @param msg the message to log

        @see
        - @ref OMQ::UserApi::UserApi::logDebug() "UserApi::logDebug()"
    */
    static public void logDebug(String msg) throws Throwable{
        QoreJavaApi.callStaticMethod("UserApi", "logDebug", msg);
    }

    //! Writes the information passed to the workflow, service, job, or system log file depending on the calling context if the interface logger level is equal or lower
    /**
        @param msg the message to log

        @see
        - @ref OMQ::UserApi::UserApi::logTrace() "UserApi::logTrace()"
    */
    static public void logTrace(String msg) throws Throwable{
        QoreJavaApi.callStaticMethod("UserApi", "logTrace", msg);
    }

    //! Writes the information passed to the workflow, service, job, or system log file depending on the calling context if the interface logger level is equal or lower
    /**
        @param msg the message to log
        @param args arguments to the format placeholders in \a msg

        @see
        - @ref OMQ::UserApi::UserApi::logFatal() "UserApi::logFatal()"
    */
    static public void logFatal(String msg, Object... args) throws Throwable{
        QoreJavaApi.callStaticMethod("UserApi", "logArgsFatal", msg, args);
    }

    //! Writes the information passed to the workflow, service, job, or system log file depending on the calling context if the interface logger level is equal or lower
    /**
        @param msg the message to log
        @param args arguments to the format placeholders in \a msg

        @see
        - @ref OMQ::UserApi::UserApi::logError() "UserApi::logError()"
    */
    static public void logError(String msg, Object... args) throws Throwable{
        QoreJavaApi.callStaticMethod("UserApi", "logArgsError", msg, args);
    }

    //! Writes the information passed to the workflow, service, job, or system log file depending on the calling context if the interface logger level is equal or lower
    /**
        @param msg the message to log
        @param args arguments to the format placeholders in \a msg

        @see
        - @ref OMQ::UserApi::UserApi::logWarn() "UserApi::logWarn()"
    */
    static public void logWarn(String msg, Object... args) throws Throwable{
        QoreJavaApi.callStaticMethod("UserApi", "logArgsWarn", msg, args);
    }

    //! Writes the information passed to the workflow, service, job, or system log file depending on the calling context if the interface logger level is equal or lower
    /**
        @param msg the message to log
        @param args arguments to the format placeholders in \a msg

        @see
        - @ref OMQ::UserApi::UserApi::logInfo() "UserApi::logInfo()"
    */
    static public void logInfo(String msg, Object... args) throws Throwable{
        QoreJavaApi.callStaticMethod("UserApi", "logArgsInfo", msg, args);
    }

    //! Writes the information passed to the workflow, service, job, or system log file depending on the calling context if the interface logger level is equal or lower
    /**
        @param msg the message to log
        @param args arguments to the format placeholders in \a msg

        @see
        - @ref OMQ::UserApi::UserApi::logDebug() "UserApi::logDebug()"
    */
    static public void logDebug(String msg, Object... args) throws Throwable{
        QoreJavaApi.callStaticMethod("UserApi", "logArgsDebug", msg, args);
    }

    //! Writes the information passed to the workflow, service, job, or system log file depending on the calling context if the interface logger level is equal or lower
    /**
        @param msg the message to log
        @param args arguments to the format placeholders in \a msg

        @see
        - @ref OMQ::UserApi::UserApi::logTrace() "UserApi::logTrace()"
    */
    static public void logTrace(String msg, Object... args) throws Throwable{
        QoreJavaApi.callStaticMethod("UserApi", "logArgsTrace", msg, args);
    }

    //! returns the next sequence value for the given datasource and sequence
    /** @par Example:
        @code{.java}
        int val = UserApi.getNextSequenceValue(ds, seqnem);
        @endcode

        @param ds the datasource to retrieve the sequence from
        @param name the name of the sequence

        @return the next value of the sequence

        @see @ref OMQ::UserApi::UserApi::getNextSequenceValue() "UserApi::getNextSequenceValue()"
    */
    static public int getNextSequenceValue(AbstractDatasource ds, String name) throws Throwable {
        return (int)QoreJavaApi.callStaticMethod("UserApi", "getNextSequenceValue", ds.getQoreObject(), name);
    }

    //! returns the next sequence value for the given datasource and sequence
    /** @par Example:
        @code{.java}
        int val = UserApi.getNextSequenceValue(ds, seqnem);
        @endcode

        @param ds the @ref dsconn "datasource name" to retrieve the sequence from; a pool corresponding to the
        datasource will be used to retrieve the sequence
        @param name the name of the sequence

        @return the next value of the sequence

        @see @ref OMQ::UserApi::UserApi::getNextSequenceValue() "UserApi::getNextSequenceValue()"
    */
    static public int getNextSequenceValue(String ds, String name) throws Throwable {
        return (int)QoreJavaApi.callStaticMethod("UserApi", "getNextSequenceValue", ds, name);
    }

    //! returns a string giving the default serialization of the given data structure for storage in Qorus
    /** the default serialization is currently YAML

        @param d the data to serialize

        @return a YAML string representing the given data structure for storage in Qorus, in case the given data is NOTHING
        an empty string is returned

        @see
        - @ref OMQ::UserApi::UserApi::serializeQorusData() "UserApi::serializeQorusData()"
        - serialize_qorus_data()
        - @ref OMQ::UserApi::UserApi::serializeQorusData() "UserApi::serializeQorusData()"
    */
    static public String serializeQorusData(Object d) throws Throwable {
        return (String)QoreJavaApi.callStaticMethod("UserApi", "serializeQorusData", d);
    }

    //! returns a string giving the default serialization of the given data structure for storage in Qorus
    /** the default serialization is currently YAML

        @param d the data to serialize

        @return a YAML string representing the given data structure for storage in Qorus

        @see
        - serialize_qorus_data()
        - deserializeQorusData()
    */
    static public String serializeQorusDataWithNothing(Object d) throws Throwable {
        return (String)QoreJavaApi.callStaticMethod("UserApi", "serializeQorusDataWithNothing", d);
    }

    //! parses a serialized data string and returns the corresponding data
    /**
        @param data the string data to deserialize

        @return the %Qore data represented by the string argument

        @see
        - @ref OMQ::UserApi::UserApi::deserializeQorusData() "UserApi::deserializeQorusData()"
        - deserialize_qorus_data()
        - @ref OMQ::UserApi::UserApi::deserializeQorusData() "UserApi::deserializeQorusData()"
    */
    static public Object deserializeQorusData(String data) throws Throwable {
        return QoreJavaApi.callStaticMethod("UserApi", "deserializeQorusData", data);
    }

    //! returns a string error message if any exception in the chain passed was caused by a recoverable DB error, otherwise returns @ref nothing "NOTHING"
    /** @param driver the database driver name, which must be a driver supported by the Qorus system schema, currently one of \c "oracle", \c "pgsql", or \c "mysql", otherwise an \c UNSUPPORTED-DRIVER exception is thrown
        @param ex the exception hash

        @return a string error message if any exception in the chain passed was caused by a recoverable DB error, otherwise returns @ref nothing "NOTHING"

        @throw UNSUPPORTED-DRIVER only \c "oracle", \c "pgsql", and \c "mysql" are currently supported

        @see
        - @ref OMQ::UserApi::UserApi::restartTransaction() "UserApi::restartTransaction()"
    */
    static public String restartTransaction(String driver, HashMap<String, Object> ex) throws Throwable {
        return (String)QoreJavaApi.callStaticMethod("UserApi", "restartTransaction", driver, ex);
    }

    static private Mapper getMapperIntern(QoreObject mapper) throws Throwable {
        if (mapper.instanceOf("InbounbIdentityTableMapper")) {
            return new InboundIdentityTableMapper(mapper);
        }
        if (mapper.instanceOf("InboundTableMapper")) {
            return new InboundTableMapper(mapper);
        }
        if (mapper.instanceOf("RawSqlStatementOutboundMapper")) {
            return new RawSqlStatementOutboundMapper(mapper);
        }
        if (mapper.instanceOf("SqlStatementOutboundMapper")) {
            return new SqlStatementOutboundMapper(mapper);
        }
        if (mapper.instanceOf("AbstractSqlStatementOutboundMapper")) {
            return new AbstractSqlStatementOutboundMapper(mapper);
        }
        return new Mapper(mapper);
    }

    //! expands one variable in a templated string
    /** @param str templated string to be expanded; see @ref bb_template_strings for the format of this string
        @param var_context context of the variable to be expanded (e.g. local, static, dynamic, keys,...)
        @param var_name name of the variable to be expanded
        @param local_context local context supplied by the caller (plus user context info is added - see
                             @ref UserApi.getUserContextInfo() method)
        @param expand_complex_values if true then lists and hashes will have their string values expanded recursively

        @return modified string with the specified template variable already expanded

        @throw NOT-WF-CONTEXT-ERROR if WF specific context (e.g. static) variable is specified to be expanded
        @throw UNSUPPORTED-CONTEXT-ERROR if an unknown context variable is specified to be expanded
        @throw UNKNOWN-VALUE-ERROR if the variable doesn't have a value in the specified context

        @see @ref bb_template_strings for information on template variable expansion
    */
    public static String expandOneVariable(String str, String var_context, String var_name,
                                           HashMap<String, Object> local_context,
                                           boolean expand_complex_values) throws Throwable {
        return (String)QoreJavaApi.callStaticMethod("UserApi", "expandOneVariable", str, var_context, var_name,
                                                    local_context, expand_complex_values);
    }

    //! expands one variable in a templated string
    /** @param str templated string to be expanded; see @ref bb_template_strings for the format of this string
        @param var_context context of the variable to be expanded (e.g. local, static, dynamic, keys,...)
        @param var_name name of the variable to be expanded
        @param local_context local context supplied by the caller (plus user context info is added - see
                             @ref UserApi.getUserContextInfo() method)

        @return modified string with the specified template variable already expanded

        @throw NOT-WF-CONTEXT-ERROR if WF specific context (e.g. static) variable is specified to be expanded
        @throw UNSUPPORTED-CONTEXT-ERROR if an unknown context variable is specified to be expanded
        @throw UNKNOWN-VALUE-ERROR if the variable doesn't have a value in the specified context

        @see @ref bb_template_strings for information on template variable expansion
    */
    public static String expandOneVariable(String str, String var_context, String var_name,
                                           HashMap<String, Object> local_context) throws Throwable {
        return (String)QoreJavaApi.callStaticMethod("UserApi", "expandOneVariable", str, var_context, var_name,
                                                    local_context);
    }

    //! expands all variables in a templated string
    /** @param str templated string to be expanded; see @ref bb_template_strings for the format of template variable
        references in this string
        @param local_context local context supplied by the caller (plus user context info is added - see
                             @ref UserApi::getUserContextInfo() method)
        @param expand_complex_values if true then lists and hashes will have their string values expanded recursively

        @return the value of the string as substituted with all variables expanded

        @throw NOT-WF-CONTEXT-ERROR if WF specific context (e.g. static) variable is specified to be expanded
        @throw UNSUPPORTED-CONTEXT-ERROR if an unknown context variable is specified to be expanded
        @throw UNKNOWN-VALUE-ERROR if the variable doesn't have a value in the specified context
        @throw FORMAT-ERROR if the templated string doesn't have correct format (e.g. unescaped dollar sign that does
                            not represent a variable)

        @see @ref bb_template_strings for information on template variable expansion
    */
    public static Object expandTemplatedValue(String str, HashMap<String, Object> local_context,
                                              boolean expand_complex_values) throws Throwable {
        return QoreJavaApi.callStaticMethod("UserApi", "expandTemplatedValue", str, local_context,
                                            expand_complex_values);
    }

    //! expands all variables in a templated string
    /** @param str templated string to be expanded; see @ref bb_template_strings for the format of template variable
        references in this string
        @param local_context local context supplied by the caller (plus user context info is added - see
                             @ref UserApi::getUserContextInfo() method)

        @return the value of the string as substituted with all variables expanded

        @throw NOT-WF-CONTEXT-ERROR if WF specific context (e.g. static) variable is specified to be expanded
        @throw UNSUPPORTED-CONTEXT-ERROR if an unknown context variable is specified to be expanded
        @throw UNKNOWN-VALUE-ERROR if the variable doesn't have a value in the specified context
        @throw FORMAT-ERROR if the templated string doesn't have correct format (e.g. unescaped dollar sign that does
                            not represent a variable)

        @see @ref bb_template_strings for information on template variable expansion
    */
    public static Object expandTemplatedValue(String str, HashMap<String, Object> local_context) throws Throwable {
        return QoreJavaApi.callStaticMethod("UserApi", "expandTemplatedValue", str, local_context);
    }

    //! parses one template variable and returns a hash with its parts
    /** @param str templated string to be parsed (has to contain exactly one variable and nothing more); see
        @ref bb_template_strings for the format of this string

        @return BbVariable hash representing the variable

        @throw FORMAT-ERROR if the templated string doesn't have correct format

        @see @ref bb_template_strings for information on template variable expansion
    */
    @SuppressWarnings("unchecked")
    public static HashMap<String, Object> bbParseExactlyOneVariable(String str) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("UserApi", "bbParseExactlyOneVariable", str);
    }

    //! returns specified input data field's value
    /** @param field_name name of the field that should be returned; identifies a key in \a input_data_cfg
        @param local_context the caller can supply its \c "$local:" context for template variables (plus user context
                             info is added - see @ref UserApi.getUserContextInfo()); hash values are subject
                             to recursive template variable expansion
        @param input_data_cfg input data configuration; if not provided, the default location for the input data
                              config is retrieved from configuration item \c "input_data";
                              \a field_name must be present in this hash; string values of the key referenced with
                              \a field_name in this hash are subject to recursive template variable expansion, and the
                              resulting value is returned; non-string values are returned as-is

        @return the value of the key given by \a field_name in the \a input_data_cfg hash is subject to recursive template
        variable expansion and returned; template variable expansion is performed if the hash value is a string, if the
        value is any other data type, it is returned as-is

        @throw NOT-WF-CONTEXT-ERROR if WF specific context (e.g. static) variable is specified to be expanded
        @throw UNSUPPORTED-CONTEXT-ERROR if an unknown context variable is specified to be expanded
        @throw UNKNOWN-VALUE-ERROR if the variable doesn't have a value in the specified context
        @throw SENSITIVE-DATA-FORMAT-ERROR if the \c "$sensitive:<skey>.<svalue>.field-ref..." value or
        \c "$sensitive-alias:<alias>.field-ref..." template string does not have the required format
        @throw INVALID-ARGUMENT if the field_name is not present in input data

        @see @ref bb_template_strings for information on template variable expansion
    */
    @SuppressWarnings("unchecked")
    public static HashMap<String, Object> getInputData(String field_name, HashMap<String, Object> local_context,
                               HashMap<String, Object> input_data_cfg) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("UserApi", "getInputData", field_name, local_context, input_data_cfg);
    }

    //! returns all input data
    /** @param local_context the caller can supply its \c "$local:" context for template variables (plus user context
                             info is added - see @ref UserApi.getUserContextInfo()); hash values are subject
                             to recursive template variable expansion
        @param input_data_cfg input data configuration; if not provided, the default location for the input data
                              config is retrieved from configuration item \c "input_data"

        @return the entire input data hash with all string hash values subject to recursive template variable
        expansion; input data hash values that are not strings are returned as-is

        @throw NOT-WF-CONTEXT-ERROR if WF specific context (e.g. static) variable is specified to be expanded
        @throw UNSUPPORTED-CONTEXT-ERROR if an unknown context variable is specified to be expanded
        @throw UNKNOWN-VALUE-ERROR if the variable doesn't have a value in the specified context
        @throw SENSITIVE-DATA-FORMAT-ERROR if the \c "$sensitive:<skey>.<svalue>.field-ref..." value or
        \c "$sensitive-alias:<alias>.field-ref..." template string does not have the required format

        @since Qorus 4.0.3
    */
    @SuppressWarnings("unchecked")
    public static HashMap<String, Object> getInputData(HashMap<String, Object> input_data_cfg,
                                                HashMap<String, Object> local_context) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("UserApi", "getInputData", input_data_cfg,
                                                                     local_context);
    }

    //! updates output data with the given configuration
    /** @param field_name name of the field that should be updated; identifies a key in \a output_data_cfg that
        provides the location for writing the output data
        @param output_data the value to write in the location determined by the \a field_name key in
        \a output_data_cfg
        @param output_data_cfg a hash of values giving output data locations; if not provided, the default location
        for the output data config is retrieved from configuration item \c "output_data";
        \a field_name must be present in this hash; string values of the key referenced with \a field_name in this
        hash provide the location to write \a output_data and are not subject to template variable expansion

        For a list of supported output fields for \a output_data_cfg values; see template strings listed in
        @ref bb_template_strings marked as writable (\c W)

        @throw UNSUPPORTED-CONTEXT-ERROR if output data configuration specifies an unsupported context
        @throw OUTPUT-CONFIG-ERROR \a field_name is not present in \a output_data_cfg
        @throw SENSITIVE-DATA-FORMAT-ERROR if the \c "$sensitive:<skey>.<svalue>.field-ref..." value or
        \c "$sensitive-alias:<alias>.field-ref..." template string does not have the required format
        @throw SET-ORDER-KEYS-ERROR missing value for order key
        @throw INVALID-WORKFLOW-KEY workflow key not valid for the current workflow
        @throw DUPLICATE-KEY-VALUE duplicate value provided for order key

        @see
        - @ref UserApi::updateOutputData()
        - @ref bb_template_strings

        @since Qorus 4.0.3
    */
    public static void updateOutputData(String field_name, Object output_data,
                                 HashMap<String, Object> output_data_cfg) throws Throwable {
        QoreJavaApi.callStaticMethod("UserApi", "updateOutputData", field_name, output_data, output_data_cfg);
    }

    //! updates all output data
    /** @param all_output_data a hash giving output data; keys in this hash must match a corresponding key in
        \a output_data_cfg which will provide the location for writing the value, values in this hash will be written
        to the locations provided in \a output_data_cfg
        @param output_data_cfg a hash of values giving output data locations; if not provided, the default location
        for the output data config is retrieved from configuration item \c "output_data";
        all keys in \a all_output_data must also be present in this hash; string values of referenced keys in this
        hash provide the location to write the values of the \a all_output_data hash; these values are not subject to
        template variable expansion

        For a list of supported output fields for \a output_data_cfg values; see template strings listed in
        @ref bb_template_strings marked as writable (\c W)

        @throw UNSUPPORTED-CONTEXT-ERROR if output data configuration specifies an unsupported context
        @throw OUTPUT-CONFIG-ERROR \a field_name is not present in \a output_data_cfg
        @throw SENSITIVE-DATA-FORMAT-ERROR if the \c "$sensitive:<skey>.<svalue>.field-ref..." value or
        \c "$sensitive-alias:<alias>.field-ref..." template string does not have the required format

        @see
        - @ref UserApi::updateOutputData()
        - @ref bb_template_strings

        @since Qorus 4.0.3
    */
    public static void updateOutputData(HashMap<String, Object> all_output_data,
                                 HashMap<String, Object> output_data_cfg) throws Throwable {
        QoreJavaApi.callStaticMethod("UserApi", "updateOutputData", all_output_data, output_data_cfg);
    }

    //! returns string data for the given file location
    /** @param location the location of the file data (ex: \c "resource://service-name:path/to/ressource"); see
        @ref file_locations for more information about this parameter

        @return the resource data as a string

        @throw LOCATION-ERROR the location string cannotbe parsed; unknown location scheme; invalid location option

        @see
        - @ref OMQ::UserApi::UserApi::getTextFileFromLocation() "UserApi::getTextFileFromLocation()"
        - @ref getBinaryFileFromLocation()

        @since Qorus 4.0.3
    */
    public static String getTextFileFromLocation(String location) throws Throwable {
        return (String)QoreJavaApi.callStaticMethod("UserApi", "getTextFileFromLocation", location);
    }

    //! returns binary data for the given file location
    /** @param location the location of the file data (ex: \c "resource://service-name:path/to/ressource"); see
        @ref file_locations for more information about this parameter

        @return the resource data as a binary value

        @throw LOCATION-ERROR the location string cannotbe parsed; unknown location scheme; invalid location option

        @see
        - @ref OMQ::UserApi::UserApi::getBinaryFileFromLocation() "UserApi::getBinaryFileFromLocation()"
        - @ref getTextFileFromLocation()

        @since Qorus 4.0.3
    */
    public static byte[] getBinaryFileFromLocation(String location) throws Throwable {
        return (byte[])QoreJavaApi.callStaticMethod("UserApi", "getBinaryFileFromLocation", location);
    }

    //! Starts capturing %Qore objects created from Java APIs in the current interface's object cache
    /** @throw NO-INTERFACE thrown if there is no interface context; this API is only valid when called in a
        workflow, service, or job context

        @since Qorus 4.1

        @see @ref jni_qore_object_lifecycle_management
    */
    public static void startCapturingObjects() throws Throwable {
        QoreJavaApi.callStaticMethod("UserApi", "startCapturingObjectsFromJava");
    }

    //! Stops capturing %Qore objects created from Java APIs in the current interface's object cache
    /** @throw NO-INTERFACE thrown if there is no interface context; this API is only valid when called in a
        workflow, service, or job context

        @since Qorus 4.1

        @see @ref jni_qore_object_lifecycle_management
    */
    public static void stopCapturingObjects() throws Throwable {
        QoreJavaApi.callStaticMethod("UserApi", "stopCapturingObjectsFromJava");
    }

    //! Saves the object in the object cache
    /** @throw NO-INTERFACE thrown if there is no interface context; this API is only valid when called in a
        workflow, service, or job context

        @since Qorus 4.1
    */
    public static void saveObjectInObjectCache(QoreObject obj) throws Throwable {
        QoreJavaApi.callStaticMethod("UserApi", "saveObjectInObjectCache", obj);
    }

    //! Removes the object from the object cache
    /** @return true if the object was removed, false if it was not in the cache

        @throw NO-INTERFACE thrown if there is no interface context; this API is only valid when called in a
        workflow, service, or job context

        @since Qorus 4.1
    */
    public static boolean clearObjectFromObjectCache(QoreObject obj) throws Throwable {
        return (boolean)QoreJavaApi.callStaticMethod("UserApi", "clearObjectFromObjectCache", obj);
    }

    //! Returns the date/time the object was cached or null if the object is not in the cache
    /** @param obj the object to check

        @throw NO-INTERFACE thrown if there is no interface context; this API is only valid when called in a
        workflow, service, or job context

        @since Qorus 4.1
    */
    public static ZonedDateTime checkObjectCache(QoreObject obj) throws Throwable {
        return (ZonedDateTime)QoreJavaApi.callStaticMethod("UserApi", "checkObjectCache", obj);
    }

    //! Returns the number of objects in the cache
    /** @return the number of objects in the cache

        @throw NO-INTERFACE thrown if there is no interface context; this API is only valid when called in a
        workflow, service, or job context

        @since Qorus 4.1
    */
    public static int getObjectCacheSize() throws Throwable {
        return (int)QoreJavaApi.callStaticMethod("UserApi", "getObjectCacheSize");
    }

    //! Clears the entire the object cache
    /** @return the number of objects cleared from the cache

        @throw NO-INTERFACE thrown if there is no interface context; this API is only valid when called in a
        workflow, service, or job context

        @since Qorus 4.1
    */
    public static int clearObjectCache() throws Throwable {
        return (int)QoreJavaApi.callStaticMethod("UserApi", "clearObjectCache");
    }

    //! Clears the entire the object cache for all objects cached before the given date/time
    /** @return the number of objects cleared from the cache

        @throw NO-INTERFACE thrown if there is no interface context; this API is only valid when called in a
        workflow, service, or job context

        @since Qorus 4.1
    */
    public static int clearObjectCache(ZonedDateTime cutoff) throws Throwable {
        return (int)QoreJavaApi.callStaticMethod("UserApi", "clearObjectCache", cutoff);
    }

    //! Returns a native Java object for Qore-based connections wherever possible
    private static Object doUserConnectionIntern(Object obj) {
        if (obj instanceof QoreObject) {
            QoreObject qo = (QoreObject)obj;
            switch (qo.className()) {
                case "RestClient": return new RestClient(qo);
                case "SmtpClient": return new SmtpClient(qo);
                case "SoapClient": return new SoapClient(qo);
                case "HTTPClient": return new HTTPClient(qo);
            }
        }
        return obj;
    }
}
