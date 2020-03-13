/** Qorus Java Service API
 *
 */

package com.qoretechnologies.qorus.service;

// java imports
import java.util.HashMap;
import java.time.ZonedDateTime;

// jni module imports
import org.qore.jni.QoreJavaApi;
import org.qore.jni.QoreRelativeTime;

// Qorus imports
import com.qoretechnologies.qorus.OMQ;
import com.qoretechnologies.qorus.UserApi;
import com.qoretechnologies.qorus.ConfigItemValueCallback;

//! The main Qorus Java service API class
public class ServiceApi extends UserApi {
    //! checks user authorization for all @ref RBACPermissions "permissions" passed to the method; throws an exception if the user is not authorized
    /** If current user does not have all of the given @ref RBACPermissions "permissions", an exception is thrown.

        If no user information is available (for instance, the call is internal), then authorization is automatically granted.
        If there are any authorization errors; an appropriate exception is thrown.

        @param args the list of @ref RBACPermissions "permissions" to check

        @throw AUTHORIZATION-ERROR no authentication information supplied or user does not have all required @ref RBACPermissions "permissions"

        @see
        - testAuthorization()
    */
    static public void checkAuthorization(String... args) throws Throwable {
        QoreJavaApi.callStaticMethodArgs("ServiceApi", "checkAuthorization", args);
    }

    //! checks user authorization for all @ref RBACPermissions "permissions" passed to the method; throws an exception if the user is not authorized
    /** If current user does not have all of the given @ref RBACPermissions "permissions", an exception is thrown.

        If no user information is available (for instance, the call is internal), then authorization is automatically granted.
        If there are any authorization errors; an appropriate exception is thrown.

        @param args the list of @ref RBACPermissions "permissions" to check

        @throw AUTHORIZATION-ERROR no authentication information supplied or user does not have all required @ref RBACPermissions "permissions"

        @see
        - testAuthorization()
    */
    static public void checkAuthorizationArgs(String[] args) throws Throwable {
        QoreJavaApi.callStaticMethod("ServiceApi", "checkAuthorizationArgs", (Object)args);
    }

    //! checks user authorization for at least one of list of @ref RBACPermissions "permissions" passed to the method; throws an exception if the user is not authorized
    /** If current user does not have at least one of the given @ref RBACPermissions "permissions", an exception is thrown.

        If no user information is available (for instance, the call is internal), then authorization is automatically granted.
        If there are any authorization errors; an appropriate exception is thrown.

        @param args the list of @ref RBACPermissions "permissions" to check

        @throw AUTHORIZATION-ERROR no authentication information supplied or user does not have any of the @ref RBACPermissions "permissions" given

        @see
        - testAuthorizationOr()
    */
    static public void checkAuthorizationOr(String... args) throws Throwable {
        QoreJavaApi.callStaticMethodArgs("ServiceApi", "checkAuthorizationOr", args);
    }

    //! checks user authorization for at least one of list of @ref RBACPermissions "permissions" passed to the method; throws an exception if the user is not authorized
    /** If current user does not have at least one of the given @ref RBACPermissions "permissions", an exception is thrown.

        If no user information is available (for instance, the call is internal), then authorization is automatically granted.
        If there are any authorization errors; an appropriate exception is thrown.

        @throw AUTHORIZATION-ERROR no authentication information supplied or user does not have any of the @ref RBACPermissions "permissions" given

        @see
        - testAuthorizationOr()
    */
    static public void checkAuthorizationOrArgs(String[] args) throws Throwable {
        QoreJavaApi.callStaticMethod("ServiceApi", "checkAuthorizationOrArgs", (Object)args);
    }

    //! tests user authorization for all of @ref RBACPermissions "permissions" passed to the method and returns true (if authorization is granted) or False (if the user is not authorized)
    /** If no user information is available (for instance, the call is internal), then authorization is automatically granted.
        If there are any authorization errors, the method returns false

        @param args the list of @ref RBACPermissions "permissions" to check

        @return if current user does not have all of the given @ref RBACPermissions "permissions", returns False, otherwise true.

        @see
        - @ref OMQ::UserApi::Service::ServiceApi::testAuthorization() "ServiceApi::testAuthorization()"
        - checkAuthorization()
    */
    static public boolean testAuthorization(String... args) throws Throwable {
        return (boolean)QoreJavaApi.callStaticMethodArgs("ServiceApi", "testAuthorization", args);
    }

    //! tests user authorization for all of @ref RBACPermissions "permissions" passed to the method and returns true (if authorization is granted) or False (if the user is not authorized)
    /** If no user information is available (for instance, the call is internal), then authorization is automatically granted.
        If there are any authorization errors, the method returns false

        @return if current user does not have all of the given @ref RBACPermissions "permissions", returns False, otherwise true.

        @see
        - checkAuthorization()
    */
    static public boolean testAuthorizationArgs(String[] args) throws Throwable {
        return (boolean)QoreJavaApi.callStaticMethod("ServiceApi", "testAuthorizationArgs", (Object)args);
    }

    //! tests user authorization for at least one of the @ref RBACPermissions "permissions" passed to the method and returns true (if authorization is granted) or False (if the user is not authorized)
    /** If no user information is available (for instance, the call is internal), then authorization is automatically granted.
        If there are any authorization errors, the method returns false

        @param args the list of @ref RBACPermissions "permissions" to test

        @return if current user does not have at least one of the given @ref RBACPermissions "permissions", returns False, otherwise true.

        @see
        - checkAuthorizationOr()
    */
    static public boolean testAuthorizationOr(String... args) throws Throwable {
        return (boolean)QoreJavaApi.callStaticMethodArgs("ServiceApi", "testAuthorization", args);
    }

    //! tests user authorization for at least one of the @ref RBACPermissions "permissions" passed to the method and returns true (if authorization is granted) or False (if the user is not authorized)
    /** If no user information is available (for instance, the call is internal), then authorization is automatically granted.
        If there are any authorization errors, the method returns false

        @return if current user does not have at least one of the given @ref RBACPermissions "permissions", returns False, otherwise true.

        @see
        - checkAuthorizationOr()
    */
    static public boolean testAuthorizationOrArgs(String[] args) throws Throwable {
        return (boolean)QoreJavaApi.callStaticMethod("ServiceApi", "testAuthorizationArgs", (Object)args);
    }

    //! checks if the current user has access to the given list of workflow IDs; throws an exception if the user is not authorized
    /** @param ids a list of workflowids to check

        @throw WORKFLOW-ACCESS-ERROR the user does not have access to one or more of the given workflows
    */
    static public void checkWorkflowAccess(int[] ids) throws Throwable {
        QoreJavaApi.callStaticMethod("ServiceApi", "checkWorkflowAccess", (Object)ids);
    }

    //! checks if the current user has access to the given single workflow ID; throws an exception if the user is not authorized
    /** @param id the workflowid to check

        @throw WORKFLOW-ACCESS-ERROR the user does not have access to the given workflow
   */
    static public void checkWorkflowAccess(int id) throws Throwable {
        QoreJavaApi.callStaticMethod("ServiceApi", "checkWorkflowAccess", id);
    }

    //! tests if the current user has access to the given list of workflow IDs and returns true (if authorization is granted) or False (if the user is not authorized)
    /** @param ids a list of workflowids to check
    */
    static public boolean testWorkflowAccess(int[] ids) throws Throwable {
        return (boolean)QoreJavaApi.callStaticMethod("ServiceApi", "testWorkflowAccess", ids);
    }

    //! tests if the current user has access to the given single workflow ID and returns true (if authorization is granted) or False (if the user is not authorized)
    /** @param id the workflowid to check
    */
    static public boolean testWorkflowAccess(int id) throws Throwable {
        return (boolean)QoreJavaApi.callStaticMethod("ServiceApi", "testWorkflowAccess", id);
    }

    //! returns a list of workflow IDs the current user has access to; or, if the current user has a role with the @ref defaultgroup "DEFAULT" group, then null is returned
    /** null is only returned if the current user has access to all workflows

        @return a list of workflow IDs the current user has access to; or, if the current user has a role with the @ref defaultgroup "DEFAULT" group, then null is returned
    */
    static public int[] getWorkflowAccessList() throws Throwable {
        return (int[])QoreJavaApi.callStaticMethod("ServiceApi", "getWorkflowAccessList");
    }

    //! returns a hash of workflow IDs the current user has access to; or, if the current user has a role with the @ref defaultgroup "DEFAULT" group, then null is returned
    /** null is only returned if the current user has access to all workflows

        @return a hash of workflow IDs the current user has access to; or, if the current user has a role with the @ref defaultgroup "DEFAULT" group, then null is returned
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getWorkflowAccessHash() throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("ServiceApi", "getWorkflowAccessHash");
    }

    //! checks if the current user has access to the given workflow_instanceid; throws an exception if the user is not authorized
    /** @param wfiid the workflow_instanceid to check

        @throw WORKFLOW-ACCESS-ERROR no authentication information supplied or user does not have access to the given workflow
    */
    static public void checkWorkflowInstanceAccess(int wfiid) throws Throwable {
        QoreJavaApi.callStaticMethod("ServiceApi", "checkWorkflowInstanceAccess", wfiid);
    }

    //! checks if the current user has access to the given list of serviceids; throws an exception if the user is not authorized
    /** @param ids a list of serviceids to check

        @throw SERVICE-ACCESS-ERROR no authentication information supplied or user does not have access to one or more of the given services
    */
    static public void checkServiceAccess(int[] ids) throws Throwable {
        QoreJavaApi.callStaticMethod("ServiceApi", "checkServiceAccess", (Object)ids);
    }

    //! checks if the current user has access to the given single serviceid; throws an exception if the user is not authorized
    /** @param id the serviceid to check

        @throw SERVICE-ACCESS-ERROR no authentication information supplied or user does not have access to the given service
    */
    static public void checkServiceAccess(int id) throws Throwable {
        QoreJavaApi.callStaticMethod("ServiceApi", "checkServiceAccess", id);
    }

    //! checks if the current user has access to the given queue entry (as determined through the workflow access list); throws an exception if the user is not authorized
    /** @param queueid the queue ID to check
        @param key the key value in queue given by the first argument to check

        @throw WORKFLOW-ACCESS-ERROR no authentication information supplied or user does not have access to the given workflow
    */
    static public void checkQueueAccess(int queueid, String key) throws Throwable {
        QoreJavaApi.callStaticMethod("ServiceApi", "checkQueueAccess", queueid, key);
    }

    //! tests if the current user has access to the given list of serviceids and returns true (if authorization is granted) or False (if the user is not authorized)
    /** @param ids a list of serviceids to check

        @throw SERVICE-ACCESS-ERROR no authentication information supplied or user does not have access to the given services
    */
    static public boolean testServiceAccess(int[] ids) throws Throwable {
        return (boolean)QoreJavaApi.callStaticMethod("ServiceApi", "testServiceAccess", ids);
    }

    //! tests if the current user has access to the given single serviceid and returns true (if authorization is granted) or False (if the user is not authorized)
    /** @param id the serviceid to check
    */
    static public boolean testServiceAccess(int id) throws Throwable {
        return (boolean)QoreJavaApi.callStaticMethod("ServiceApi", "testServiceAccess", id);
    }

    //! returns a list of service IDs the current user has access to; or, if the current user has access to all services, then null is returned
    /** null is only returned if the current user has access to all services

        @return a list of service IDs the current user has access to; or, if the current user has access to all services, then null is returned
    */
    static public int[] getServiceAccessList() throws Throwable {
        return (int[])QoreJavaApi.callStaticMethod("ServiceApi", "getServiceAccessList");
    }

    //! returns a hash of service IDs the current user has access to; or, if the current user has access to all services, then null is returned
    /** null is only returned if the current user has access to all services

        @return a hash of service IDs the current user has access to; or, if the current user has access to all services, then null is returned
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getServiceAccessHash() throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("ServiceApi", "getServiceAccessHash");
    }

    //! checks if the current user has access to the given list of job IDs; throws an exception if the user is not authorized
    /** @param ids a list of jobids to check

        @throw JOB-ACCESS-ERROR the user does not have access to one or more of the given jobs
    */
    static public void checkJobAccess(int[] ids) throws Throwable {
        QoreJavaApi.callStaticMethod("ServiceApi", "checkJobAccess", (Object)ids);
    }

    //! checks if the current user has access to the given single job ID; throws an exception if the user is not authorized
    /** @param id the jobid to check

        @throw JOB-ACCESS-ERROR the user does not have access to the given job
    */
    static public void checkJobAccess(int id) throws Throwable {
        QoreJavaApi.callStaticMethod("ServiceApi", "checkJobAccess", id);
    }

    //! tests if the current user has access to the given list of job IDs and returns true (if authorization is granted) or False (if the user is not authorized)
    /** @param ids a list of jobids to check
    */
    static public boolean testJobAccess(int[] ids) throws Throwable {
        return (boolean)QoreJavaApi.callStaticMethod("ServiceApi", "testJobAccess", ids);
    }

    //! tests if the current user has access to the given single job ID and returns true (if authorization is granted) or False (if the user is not authorized)
    /** @param id the jobid to check
    */
    static public boolean testJobAccess(int id) throws Throwable {
        return (boolean)QoreJavaApi.callStaticMethod("ServiceApi", "testJobAccess", id);
    }

    //! returns a list of job IDs the current user has access to; or, if the current user has a role with the @ref defaultgroup "DEFAULT" group, then null is returned
    /** null is only returned if the current user has access to all jobs

        @return a list of job IDs the current user has access to; or, if the current user has a role with the @ref defaultgroup "DEFAULT" group, then null is returned
    */
    static public int[] getJobAccessList() throws Throwable {
        return (int[])QoreJavaApi.callStaticMethod("ServiceApi", "getJobAccessList");
    }

    //! returns a hash of job IDs the current user has access to; or, if the current user has a role with the @ref defaultgroup "DEFAULT" group, then null is returned
    /** null is only returned if the current user has access to all jobs

        @return a hash of job IDs the current user has access to; or, if the current user has a role with the @ref defaultgroup "DEFAULT" group, then null is returned
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getJobAccessHash() throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("ServiceApi", "getJobAccessHash");
    }

    //! checks if the current user has access to the given job_instanceid; throws an exception if the user is not authorized
    /**
        @param jiid the job_instanceid to check

        @throw JOB-ACCESS-ERROR the user does not have access to the given job
    */
    static public void checkJobInstanceAccess(int jiid) throws Throwable {
        QoreJavaApi.callStaticMethod("ServiceApi", "checkJobInstanceAccess", jiid);
    }

    //! checks if the current user has access to the given list of mapper IDs; throws an exception if the user is not authorized
    /** @param ids a list of mapperids to check

        @throw MAPPER-ACCESS-ERROR the user does not have access to one or more of the given mappers
    */
    static public void checkMapperAccess(int[] ids) throws Throwable {
        QoreJavaApi.callStaticMethod("ServiceApi", "checkMapperAccess", ids);
    }

    //! checks if the current user has access to the given single mapper ID; throws an exception if the user is not authorized
    /** @param id the mapperid to check

        @throw MAPPER-ACCESS-ERROR the user does not have access to the given mapper
    */
    static public void checkMapperAccess(int id) throws Throwable {
        QoreJavaApi.callStaticMethod("ServiceApi", "checkMapperAccess", id);
    }

    //! tests if the current user has access to the given list of mapper IDs and returns true (if authorization is granted) or False (if the user is not authorized)
    /** @param ids a list of mapperids to check
    */
    static public boolean testMapperAccess(int[] ids) throws Throwable {
        return (boolean)QoreJavaApi.callStaticMethod("ServiceApi", "testMapperAccess", ids);
    }

    //! tests if the current user has access to the given single mapper ID and returns true (if authorization is granted) or False (if the user is not authorized)
    /** @param id the mapperid to check
    */
    static public boolean testMapperAccess(int id) throws Throwable {
        return (boolean)QoreJavaApi.callStaticMethod("ServiceApi", "testMapperAccess", id);
    }

    //! returns a list of mapper IDs the current user has access to; or, if the current user has a role with the @ref defaultgroup "DEFAULT" group, then null is returned
    /** null is only returned if the current user has access to all mappers

        @return a list of mapper IDs the current user has access to; or, if the current user has a role with the @ref defaultgroup "DEFAULT" group, then null is returned

        @note a return value of an empty list means that the user has access to no value maps; this must be distinguished from a return value of null, which means that the user has access to all value maps
    */
    static public int[] getMapperAccessList() throws Throwable {
        return (int[])QoreJavaApi.callStaticMethod("ServiceApi", "getMapperAccessList");
    }

    //! returns a hash of mapper IDs the current user has access to; or, if the current user has a role with the @ref defaultgroup "DEFAULT" group, then null is returned
    /** null is only returned if the current user has access to all mappers

        @return a hash of mapper IDs the current user has access to; or, if the current user has a role with the @ref defaultgroup "DEFAULT" group, then null is returned

        @note a return value of an empty hash means that the user has access to no value maps; this must be distinguished from a return value of null, which means that the user has access to all value maps
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getMapperAccessHash() throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("ServiceApi", "getMapperAccessHash");
    }

    //! checks if the current user has access to the given list of value map IDs; throws an exception if the user is not authorized
    /** @param ids a list of value map ids to check

        @throw VMAP-ACCESS-ERROR the user does not have access to one or more of the given value maps
    */
    static public void checkVmapAccess(int[] ids) throws Throwable {
        QoreJavaApi.callStaticMethod("ServiceApi", "checkVmapAccess", ids);
    }

    //! checks if the current user has access to the given single value map ID; throws an exception if the user is not authorized
    /** @param id the value map id to check

        @throw VMAP-ACCESS-ERROR the user does not have access to the given value map
    */
    static public void checkVmapAccess(int id) throws Throwable {
        QoreJavaApi.callStaticMethod("ServiceApi", "checkVmapAccess", id);
    }

    //! tests if the current user has access to the given list of value map IDs and returns true (if authorization is granted) or False (if the user is not authorized)
    /** @param ids a list of value map ids to check
    */
    static public boolean testVmapAccess(int[] ids) throws Throwable {
        return (boolean)QoreJavaApi.callStaticMethod("ServiceApi", "testVmapAccess", ids);
    }

    //! tests if the current user has access to the given single value map ID and returns true (if authorization is granted) or False (if the user is not authorized)
    /** @param id the value map id to check
    */
    static public boolean testVmapAccess(int id) throws Throwable {
        return (boolean)QoreJavaApi.callStaticMethod("ServiceApi", "testVmapAccess", id);
    }

    //! returns a list of value map IDs the current user has access to; or, if the current user has a role with the @ref defaultgroup "DEFAULT" group, then null is returned
    /** null is only returned if the current user has access to all value maps

        @return a list of value map IDs the current user has access to; or, if the current user has a role with the @ref defaultgroup "DEFAULT" group, then null is returned

        @note a return value of an empty list means that the user has access to no value maps; this must be distinguished from a return value of null, which means that the user has access to all value maps
    */
    static public int[] getVmapAccessList() throws Throwable {
        return (int[])QoreJavaApi.callStaticMethod("ServiceApi", "getVmapAccessList");
    }

    //! returns a hash of value map IDs the current user has access to; or, if the current user has a role with the @ref defaultgroup "DEFAULT" group, then null is returned
    /** null is only returned if the current user has access to all value maps

        @return a hash of value map IDs the current user has access to; or, if the current user has a role with the @ref defaultgroup "DEFAULT" group, then null is returned

        @note a return value of an empty hash means that the user has access to no value maps; this must be distinguished from a return value of null, which means that the user has access to all value maps
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getVmapAccessHash() throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("ServiceApi", "getVmapAccessHash");
    }

    //! registers the current service as a SOAP service and exports its methods that map to SOAP operations in the given WSDL to be called from the Qorus HttpServer with the SOAP protocol
    /** Creates a mapping in the system SoapHandler from the given WSDL to the current service.  SOAP operations defined in the WSDL will be mapped directly to Qorus service methods with the same names as the SOAP operations.

        @param h a hash with the following keys (only \c wsdl or \c wsdl_file is required):
        - \c wsdl, \c wsdl_file, or \c wsdl_resource: a URL to the WSDL, the WSDL string (XSD), a WebService object, or a file resource name giving the WSDL file
        - \c service: a string giving the name of the SOAP service to map to this service; this key is only necessary to set if the WSDL defines multiple SOAP services
        - \c uri_path: an optional string giving an optional URI path to use when binding the SOAP service

        @throw REGISTER-SOAP-HANDLER-ERROR missing \c wsdl or \c wsdl_file key in argument hash; cannot find service; multiple services defined by WSDL but no \c service key given in argument hash

    */
    static public void registerSoapHandler(HashMap<String, Object> h) throws Throwable {
        QoreJavaApi.callStaticMethod("ServiceApi", "registerSoapHandler", h);
    }

    //! returns a hash with HTTP call context information
    /**
        @note This API method is relevant for any external HTTP call, including SOAP and REST calls
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getHttpCallContext() throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("ServiceApi", "getHttpCallContext");
    }

    //! returns the last @ref systemevents "system events"
    /**
        @param count the maximum number of @ref systemevents "system events" to return
        @return a hash with the following keys:
        - \c lastid: the last event ID at the time the method returns
        - \c events: a list of event hashes (see @ref eventhash "eventhash" for a detailed description); note that this key will be missing if no events are returned
        - \c shutdown: if this key is returned, it means the system is shutting down

        @throw SHUTDOWN-ERROR this exception is raised if any event API is called a second time after the \c "shutdown" key is returned
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getLastEvents(int count) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("ServiceApi", "getLastEvents", count);
    }

    //! gets the last system events that meet any of the filter criteria and none of the "and_not" criteria, if present
    /** Returns a hash giving the list of the most recent system events matching a filter and the last event ID generated by the system.   Events in the event list returned must match the criteria passed as the second argument; if any of the criteria match an event, then it is included in the return list, unless a third criteria list argument is also passed, which allows for removing elements from the list returned.
        @param count the maximum number of events to return; if this argument is 0, then the size of the returned list is only limited by the number of events in the system that match the filter(s) passed.
        @param filter this argument gives the criteria list for "logical or" comparisons to be applied to the events.  If an event matches any of the criteria hashes in the first argument, then it is included in the resulting list, subject to processing by the optional third argument.  To match a criteria hash in the second argument with this API call, all of the criteria keys in each hash must match, therefore, to get pure "logical or" behavior the caller must specify only one hash key in each criteria hash; see @ref eventfilters "Event Filter Criteria" for a description of each criteria hash
        @param and_not this argument is an optional criteria list allowing the resulting event list to be filtered; if any event selected by the second argument matches all criteria hashes in the criteria hashes passed as the third argument, then it is filtered out of the resulting list.  Note that the third argument, if present, is processed with inverted logic compared to the second argument; for a criteria hash to match, any of the criteria given as hash keys in a criteria hash can match, however, all criteria hashes must match for the filter to operate.  Therefore, to get pure "logical and" filtering the caller must specify only one hash key per hash in the list making up the third argument; see @ref eventfilters "Event Filter Criteria" for a description of each criteria hash
        @return a hash with the following keys:
        - \c lastid: the last event ID at the time the method returns
        - \c events: a list of event hashes (see @ref eventhash "eventhash" for a detailed description); note that this key will be missing if no events are returned
        - \c shutdown: if this key is returned, it means the system is shutting down

        @throw GET-LAST-EVENTS-OR-ERROR empty or missing filter value
        @throw GET-EVENTS-ERROR non-hash criteria element passed in event filter
        @throw INVALID-CRITERIA-CODE invalid criteria code found in event filter
        @throw SHUTDOWN-ERROR this exception is raised if any event API is called a second time after the \c "shutdown" key is returned
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getLastEventsOr(int count, Object filter, Object and_not) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("ServiceApi", "getLastEventsOr", count, filter, and_not);
    }

    //! gets the last system events that meet any of the filter criteria and none of the "and_not" criteria, if present
    /** Returns a hash giving the list of the most recent system events matching a filter and the last event ID generated by the system.   Events in the event list returned must match the criteria passed as the second argument; if any of the criteria match an event, then it is included in the return list, unless a third criteria list argument is also passed, which allows for removing elements from the list returned.
        @param count the maximum number of events to return; if this argument is 0, then the size of the returned list is only limited by the number of events in the system that match the filter(s) passed.
        @param filter this argument gives the criteria list for "logical or" comparisons to be applied to the events.  If an event matches any of the criteria hashes in the first argument, then it is included in the resulting list, subject to processing by the optional third argument.  To match a criteria hash in the second argument with this API call, all of the criteria keys in each hash must match, therefore, to get pure "logical or" behavior the caller must specify only one hash key in each criteria hash; see @ref eventfilters "Event Filter Criteria" for a description of each criteria hash
        @return a hash with the following keys:
        - \c lastid: the last event ID at the time the method returns
        - \c events: a list of event hashes (see @ref eventhash "eventhash" for a detailed description); note that this key will be missing if no events are returned
        - \c shutdown: if this key is returned, it means the system is shutting down

        @throw GET-LAST-EVENTS-OR-ERROR empty or missing filter value
        @throw GET-EVENTS-ERROR non-hash criteria element passed in event filter
        @throw INVALID-CRITERIA-CODE invalid criteria code found in event filter
        @throw SHUTDOWN-ERROR this exception is raised if any event API is called a second time after the \c "shutdown" key is returned
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getLastEventsOr(int count, Object filter) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("ServiceApi", "getLastEventsOr", count, filter);
    }

    //! gets the last system events that meet all of the filter criteria or none of the "or_not" criteria, if present
    /**
        @param count the maximum number of events to return; if this argument is 0, then the size of the returned list is only limited by the number of events in the system that match the filter(s) passed.
        @param filter this argument is the criteria list for "logical and" comparisons to be applied to the events.  If an event matches all of the criteria hashes in the first argument, then it is included in the resulting list.  To match a criteria hash in the second argument with this API call, any of the criteria keys in a single hash can match, therefore, to get pure "logical and" behavior, the caller must specify only one hash key in each criteria hash; see @ref eventfilters "Event Filter Criteria" for a description of each criteria hash
        @param or_not this argument is an optional criteria list that can augment the list returned with negative matches.  If this argument is present and any element in the system’s event list does not match any of the criteria hashes in the third argument, then it is also included in the returned event list.  Note that the third argument, if present, is processed with inverted logic compared to the second argument; for a single criteria hash to match, all of the criteria given as hash keys in the criteria hash must match, therefore, to get pure inverted "logical or" logic, the caller must specify only one hash key per hash in the list making up the third argument; see @ref eventfilters "Event Filter Criteria" for a description of each criteria hash
        @return a hash with the following keys:
        - \c lastid: the last event ID at the time the method returns
        - \c events: a list of event hashes (see @ref eventhash "eventhash" for a detailed description); note that this key will be missing if no events are returned
        - \c shutdown: if this key is returned, it means the system is shutting down

        @throw GET-LAST-EVENTS-AND-ERROR empty or missing filter value
        @throw GET-EVENTS-ERROR non-hash criteria element passed in event filter
        @throw INVALID-CRITERIA-CODE invalid criteria code found in event filter
        @throw SHUTDOWN-ERROR this exception is raised if any event API is called a second time after the \c "shutdown" key is returned
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getLastEventsAnd(int count, Object filter, Object or_not) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("ServiceApi", "getLastEventsAnd", count, filter, or_not);
    }

    //! gets the last system events that meet all of the filter criteria or none of the "or_not" criteria, if present
    /**
        @param count the maximum number of events to return; if this argument is 0, then the size of the returned list is only limited by the number of events in the system that match the filter(s) passed.
        @param filter this argument is the criteria list for "logical and" comparisons to be applied to the events.  If an event matches all of the criteria hashes in the first argument, then it is included in the resulting list.  To match a criteria hash in the second argument with this API call, any of the criteria keys in a single hash can match, therefore, to get pure "logical and" behavior, the caller must specify only one hash key in each criteria hash; see @ref eventfilters "Event Filter Criteria" for a description of each criteria hash
        @return a hash with the following keys:
        - \c lastid: the last event ID at the time the method returns
        - \c events: a list of event hashes (see @ref eventhash "eventhash" for a detailed description); note that this key will be missing if no events are returned
        - \c shutdown: if this key is returned, it means the system is shutting down

        @throw GET-LAST-EVENTS-AND-ERROR empty or missing filter value
        @throw GET-EVENTS-ERROR non-hash criteria element passed in event filter
        @throw INVALID-CRITERIA-CODE invalid criteria code found in event filter
        @throw SHUTDOWN-ERROR this exception is raised if any event API is called a second time after the \c "shutdown" key is returned
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getLastEventsAnd(int count, Object filter) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("ServiceApi", "getLastEventsAnd", count, filter);
    }

    //! return available system events
    /**
        @param min_id the minimum event ID to return; no event wil be returned that has an event ID less than this;
        the first event ID is always 1 (if min_id <= 1 then all events are returned that meet the given criteria)
        @param timeout_ms optional timeout waiting for events; if 0; the method returns immediately

        @return a hash with the following keys:
        - \c lastid: the last event ID at the time the method returns
        - \c events: a list of event hashes (see @ref eventhash "eventhash" for a detailed description); note that
          this key will be missing if no events are returned
        - \c shutdown: if this key is returned, it means the system is shutting down

        @throw SHUTDOWN-ERROR this exception is raised if any event API is called a second time after the
        \c "shutdown" key is returned

        @note It is not recommended to use this API in @ref service_remote "remote services", as high-volume message
        processing can have a negative impact on a Qorus cluster as a whole
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> waitForEvents(int min_id, int timeout_ms) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("ServiceApi", "waitForEvents", min_id, timeout_ms);
    }

    //! return available system events with no timeout; this method call returns immediately
    /**
        @param min_id the minimum event ID to return; no event wil be returned that has an event ID less than this; the first event ID is always 1 (if min_id <= 1 then all events are returned that meet the given criteria)

        @return a hash with the following keys:
        - \c lastid: the last event ID at the time the method returns
        - \c events: a list of event hashes (see @ref eventhash "eventhash" for a detailed description); note that this key will be missing if no events are returned
        - \c shutdown: if this key is returned, it means the system is shutting down

        @throw SHUTDOWN-ERROR this exception is raised if any event API is called a second time after the \c "shutdown" key is returned

        @note It is not recommended to use this API in @ref service_remote "remote services", as high-volume message processing
        can have a negative impact on a Qorus cluster as a whole
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> waitForEvents(int min_id) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("ServiceApi", "waitForEvents", min_id);
    }

    //! return available system events
    /** by default without any arguments will immediately return all available events in the cache

        @return a hash with the following keys:
        - \c lastid: the last event ID at the time the method returns
        - \c events: a list of event hashes (see @ref eventhash "eventhash" for a detailed description); note that this key will be missing if no events are returned
        - \c shutdown: if this key is returned, it means the system is shutting down

        @throw SHUTDOWN-ERROR this exception is raised if any event API is called a second time after the \c "shutdown" key is returned

        @note It is not recommended to use this API in @ref service_remote "remote services", as high-volume message processing
        can have a negative impact on a Qorus cluster as a whole
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> waitForEvents() throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("ServiceApi", "waitForEvents");
    }

    //! return system events that meet any of the given criteria and none of the optional "and not" criteria
    /**
        @param min_id the minimum event ID to return; no event wil be returned that has an event ID less than this;
        the first event ID is always 1 (if min_id <= 1 then all events are returned that meet the given criteria)
        @param filter this argument is the criteria list for "logical or" comparisons to be applied to the events.  If
        a system event matches any of the criteria hashes in the first argument, then it is included in the resulting
        list, subject to processing by the optional fourth argument.  To match a criteria hash in the second argument
        with this API call, all of the criteria keys in each hash must match, therefore, to get pure "logical or"
        behavior the caller must specify only one hash key in each criteria hash; see
        @ref eventfilters "Event Filter Criteria" for a description of each criteria hash
        @param timeout_ms optional timeout waiting for events; if not present or 0; the method returns immediately
        @param and_not this argument is an optional criteria list allowing the resulting event list to be filtered; if
        any event selected by the second argument matches all criteria hashes in the criteria hashes passed as the
        third argument, then it is filtered out of the resulting list.  Note that the fourth argument, if present, is
        processed with inverted logic compared to the second argument; for a criteria hash to match, any of the
        criteria given as hash keys in a criteria hash can match, however, all criteria hashes must match for the
        filter to operate.  Therefore, to get pure "logical and" filtering the caller must specify only one hash key
        per hash in the list making up the fourth argument; see @ref eventfilters "Event Filter Criteria" for a
        description of each criteria hash

        @return a hash with the following keys:
        - \c lastid: the last event ID at the time the method returns
        - \c events: a list of event hashes (see @ref eventhash "eventhash" for a detailed description); note that
          this key will be missing if no events are returned
        - \c shutdown: if this key is returned, it means the system is shutting down

        @throw GET-EVENTS-OR-ERROR empty or missing filter value
        @throw GET-EVENTS-ERROR non-hash criteria element passed in event filter
        @throw INVALID-CRITERIA-CODE invalid criteria code found in event filter
        @throw SHUTDOWN-ERROR this exception is raised if any event API is called a second time after the
        \c "shutdown" key is returned

        @note It is not recommended to use this API in @ref service_remote "remote services", as high-volume message
        processing can have a negative impact on a Qorus cluster as a whole
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> waitForEventsOr(int min_id, Object filter, int timeout_ms, Object and_not) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("ServiceApi", "waitForEventsOr", min_id, filter,
            timeout_ms, and_not);
    }

    //! return system events that meet any of the given criteria and none of the optional "and not" criteria
    /**
        @param min_id the minimum event ID to return; no event wil be returned that has an event ID less than this;
        the first event ID is always 1 (if min_id <= 1 then all events are returned that meet the given criteria)
        @param filter this argument is the criteria list for "logical or" comparisons to be applied to the events.  If
        a system event matches any of the criteria hashes in the first argument, then it is included in the resulting
        list, subject to processing by the optional fourth argument.  To match a criteria hash in the second argument
        with this API call, all of the criteria keys in each hash must match, therefore, to get pure "logical or"
        behavior the caller must specify only one hash key in each criteria hash; see
        @ref eventfilters "Event Filter Criteria" for a description of each criteria hash
        @param timeout_ms optional timeout waiting for events; if not present or 0; the method returns immediately

        @return a hash with the following keys:
        - \c lastid: the last event ID at the time the method returns
        - \c events: a list of event hashes (see @ref eventhash "eventhash" for a detailed description); note that
          this key will be missing if no events are returned
        - \c shutdown: if this key is returned, it means the system is shutting down

        @throw GET-EVENTS-OR-ERROR empty or missing filter value
        @throw GET-EVENTS-ERROR non-hash criteria element passed in event filter
        @throw INVALID-CRITERIA-CODE invalid criteria code found in event filter
        @throw SHUTDOWN-ERROR this exception is raised if any event API is called a second time after the
        \c "shutdown" key is returned

        @note It is not recommended to use this API in @ref service_remote "remote services", as high-volume message
        processing can have a negative impact on a Qorus cluster as a whole
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> waitForEventsOr(int min_id, Object filter, int timeout_ms) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("ServiceApi", "waitForEventsOr", min_id, filter,
            timeout_ms);
    }

    //! return system events that meet any of the given criteria; this method returns immediately
    /**
        @param min_id the minimum event ID to return; no event wil be returned that has an event ID less than this;
        the first event ID is always 1 (if min_id <= 1 then all events are returned that meet the given criteria)
        @param filter this argument is the criteria list for "logical or" comparisons to be applied to the events.  If
        a system event matches any of the criteria hashes in the first argument, then it is included in the resulting
        list, subject to processing by the optional fourth argument.  To match a criteria hash in the second argument
        with this API call, all of the criteria keys in each hash must match, therefore, to get pure "logical or"
        behavior the caller must specify only one hash key in each criteria hash; see
        @ref eventfilters "Event Filter Criteria" for a description of each criteria hash

        @return a hash with the following keys:
        - \c lastid: the last event ID at the time the method returns
        - \c events: a list of event hashes (see @ref eventhash "eventhash" for a detailed description); note that
          this key will be missing if no events are returned
        - \c shutdown: if this key is returned, it means the system is shutting down

        @throw GET-EVENTS-OR-ERROR empty or missing filter value
        @throw GET-EVENTS-ERROR non-hash criteria element passed in event filter
        @throw INVALID-CRITERIA-CODE invalid criteria code found in event filter
        @throw SHUTDOWN-ERROR this exception is raised if any event API is called a second time after the
        \c "shutdown" key is returned

        @note It is not recommended to use this API in @ref service_remote "remote services", as high-volume message
        processing can have a negative impact on a Qorus cluster as a whole
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> waitForEventsOr(int min_id, Object filter) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("ServiceApi", "waitForEventsOr", min_id, filter);
    }

    //! return system events that meet all of the given criteria or none of the optional "or not" criteria
    /**
        @param min_id the minimum event ID to return; no event wil be returned that has an event ID less than this;
        the first event ID is always 1 (if min_id <= 1 then all events are returned that meet the given criteria)
        @param filter this argument is the criteria list for "logical and" comparisons to be applied to the events.
        If an event matches all of the criteria hashes in the first argument, then it is included in the resulting
        list.  To match a criteria hash in the second argument with this API call, any of the criteria keys in a
        single hash can match, therefore, to get pure "logical and" behavior, the caller must specify only one hash
        key in each criteria hash; see @ref eventfilters "Event Filter Criteria" for a description of each criteria
        hash
        @param timeout_ms optional timeout waiting for events; if not present or 0; the method returns immediately
        @param or_not this argument is an optional criteria list that can augment the list returned with negative
        matches.  If this argument is present and any element in the system’s event list does not match any of the
        criteria hashes in the third argument, then it is also included in the returned event list.  Note that the
        fourth argument, if present, is processed with inverted logic compared to the second argument; for a single
        criteria hash to match, all of the criteria given as hash keys in the criteria hash must match, therefore, to
        get pure inverted "logical or" logic, the caller must specify only one hash key per hash in the list making up
        the fourth argument; see @ref eventfilters "Event Filter Criteria" for a description of each criteria hash

        @return a hash with the following keys:
        - \c lastid: the last event ID at the time the method returns
        - \c events: a list of event hashes (see @ref eventhash "eventhash" for a detailed description); note that
          this key will be missing if no events are returned
        - \c shutdown: if this key is returned, it means the system is shutting down

        @throw GET-EVENTS-AND-ERROR empty or missing filter value
        @throw GET-EVENTS-ERROR non-hash criteria element passed in event filter
        @throw INVALID-CRITERIA-CODE invalid criteria code found in event filter
        @throw SHUTDOWN-ERROR this exception is raised if any event API is called a second time after the
        \c "shutdown" key is returned

        @note It is not recommended to use this API in @ref service_remote "remote services", as high-volume message
        processing can have a negative impact on a Qorus cluster as a whole
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> waitForEventsAnd(int min_id, Object filter, int timeout_ms, Object or_not) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("ServiceApi", "waitForEventsAnd", min_id, filter,
            timeout_ms, or_not);
    }

    //! return system events that meet all of the given criteria or none of the optional "or not" criteria
    /**
        @param min_id the minimum event ID to return; no event wil be returned that has an event ID less than this;
        the first event ID is always 1 (if min_id <= 1 then all events are returned that meet the given criteria)
        @param filter this argument is the criteria list for "logical and" comparisons to be applied to the events.
        If an event matches all of the criteria hashes in the first argument, then it is included in the resulting
        list.  To match a criteria hash in the second argument with this API call, any of the criteria keys in a
        single hash can match, therefore, to get pure "logical and" behavior, the caller must specify only one hash
        key in each criteria hash; see @ref eventfilters "Event Filter Criteria" for a description of each criteria
        hash
        @param timeout_ms optional timeout waiting for events; if not present or 0; the method returns immediately

        @return a hash with the following keys:
        - \c lastid: the last event ID at the time the method returns
        - \c events: a list of event hashes (see @ref eventhash "eventhash" for a detailed description); note that
          this key will be missing if no events are returned
        - \c shutdown: if this key is returned, it means the system is shutting down

        @throw GET-EVENTS-AND-ERROR empty or missing filter value
        @throw GET-EVENTS-ERROR non-hash criteria element passed in event filter
        @throw INVALID-CRITERIA-CODE invalid criteria code found in event filter
        @throw SHUTDOWN-ERROR this exception is raised if any event API is called a second time after the
        \c "shutdown" key is returned

        @note It is not recommended to use this API in @ref service_remote "remote services", as high-volume message
        processing can have a negative impact on a Qorus cluster as a whole
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> waitForEventsAnd(int min_id, Object filter, int timeout_ms) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("ServiceApi", "waitForEventsAnd", min_id, filter,
            timeout_ms);
    }

    //! return system events that meet all of the given criteria
    /**
        @param min_id the minimum event ID to return; no event wil be returned that has an event ID less than this;
        the first event ID is always 1 (if min_id <= 1 then all events are returned that meet the given criteria)
        @param filter this argument is the criteria list for "logical and" comparisons to be applied to the events.
        If an event matches all of the criteria hashes in the first argument, then it is included in the resulting
        list.  To match a criteria hash in the second argument with this API call, any of the criteria keys in a
        single hash can match, therefore, to get pure "logical and" behavior, the caller must specify only one hash
        key in each criteria hash; see @ref eventfilters "Event Filter Criteria" for a description of each criteria
        hash

        @return a hash with the following keys:
        - \c lastid: the last event ID at the time the method returns
        - \c events: a list of event hashes (see @ref eventhash "eventhash" for a detailed description); note that
          this key will be missing if no events are returned
        - \c shutdown: if this key is returned, it means the system is shutting down

        @throw GET-EVENTS-AND-ERROR empty or missing filter value
        @throw GET-EVENTS-ERROR non-hash criteria element passed in event filter
        @throw INVALID-CRITERIA-CODE invalid criteria code found in event filter
        @throw SHUTDOWN-ERROR this exception is raised if any event API is called a second time after the
        \c "shutdown" key is returned

        @note It is not recommended to use this API in @ref service_remote "remote services", as high-volume message
        processing can have a negative impact on a Qorus cluster as a whole
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> waitForEventsAnd(int min_id, Object filter) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("ServiceApi", "waitForEventsAnd", min_id, filter);
    }

    /*
    //! starts a service thread; passes the remaining arguments to the function to the new thread
    */
    /* @param code the function or service method to call; may be a string giving a function name (String), a call reference, or a closure

        @return the TID of the new thread

        @throw START-SERVICE-THREAD-ERROR the service has no "stop()" method or too many threads are already active in this service (see @ref max-service-threads)
    */
    /*
    static public int startThread(Object code) throws Throwable {
    }
    */

    /*
    //! starts a service thread; uses the second argument as the argument list to pass to the new thread
    */
    /* @param code the function or service method to call; may be a string giving a function name (String), a call reference, or a closure
        @param args the arguments for the function to start in the separate thread

        @return the TID of the new thread

        @throw START-SERVICE-THREAD-ERROR the service has no "stop()" method or too many threads are already active in this service (see @ref max-service-threads)
    */
    /*
    static public int startThreadArgs(Object code, Object args) throws Throwable {
    }
    */

    //! returns information about the current service
    /** @param cx optional thread context hash from HTTP handler if available

        @return a hash with the following keys:
        - \c type: the service type (\c "user" or \c "system")
        - \c name: the name of the service
        - \c version: the version of the service
        - \c desc: the description of the service
        - \c serviceid: the ID of the service, corresponding to \c SERVICES.SERVICEID in the database
        - \c status: either @ref OMQ.SSRunning (if there are running threads) or @ref OMQ.SSLoaded
        - \c threads: the number of currently running threads
        - \c autostart: the autostart flag
        - \c loaded: the date/time the service was loaded/started
        - \c methods: a list of hashes with \c name and \c desc keys for each method
        - \c method: the name of the current method being called
        - \c resources: a hash of resources attached to the service (may be null); each hash key is the unique resource name, and the value of each key is a hash with the following keys:
        - \c type: a string giving the resource type name (ie \c "HttpGlobalHandler", \c "HttpListener", \c "FtpListener", etc)
        - \c desc: a struct description of the resource
        - \c info: a hash with additional, free-form information about the resource
        - \c groups: a list of zero or more strings giving group names the service is a member of
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getServiceInfo(HashMap<String, Object> cx) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("ServiceApi", "getServiceInfo", cx);
    }

    //! returns information about the current service
    /**
        @return a hash with the following keys:
        - \c type: the service type (\c "user" or \c "system")
        - \c name: the name of the service
        - \c version: the version of the service
        - \c desc: the description of the service
        - \c serviceid: the ID of the service, corresponding to \c SERVICES.SERVICEID in the database
        - \c status: either @ref OMQ.SSRunning (if there are running threads) or @ref OMQ.SSLoaded
        - \c threads: the number of currently running threads
        - \c autostart: the autostart flag
        - \c loaded: the date/time the service was loaded/started
        - \c methods: a list of hashes with \c name and \c desc keys for each method
        - \c method: the name of the current method being called
        - \c resources: a hash of resources attached to the service (may be null); each hash key is the unique resource name, and the value of each key is a hash with the following keys:
        - \c type: a string giving the resource type name (ie \c "HttpGlobalHandler", \c "HttpListener", \c "FtpListener", etc)
        - \c desc: a struct description of the resource
        - \c info: a hash with additional, free-form information about the resource
        - \c groups: a list of zero or more strings giving group names the service is a member of
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getServiceInfo() throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("ServiceApi", "getServiceInfo");
    }

    /*
    //! binds an FTP handler to the service; listeners are started according to the listener information in the OMQ::AbstractFtpHandler argument
    */
    /* @param handler defines parameters and callback routines for the system FTP server

        @throw SERVICE-FTP-ERROR no listeners set in OMQ::AbstractFtpHandler, error starting listener
    */
    /*
    static public void bindFtp(AbstractFtpHandler handler) throws Throwable {
    }
    */

    /*
    //! binds an HTTP handler to the service
    */
    /* if any listener information is present, then listeners are started according to the listener information in the AbstractHttpHandler argument
        @param handler defines parameters and callback routines for the system HTTP server

        @return a list of service resource names bound to the service; multiple resource names are returned only if there are multiple listeners defined in the handler argument

        @throw SERVICE-HTTP-ERROR error starting listener, error binding URL
    */
    /*
    static public String[] bindHttp(AbstractServiceHttpHandler handler) throws Throwable {
    }
    */

    /*
    //! binds a new handler to a dedicated HTTP service listener by name
    */
    /* @param name the name of the service resource for the dedicated service listener
        @param handler defines parameters and callback routines for the system HTTP server

        @throw BIND-HANDLER-ERROR cannot bind a handler with listeners to an existing HTTP service handler
    */
    /*
    static public void bindHandler(String name, AbstractServiceHttpHandler handler) throws Throwable {
    }
    */

    /*
    //! binds a new handler to a dedicated HTTP service listener by name
    */
    /* @param name the name of the service resource for the dedicated service listener
        @param handler defines parameters and callback routines for the system HTTP server
        @param url a regex for the URL to service
        @param content_type an optional list of Content-Types to match
        @param special_headers an optional list of special headers to match
        @param isregex defines if \a url is a regular expression or not
    */
    /*
    static public void bindHandler(String name, AbstractHttpRequestHandler handler, String url,
        *softlist<auto> content_type, *softlist<auto> special_headers, boolean isregex = true) throws Throwable {
    }
    */

    //! returns contextual information about the current call
    /** @return null if no context information is available, otherwise a hash with the following possible keys; keys actually present depend on the context of the caller to the service method:
        - \c wf: this key is present if the call to the service method originated from workflow code while processing an order; the value is a hash with the following keys:
            - \c name: the name of the workflow
            - \c version: the version of the workflow
            - \c workflowid: the workflowid of the workflow
            - \c workflow_instanceid: the workflow_instanceid of the order being executed
            - \c stepid: the stepid of the step being executed
            - \c ind: the array step index of the step being executed
            - \c priority: the priority of the workflow order
            - \c started: the date/time the order started processing
            - \c options: the current workflow execution instance option hash
        - \c job: this key is present if the call to the service method originated from job code; the value is a hash with the following keys:
            - \c jobid: the metadata jobid of the job type
            - \c job_instanceid: the id of the job instance
            - \c name: the job name
            - \c version: the job version
            - \c description: the job description
            - \c trigger: a string describing the timer/trigger for the job
            - \c last_executed: the last executed date/time of the job (null if never executed before the current iteration)
            - \c last_executed_job_instanceid: the last executed instance id of the job
            - \c single_instance: true if the job can only be run in a single Qorus instance, False if no such restriction is enabled
            - \c next: the next trigger date/time
        - \c cx: this key is present if the call to the service method originated externally through the network API; the value is a hash with the following keys:
            - \c socket: the bind address used to bind the listener ("socket-info" provides more detailed information)
            - \c socket-info: a hash of socket information for the listening socket (as returned by Socket::getSocketInfo())
            - \c peer-info: a hash of socket information for the remote socket (as returned by Socket::getPeerInfo())
            - \c url: a hash of broken-down URL information (as returned from parseURL())
            - \c id: the unique HTTP connection ID
            - \c ssl: true if the request was encrypted with HTTPS, false if no
            - \c user: the current RBAC username (if any)

        @see
        - @ref OMQ::UserApi::UserApi::getUserContextInfo() "UserApi::getUserContextInfo()" for a similar method
          available in all user contexts
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getCallContext() throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("ServiceApi", "getCallContext");
    }

    //! returns a string describing the current call context
    /** @par Example:
        @code{.py}
String str = ServiceApi::getCallContextString(cx);
        @endcode

        @param cx optional thread context hash from HTTP handler if available

        @return a string describing the current call context
    */
    @SuppressWarnings("unchecked")
    static public String getCallContextString(HashMap<String, Object> cx) throws Throwable {
        return (String)QoreJavaApi.callStaticMethod("ServiceApi", "getCallContextString", cx);
    }

    //! returns a string describing the current call context
    /** @par Example:
        @code{.py}
String str = ServiceApi::getCallContextString();
        @endcode

        @return a string describing the current call context
    */
    @SuppressWarnings("unchecked")
    static public String getCallContextString() throws Throwable {
        return (String)QoreJavaApi.callStaticMethod("ServiceApi", "getCallContextString");
    }

    //! calls a system API with the argument list to the API method as a top-level argument to this method as the current user
    /** @param call the full api method name (ex: \c "omq.system.exec-synchronous-exiting"); see @ref qorusapi for a full list
        @param args any arguments to the method; if multiple argument should be passed to the method, use a list of arguments here

        @return the return value of the method

        @throw UNKNOWN-API-CALL invalid API method
        @throw INVALID-INTERNAL-API-CALL API may not be called internally (ex: omq.system.shutdown-wait())

        @see
        - @ref OMQ::UserApi::UserApi::callNetworkApiArgsWithAuthentication() "UserApi::callNetworkApiArgsWithAuthentication()"
        - @ref OMQ::UserApi::UserApi::callNetworkApiArgs() "UserApi::callNetworkApiArgs()"
        - @ref OMQ::UserApi::UserApi::callNetworkApi() "UserApi::callNetworkApi()"
    */
    static public Object callApiAsCurrentUser(String call, Object... args) throws Throwable {
        return QoreJavaApi.callStaticMethod("ServiceApi", "callApiAsCurrentUser", call, args);
    }

    //! calls a system API with the argument list to the API method as a top-level argument to this method as the current user
    /** @param call the full api method name (ex: \c "omq.system.exec-synchronous-exiting"); see @ref qorusapi for a full list
        @param args any arguments to the method; if multiple argument should be passed to the method, use a list of arguments here

        @return the return value of the method

        @throw UNKNOWN-API-CALL invalid API method
        @throw INVALID-INTERNAL-API-CALL API may not be called internally (ex: omq.system.shutdown-wait())

        @see
        - @ref OMQ::UserApi::UserApi::callNetworkApiArgsWithAuthentication() "UserApi::callNetworkApiArgsWithAuthentication()"
        - @ref OMQ::UserApi::UserApi::callNetworkApiArgs() "UserApi::callNetworkApiArgs()"
        - @ref OMQ::UserApi::UserApi::callNetworkApi() "UserApi::callNetworkApi()"
    */
    static public Object callApiAsCurrentUserArgs(String call, Object[] args) throws Throwable {
        return QoreJavaApi.callStaticMethod("ServiceApi", "callApiAsCurrentUser", call, args);
    }

    //! returns information about the given service from the service name (if it's currently loaded) and if the calling user can access the service
    /** to get information about services whether they are loaded or not, call REST API:
        @code{.py}
system/metadata/lookupserviceinfo/<type>/<name>
        @endcode

        @param type the type of service (either \c "system" or \c "user"; case is ignored)
        @param name the name of the system service to query
        @param cx optional thread context hash from HTTP handler if available

        @return a hash of service information or null if the service is not loaded; the hash will have the following structure:
        - \c type: either \c "system" or \c "user" corresponding to the argument
        - \c name: the name of the service
        - \c version: version of the service
        - \c desc: description of the service
        - \c serviceid: service ID
        - \c status: @ref OMQ.SSRunning or @ref OMQ.SSLoaded
        - \c threads: number of running threads in the service
        - \c autostart: true or false if the autostart flag is set
        - \c loaded: date/time the service was loaded
        - \c methods: list of hashes for each method with \c name and \c desc keys

        @throw SERVICE-ACCESS-ERROR the current user does not have the right to access the given service
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getServiceInfoAsCurrentUser(String type, String name, HashMap<String, Object> cx) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("ServiceApi", "getServiceInfoAsCurrentUser", type, name, cx);
    }

    //! returns information about the given service from the service name (if it's currently loaded) and if the calling user can access the service
    /** to get information about services whether they are loaded or not, call REST API:
        @code{.py}
system/metadata/lookupserviceinfo/<type>/<name>
        @endcode

        @param type the type of service (either \c "system" or \c "user"; case is ignored)
        @param name the name of the system service to query

        @return a hash of service information or null if the service is not loaded; the hash will have the following structure:
        - \c type: either \c "system" or \c "user" corresponding to the argument
        - \c name: the name of the service
        - \c version: version of the service
        - \c desc: description of the service
        - \c serviceid: service ID
        - \c status: @ref OMQ.SSRunning or @ref OMQ.SSLoaded
        - \c threads: number of running threads in the service
        - \c autostart: true or false if the autostart flag is set
        - \c loaded: date/time the service was loaded
        - \c methods: list of hashes for each method with \c name and \c desc keys

        @throw SERVICE-ACCESS-ERROR the current user does not have the right to access the given service
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getServiceInfoAsCurrentUser(String type, String name) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("ServiceApi", "getServiceInfoAsCurrentUser", type, name);
    }

    //! returns information about the given service from the serviceid (if it's currently loaded) and if the calling user can access the service
    /** to get information about services whether they are loaded or not, call REST API:
        @code{.py}
system/metadata/lookupserviceinfo/<type>/<name>
        @endcode

        @param id the serviceid of the service
        @param cx optional thread context hash from HTTP handler if available

        @return a hash of service information or null if the service is not loaded; the hash will have the following structure:
        - \c type: either \c "system" or \c "user" corresponding to the argument
        - \c name: the name of the service
        - \c version: version of the service
        - \c desc: description of the service
        - \c serviceid: service ID
        - \c status: @ref OMQ.SSRunning or @ref OMQ.SSLoaded
        - \c threads: number of running threads in the service
        - \c autostart: true or false if the autostart flag is set
        - \c loaded: date/time the service was loaded
        - \c methods: list of hashes for each method with \c name and \c desc keys

        @throw SERVICE-ACCESS-ERROR the current user does not have the right to access the given service
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getServiceInfoAsCurrentUser(int id, HashMap<String, Object> cx) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("ServiceApi", "getServiceInfoAsCurrentUser", id, cx);
    }

    //! returns information about the given service from the serviceid (if it's currently loaded) and if the calling user can access the service
    /** to get information about services whether they are loaded or not, call REST API:
        @code{.py}
system/metadata/lookupserviceinfo/<type>/<name>
        @endcode

        @param id the serviceid of the service

        @return a hash of service information or null if the service is not loaded; the hash will have the following structure:
        - \c type: either \c "system" or \c "user" corresponding to the argument
        - \c name: the name of the service
        - \c version: version of the service
        - \c desc: description of the service
        - \c serviceid: service ID
        - \c status: @ref OMQ.SSRunning or @ref OMQ.SSLoaded
        - \c threads: number of running threads in the service
        - \c autostart: true or false if the autostart flag is set
        - \c loaded: date/time the service was loaded
        - \c methods: list of hashes for each method with \c name and \c desc keys

        @throw SERVICE-ACCESS-ERROR the current user does not have the right to access the given service
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getServiceInfoAsCurrentUser(int id) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("ServiceApi", "getServiceInfoAsCurrentUser", id);
    }

    //! returns a list of hashes giving information about the currently-running workflow execution instances if the current user can access them
    /** @param name the workflow name
        @param ver the worklow version

        @return a list of hashes giving information about the currently-running workflow execution instances; if no workflow execution instances are running, then an empty list is returned; otherwise each list element is a hash with the following keys:
    - \c executionID: the workflow execution instance id
        - \c name: the name of the workflow
        - \c version: version of the workflow
        - \c workflowid: the workflowid of the workflow
        - \c mode: @ref OMQ::WM_Normal, @ref OMQ::WM_Recovery, @ref OMQ::WM_Synchronous
        - \c status: @ref OMQ::WISInitializing, @ref OMQ::WISRunning, @ref OMQ::WISWaiting, @ref OMQ::WISStopping
        - \c iterations: number of segment iterations performed so far
        - \c totalSegments: number of segments executed
        - \c errors: total number of errors encountered
        - \c warnings: total number of warnings raised
        - \c starttime: date/time the execution instance was started
        - \c options: options set on the workflow execution instance
        - \c logfile: log file name

        @throw WORKFLOW-ACCESS-ERROR the current user does not have the right to access one or more running workflows
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object>[] getRunningWorkflowListAsCurrentUser(String name, String ver) throws Throwable {
        return (HashMap<String, Object>[])QoreJavaApi.callStaticMethod("ServiceApi", "getRunningWorkflowListAsCurrentUser", name, ver);
    }

    //! returns a list of hashes giving information about the currently-running workflow execution instances if the current user can access them
    /**
        @param name the workflow name

        @return a list of hashes giving information about the currently-running workflow execution instances; if no workflow execution instances are running, then an empty list is returned; otherwise each list element is a hash with the following keys:
    - \c executionID: the workflow execution instance id
        - \c name: the name of the workflow
        - \c version: version of the workflow
        - \c workflowid: the workflowid of the workflow
        - \c mode: @ref OMQ::WM_Normal, @ref OMQ::WM_Recovery, @ref OMQ::WM_Synchronous
        - \c status: @ref OMQ::WISInitializing, @ref OMQ::WISRunning, @ref OMQ::WISWaiting, @ref OMQ::WISStopping
        - \c iterations: number of segment iterations performed so far
        - \c totalSegments: number of segments executed
        - \c errors: total number of errors encountered
        - \c warnings: total number of warnings raised
        - \c starttime: date/time the execution instance was started
        - \c options: options set on the workflow execution instance
        - \c logfile: log file name

        @throw WORKFLOW-ACCESS-ERROR the current user does not have the right to access one or more running workflows
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object>[] getRunningWorkflowListAsCurrentUser(String name) throws Throwable {
        return (HashMap<String, Object>[])QoreJavaApi.callStaticMethod("ServiceApi", "getRunningWorkflowListAsCurrentUser", name);
    }

    //! Returns information on all active jobs visible to the given user
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
        - \c single_instance: true if the job can only be run in a single Qorus instance, False if no such restriction is enabled
        - [\c next]: the next trigger date/time; this key is only included if the job is active
        - \c active: this value is always true because this API only returns information about active jobs
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getActiveJobsAsCurrentUser() throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("ServiceApi", "getActiveJobsAsCurrentUser");
    }

    //! Returns the given text or binary @ref servicefileresources "file resource" as its native type in the \c "body" key of a hash along with an HTTP response code and optionally HTTP headers; if a template exists, then the template is rendered and returned, if the given resource does not exist, then an exception is raised
    /** @par Example:
        @code{.py}
HashMap<String, Object> h = ServiceApi::getResource("image.jpg", cx);
        @endcode

        @param name the name of the resource
        @param ctx the argument hash to the template code
        @param code the HTTP response code for the response
        @param hdr any optional headers for the response (the \c "Content-Type" header is set from the templates \c "Content-Type" value automatically)

        @return a hash with the following keys:
        - \c code: the HTTP response code corresponding to the \a code argument
        - \c body: the rendered template or @ref servicefileresources "file resource"
        - \c hdr: a hash of headers corresponding to the \a hdr argument plus the \c "Content-Type" key set from the template's "Content-Type" value)

        @throw SERVICE-FILE-RESOURCE-ERROR the given service file resource does not exist

        @see
        - getResourceData()
        - getResourceWsdl()
        - @ref servicefileresources
        - @ref bindHttp()
        - @ref OMQ::AbstractServiceHttpHandler
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getResource(String name, HashMap<String, Object> ctx, int code, HashMap<String, Object> hdr) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("ServiceApi", "getResource", name, ctx, code, hdr);
    }

    //! Returns the given text or binary @ref servicefileresources "file resource" as its native type in the \c "body" key of a hash along with an HTTP response code and optionally HTTP headers; if a template exists, then the template is rendered and returned, if the given resource does not exist, then an exception is raised
    /** @par Example:
        @code{.py}
HashMap<String, Object> h = ServiceApi::getResource("image.jpg", cx);
        @endcode

        @param name the name of the resource
        @param ctx the argument hash to the template code
        @param code the HTTP response code for the response

        @return a hash with the following keys:
        - \c code: the HTTP response code corresponding to the \a code argument
        - \c body: the rendered template or @ref servicefileresources "file resource"
        - \c hdr: a hash of headers corresponding to the \a hdr argument plus the \c "Content-Type" key set from the template's "Content-Type" value)

        @throw SERVICE-FILE-RESOURCE-ERROR the given service file resource does not exist

        @see
        - getResourceData()
        - getResourceWsdl()
        - @ref servicefileresources
        - @ref bindHttp()
        - @ref OMQ::AbstractServiceHttpHandler
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getResource(String name, HashMap<String, Object> ctx, int code) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("ServiceApi", "getResource", name, ctx, code);
    }

    //! Returns the given text or binary @ref servicefileresources "file resource" as its native type in the \c "body" key of a hash along with an HTTP response code and optionally HTTP headers; if a template exists, then the template is rendered and returned, if the given resource does not exist, then an exception is raised
    /** @par Example:
        @code{.py}
HashMap<String, Object> h = ServiceApi::getResource("image.jpg", cx);
        @endcode

        @param name the name of the resource
        @param ctx the argument hash to the template code

        @return a hash with the following keys:
        - \c code: the HTTP response code; in this variant always \c 200
        - \c body: the rendered template or @ref servicefileresources "file resource"
        - \c hdr: a hash of headers corresponding to the \a hdr argument plus the \c "Content-Type" key set from the template's "Content-Type" value)

        @throw SERVICE-FILE-RESOURCE-ERROR the given service file resource does not exist

        @see
        - getResourceData()
        - getResourceWsdl()
        - @ref servicefileresources
        - @ref bindHttp()
        - @ref OMQ::AbstractServiceHttpHandler
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getResource(String name, HashMap<String, Object> ctx) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("ServiceApi", "getResource", name, ctx);
    }

    //! Returns the given text or binary  @ref servicefileresources "file resource" as its native type in the \c "body" key of a hash along with an HTTP response code and optionally HTTP headers; if a template exists, then the template is rendered and returned, if the given resource does not exist, then null is returned
    /** @par Example:
        @code{.py}
*HashMap<String, Object> h = ServiceApi::tryGetResource("image.jpg", cx);
        @endcode

        @param name the name of the resource
        @param ctx the argument hash to the template code
        @param code the HTTP response code for the response, if not present then 200 \c "OK" is assumed
        @param hdr any optional headers for the response (the \c "Content-Type" header is set from the templates \c "Content-Type" value automatically)

        @return null if the resource does not exist or a hash with the following keys:
        - \c code: the HTTP response code corresponding to the \a code argument
        - \c body: the rendered template or @ref servicefileresources "file resource"
        - \c hdr: a hash of headers corresponding to the \a hdr argument plus the \c "Content-Type" key set from the template's "Content-Type" value)

        @see
        - tryGetResourceData()
        - @ref servicefileresources
        - @ref bindHttp()
        - @ref OMQ::AbstractServiceHttpHandler
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> tryGetResource(String name, HashMap<String, Object> ctx, int code, HashMap<String, Object> hdr) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("ServiceApi", "tryGetResource", name, ctx, code, hdr);
    }

    //! Returns the given text or binary  @ref servicefileresources "file resource" as its native type in the \c "body" key of a hash along with an HTTP response code and optionally HTTP headers; if a template exists, then the template is rendered and returned, if the given resource does not exist, then null is returned
    /** @par Example:
        @code{.py}
*HashMap<String, Object> h = ServiceApi::tryGetResource("image.jpg", cx);
        @endcode

        @param name the name of the resource
        @param ctx the argument hash to the template code
        @param code the HTTP response code for the response

        @return null if the resource does not exist or a hash with the following keys:
        - \c code: the HTTP response code corresponding to the \a code argument
        - \c body: the rendered template or @ref servicefileresources "file resource"
        - \c hdr: a hash of headers corresponding to the \a hdr argument plus the \c "Content-Type" key set from the template's "Content-Type" value)

        @see
        - tryGetResourceData()
        - @ref servicefileresources
        - @ref bindHttp()
        - @ref OMQ::AbstractServiceHttpHandler
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> tryGetResource(String name, HashMap<String, Object> ctx, int code) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("ServiceApi", "tryGetResource", name, ctx, code);
    }

    //! Returns the given text or binary  @ref servicefileresources "file resource" as its native type in the \c "body" key of a hash along with an HTTP response code and optionally HTTP headers; if a template exists, then the template is rendered and returned, if the given resource does not exist, then null is returned
    /** @par Example:
        @code{.py}
*HashMap<String, Object> h = ServiceApi::tryGetResource("image.jpg", cx);
        @endcode

        @param name the name of the resource
        @param ctx the argument hash to the template code

        @return null if the resource does not exist or a hash with the following keys:
        - \c code: the HTTP response code; with this variant always \c 200
        - \c body: the rendered template or @ref servicefileresources "file resource"
        - \c hdr: a hash of headers corresponding to the \a hdr argument plus the \c "Content-Type" key set from the template's "Content-Type" value)

        @see
        - tryGetResourceData()
        - @ref servicefileresources
        - @ref bindHttp()
        - @ref OMQ::AbstractServiceHttpHandler
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> tryGetResource(String name, HashMap<String, Object> ctx) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("ServiceApi", "tryGetResource", name, ctx);
    }

    //! returns a hash of the service's @ref servicefileresources "file resources" (hash keys are service file resource names) or null if the service has none
    /** @par Example:
        @code{.py}
*HashMap<String, Object> h = ServiceApi::getResourceHash();
        @endcode

        @return a hash of the service's @ref servicefileresources "file resources" (hash keys are service file resource names) or null if the service has none

        @see
        - getResourceList()
        - @ref servicefileresources
        - @ref bindHttp()
        - @ref OMQ::AbstractServiceHttpHandler
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getResourceHash() throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("ServiceApi", "getResourceHash");
    }

    //! returns a list of the service's @ref servicefileresources "file resources" or null if the service has none
    /** @par Example:
        @code{.py}
list<auto> l = ServiceApi::getResourceList();
        @endcode

        @return a list of the service's @ref servicefileresources "file resources" or null if the service has none

        @see
        - getResourceHash()
        - @ref servicefileresources
        - @ref bindHttp()
        - @ref OMQ::AbstractServiceHttpHandler
    */
    static public String[] getResourceList() throws Throwable {
        return (String[])QoreJavaApi.callStaticMethod("ServiceApi", "getResourceList");
    }

    //! Returns the given text or binary @ref servicefileresources "file resource" as its native type; if a template exists, then the template is rendered and returned, if the given resource does not exist, then an exception is raised
    /** @par Example:
        @code{.py}
binary img = ServiceApi::getResourceData("image.jpg");
        @endcode

        @param name the name of the @ref servicefileresources "file resource"
        @param ctx an optional argument hash used if rendering a template resource

        @return the given text or binary @ref servicefileresources "file resource" as its native type; if a template exists, then the template is rendered and returned

        @throw SERVICE-FILE-RESOURCE-ERROR the given service file resource does not exist

        @see
        - getResourceData()
        - getResource()
        - getResourceWsdl()
        - @ref servicefileresources
        - @ref bindHttp()
        - @ref OMQ::AbstractServiceHttpHandler
    */
    static public Object getResourceData(String name, HashMap<String, Object> ctx) throws Throwable {
        return (String[])QoreJavaApi.callStaticMethod("ServiceApi", "getResourceData", name, ctx);
    }

    //! Returns the given text or binary @ref servicefileresources "file resource" as its native type; if a template exists, then the template is rendered and returned, if the given resource does not exist, then an exception is raised
    /** @par Example:
        @code{.py}
binary img = ServiceApi::getResourceData("image.jpg");
        @endcode

        @param name the name of the @ref servicefileresources "file resource"

        @return the given text or binary @ref servicefileresources "file resource" as its native type; if a template exists, then the template is rendered and returned

        @throw SERVICE-FILE-RESOURCE-ERROR the given service file resource does not exist

        @see
        - getResourceData()
        - getResource()
        - getResourceWsdl()
        - @ref servicefileresources
        - @ref bindHttp()
        - @ref OMQ::AbstractServiceHttpHandler
    */
    static public Object getResourceData(String name) throws Throwable {
        return (String[])QoreJavaApi.callStaticMethod("ServiceApi", "getResourceData", name);
    }

    /*
    //! Returns the given @ref servicefileresources "file resource" as a @ref WSDL::WebService object; any XSD imports are resolved as service resources; if a template exists, then the template is rendered and returned, if the given resource does not exist, then an exception is raised
    */
    /* @par Example:
        @code{.py}
WebService wsdl = ServiceApi::getResourceWsdl("interface1.wsdl");
        @endcode

        @param name the name of the @ref servicefileresources "file resource" representing the WSDL source
        @param ctx an optional argument hash used if rendering a template resource

        @return the given @ref servicefileresources "file resource" as a @ref WSDL::WebService object; any XSD imports
        are resolved as service resources; if a template exists, then the template is rendered and returned

        @throw SERVICE-FILE-RESOURCE-ERROR the given service file resource does not exist

        @see
        - getResource()
        - getResourceData()
        - @ref servicefileresources
        - @ref bindHttp()
        - @ref OMQ::AbstractServiceHttpHandler
    */
    /*
    static public WebService getResourceWsdl(String name, HashMap<String, Object> ctx) throws Throwable {
        return (WebService)QoreJavaApi.callStaticMethod("ServiceApi", "getResourceWsdl", name, ctx);
    }
    */

    /*
    //! Returns the given @ref servicefileresources "file resource" as a @ref WSDL::WebService object; any XSD imports are resolved as service resources; if a template exists, then the template is rendered and returned, if the given resource does not exist, then an exception is raised
    */
    /* @par Example:
        @code{.py}
WebService wsdl = ServiceApi::getResourceWsdl("interface1.wsdl");
        @endcode

        @param name the name of the @ref servicefileresources "file resource" representing the WSDL source

        @return the given @ref servicefileresources "file resource" as a @ref WSDL::WebService object; any XSD imports are resolved as service resources; if a template exists, then the template is rendered and returned

        @throw SERVICE-FILE-RESOURCE-ERROR the given service file resource does not exist

        @see
        - getResource()
        - getResourceData()
        - @ref servicefileresources
        - @ref bindHttp()
        - @ref OMQ::AbstractServiceHttpHandler
    */
    /*
    static public WebService getResourceWsdl(String name) throws Throwable {
        return (WebService)QoreJavaApi.callStaticMethod("ServiceApi", "getResourceWsdl", name);
    }
    */

    //! Returns the given text or binary @ref servicefileresources "file resource" as its native type; if a template exists, then the template is rendered and returned, if the given resource does not exist, then null is returned
    /** @par Example:
        @code{.py}
*binary img = UserApi::tryGetResourceData("image.jpg", cx);
        @endcode

        @param name the name of the resource
        @param ctx an optional argument hash to the template code

        @return null if the @ref servicefileresources "file resource" does not exist or the given text or binary @ref servicefileresources "file resource" as its native type; if a template exists, then the template is rendered and returned

        @see
        - tryGetResource()
        - @ref servicefileresources
        - @ref bindHttp()
        - @ref OMQ::AbstractServiceHttpHandler
    */
    static public Object tryGetResourceData(String name, HashMap<String, Object> ctx) throws Throwable {
        return QoreJavaApi.callStaticMethod("ServiceApi", "tryGetResourceData", name, ctx);
    }

    //! Returns the given text or binary @ref servicefileresources "file resource" as its native type; if a template exists, then the template is rendered and returned, if the given resource does not exist, then null is returned
    /** @par Example:
        @code{.py}
*binary img = UserApi::tryGetResourceData("image.jpg");
        @endcode

        @param name the name of the resource

        @return null if the @ref servicefileresources "file resource" does not exist or the given text or binary @ref servicefileresources "file resource" as its native type; if a template exists, then the template is rendered and returned

        @see
        - tryGetResource()
        - @ref servicefileresources
        - @ref bindHttp()
        - @ref OMQ::AbstractServiceHttpHandler
    */
    static public Object tryGetResourceData(String name) throws Throwable {
        return QoreJavaApi.callStaticMethod("ServiceApi", "tryGetResourceData", name);
    }

    //! returns true if the given service @ref servicefileresources "file resource" exists, false if not
    /** @par Example:
        @code{.py}
boolean b = ServiceApi::hasResource(name);
        @endcode

        @return true if the given service @ref servicefileresources "file resource" exists, false if not

        @see
        - @ref servicefileresources
        - @ref bindHttp()
        - @ref OMQ::AbstractServiceHttpHandler
    */
    static public boolean hasResource(String name) throws Throwable {
        return (boolean)QoreJavaApi.callStaticMethod("ServiceApi", "hasResource", name);
    }

    //! explicitly renders a @ref servicefileresources "template file resource" given the template argument hash
    /** @par Example:
        @code{.py}
HashMap<String, Object> h = ServiceApi::renderTemplate("html/index.qhtml", ctx);
        @endcode

        @param name the @ref servicefileresources "template file resource" name
        @param ctx the argument hash to the template code

        @return a hash with the following keys:
        - \c code: the HTTP response code corresponding to the \a code argument
        - \c body: the rendered template
        - \c hdr: a hash of headers corresponding to the \a hdr argument plus the \c "Content-Type" key set from the
          template's "Content-Type" value)

        @throw TEMPLATE-ERROR the named template does not exist

        @see
        - @ref servicefileresources
        - @ref bindHttp()
        - @ref OMQ::AbstractServiceHttpHandler
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> renderTemplate(String name, HashMap<String, Object> ctx) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("ServiceApi", "renderTemplate", name, ctx);
    }

    //! render a @ref servicefileresources "template file resource" and returns the rendered template if the template exists, otherwise returns null
    /** @par Example:
        @code{.py}
*HashMap<String, Object> h = ServiceApi::tryRenderTemplate(name, ctx);
        @endcode

        @param name the @ref servicefileresources "template file resource" name
        @param ctx the argument hash to the template code

        @return null if the template does not exist or a hash with the following keys:
        - \c code: the HTTP response code corresponding to the \a code argument
        - \c body: the rendered template
        - \c hdr: a hash of headers corresponding to the \a hdr argument plus the \c "Content-Type" key set from the template's "Content-Type" value)

        @see
        - @ref servicefileresources
        - @ref bindHttp()
        - @ref OMQ::AbstractServiceHttpHandler
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> tryRenderTemplate(String name, HashMap<String, Object> ctx) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("ServiceApi", "tryRenderTemplate", name, ctx);
    }

    //! returns a hash of the service's @ref servicefileresources "template file resources" (hash keys are service template resource names) or null if the service has none
    /** @par Example:
        @code{.py}
*HashMap<String, Object> h = ServiceApi::getTemplateHash();
        @endcode

        @return a hash of the service's @ref servicefileresources "template file resources" (hash keys are service template resource names) or null if the service has none

        @see
        - @ref servicefileresources
        - @ref bindHttp()
        - @ref OMQ::AbstractServiceHttpHandler
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getTemplateHash() throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("ServiceApi", "getTemplateHash");
    }

    //! returns a list of the service's @ref servicefileresources "template file resources" or null if the service has none
    /** @par Example:
        @code{.py}
list<auto> l = ServiceApi::getTemplateList();
        @endcode

        @return a list of the service's @ref servicefileresources "template file resources" or null if the service has none

        @see
        - @ref servicefileresources
        - @ref bindHttp()
        - @ref OMQ::AbstractServiceHttpHandler
    */
    static public String[] getTemplateList() throws Throwable {
        return (String[])QoreJavaApi.callStaticMethod("ServiceApi", "getTemplateList");
    }

    //! returns true if the given service @ref servicefileresources "template file resource" exists, false if not
    /** @par Example:
        @code{.py}
boolean b = ServiceApi::hasTemplate(name);
        @endcode

        @return true if the given service @ref servicefileresources "template file resource" exists, false if not

        @see
        - @ref servicefileresources
        - @ref bindHttp()
        - @ref OMQ::AbstractServiceHttpHandler
    */
    static public boolean hasTemplate(String name) throws Throwable {
        return (boolean)QoreJavaApi.callStaticMethod("ServiceApi", "hasTemplate", name);
    }

    /*
    //! registers the service as an extension of the system UI
    */
    /* @par Example:
        @code{.py}
ServiceApi::uiExtensionRegister(new MyExtensionHandler());
        @endcode

        @param handler the request handler for the requests to the extension, must be derived from @ref OMQ::QorusExtensionHandler

        The registered extension will be available from:
        - default Qorus UI, "Extensions" section
        - directly in URL <tt>http(s)://&lt;hostname&gt;:&lt;port&gt;/UIExtension/&lt;service type&gt;-&lt;service name&gt;-&lt;system resource id&gt;</tt>

        The <tt>system resource id</tt> value is assigned by Qorus itself, it is not predictable. Also it can vary accross various instalations.
        You can use <tt>uiExtensionRegister(handler, url_name)</tt> variant of this method to ensure usage of deterministic URL.
    */
    /*
    static public void uiExtensionRegister(QorusExtensionHandler handler) throws Throwable {
        QoreJavaApi.callStaticMethod("ServiceApi", "uiExtensionRegister", handler);
    }
    */

    /*
    //! registers the service as an extension of the system UI with deterministic URL path
    */
    /* @par Example:
        @code{.py}
ServiceApi::uiExtensionRegister(new MyExtensionHandler(), "my_extension");
        @endcode

        @param handler the request handler for the requests to the extension, must be derived from @ref OMQ::QorusExtensionHandler
        @param url_name custom name used in public URL

        The registered extension will be available from:
        - default Qorus UI, "Extensions" section
        - directly in URL <tt>http(s)://&lt;hostname&gt;:&lt;port&gt;/UIExtension/&lt;<b>url_name</b>&gt;</tt>
    */
    /*
    static public void uiExtensionRegister(QorusExtensionHandler handler, String url_name) throws Throwable {
        QoreJavaApi.callStaticMethod("ServiceApi", "uiExtensionRegister", handler, url_name);
    }
    */

    /*
    //! registers an HTTP chunked data handler as a service resource
    */
    /* @par Example:
        @code{.py}
ServiceApi::streamRegister("stream", "GET", factory, "returns a data stream with log information");
        @endcode

        @param name the name of the stream handler
        @param methods the HTTP methods acceptable for this stream; when acquired with other methods, a 405 Method Not Allowed response is returned
        @param factory a closure or call reference that returns an AbstractRestStreamRequestHandler object, takes the following args: hash cx, *hash ah
        @param desc a description for the stream
    */
    /*
    static public void streamRegister(String name, String[] methods, Object factory, String desc) throws Throwable {
        QoreJavaApi.callStaticMethod("ServiceApi", "streamRegister", name, methods, factory, desc);
    }
    */

    /*
    //! registers the service as providing persistent/dedicated HTTP connection support
    */
    /* @par Example:
        @code{.py}
ServiceApi::persistenceRegister(code);
        @endcode

        @param factory a closure or call reference that returns a persistence tracking object derived from @ref OMQ::AbstractPersistentDataHelper, takes the following args: HashMap<String, Object> cx, *HashMap<String, Object> ah

        @throw SERVICE-PERSISTENCE-ERROR a persistence handler has already been registered
    */
    /*
    static public void persistenceRegister(Object factory) throws Throwable {
        QoreJavaApi.callStaticMethod("ServiceApi", "persistenceRegister", factory);
    }
    */

    /*
    //! terminates a persistent connection in the current thread
    */
    /* @par Example:
        @code{.py}
ServiceApi::persistenceThreadTerminate();
        @endcode

        @throw SERVICE-PERSISTENCE-ERROR the current thread is not in a persistent connection
    */
    static public void persistenceThreadTerminate() throws Throwable {
        QoreJavaApi.callStaticMethod("ServiceApi", "persistenceThreadTerminate");
    }

    //! starts one or more new global HTTP listeners; listeners will be started on all possible bind addresses in case more than one interface is resolved from the bind address given
    /** @param bind the bind address of the new listener; listeners will be started on all possible bind addresses in case more than one interface is resolved from the bind address given
        @param cert_path the file name of the X.509 certificate in PEM format (only for HTTPS listeners)
        @param key_path the file name of the private key for the X.509 certificate in PEM format (only for HTTPS listeners)
        @param key_password the optional password for the private key
        @param name an optional name prefix for the listener; the final listener name will have the listener id appended to it and will be returned in the \c "name" key in each hash element in the return value for each listener started
        @param family one of the following @ref network_address_family_constants "network family constants":
        - @ref Qore::AF_INET "AF_INET": for binding an IPv4 socket
        - @ref Qore::AF_INET6 "AF_INET6": for binding an IPv6 socket
        - @ref Qore::AF_UNSPEC "AF_UNSPEC": for binding a socket with any available address family

        @return a list of hashes for each listener started, each hash having the following keys (note that for UNIX domain socket listeners the \c hostname, \c hostname_desc, and \c port keys will not be present):
        - \c hostname: the hostname of the interface
        - \c hostname_desc: a descriptive string for the hostname including the address family (ex: \c "ipv6[localhost]")
        - \c address: the address of the listener (i.e. \c "192.168.30.4", etc)
        - \c address_desc: a descriptive string for the hostname including the address family (ex: \c "ipv6[::1]")
        - \c port: the port number
        - \c family: an integer giving the address family (\c AF_INET, \c AF_INET6, \c AF_UNIX, etc)
        - \c familystr: a string describing the address family (ex: \c "ipv6")
        - \c proto: either \c "http" or \c "https"
        - \c id: the Qorus ID of the listener
        - \c bind: a string giving the bind address used (ex: \c "127.0.0.1:8001")

        @note listeners started with this API will be served by global Qorus HTTP handlers; they will not be added as service-specific listeners

        @see
        - stopListener()
        - stopListenerId()
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object>[] startListeners(String bind, String cert_path, String key_path, String key_password,
        String name, int family) throws Throwable {
        return (HashMap<String, Object>[])QoreJavaApi.callStaticMethod("ServiceApi", "startListeners", bind, cert_path, key_path, key_password, name, family);
    }

    //! starts one or more new global HTTP listeners; listeners will be started on all possible bind addresses in case more than one interface is resolved from the bind address given
    /** @param bind the bind address of the new listener; listeners will be started on all possible bind addresses in case more than one interface is resolved from the bind address given
        @param cert_path the file name of the X.509 certificate in PEM format (only for HTTPS listeners)
        @param key_path the file name of the private key for the X.509 certificate in PEM format (only for HTTPS listeners)
        @param key_password the optional password for the private key
        @param name an optional name prefix for the listener; the final listener name will have the listener id appended to it and will be returned in the \c "name" key in each hash element in the return value for each listener started

        @return a list of hashes for each listener started, each hash having the following keys (note that for UNIX domain socket listeners the \c hostname, \c hostname_desc, and \c port keys will not be present):
        - \c hostname: the hostname of the interface
        - \c hostname_desc: a descriptive string for the hostname including the address family (ex: \c "ipv6[localhost]")
        - \c address: the address of the listener (i.e. \c "192.168.30.4", etc)
        - \c address_desc: a descriptive string for the hostname including the address family (ex: \c "ipv6[::1]")
        - \c port: the port number
        - \c family: an integer giving the address family (\c AF_INET, \c AF_INET6, \c AF_UNIX, etc)
        - \c familystr: a string describing the address family (ex: \c "ipv6")
        - \c proto: either \c "http" or \c "https"
        - \c id: the Qorus ID of the listener
        - \c bind: a string giving the bind address used (ex: \c "127.0.0.1:8001")

        @note listeners started with this API will be served by global Qorus HTTP handlers; they will not be added as service-specific listeners

        @see
        - stopListener()
        - stopListenerId()
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object>[] startListeners(String bind, String cert_path, String key_path, String key_password,
        String name) throws Throwable {
        return (HashMap<String, Object>[])QoreJavaApi.callStaticMethod("ServiceApi", "startListeners", bind, cert_path, key_path, key_password, name);
    }

    //! starts one or more new global HTTP listeners; listeners will be started on all possible bind addresses in case more than one interface is resolved from the bind address given
    /** @param bind the bind address of the new listener; listeners will be started on all possible bind addresses in case more than one interface is resolved from the bind address given
        @param cert_path the file name of the X.509 certificate in PEM format (only for HTTPS listeners)
        @param key_path the file name of the private key for the X.509 certificate in PEM format (only for HTTPS listeners)
        @param key_password the optional password for the private key

        @return a list of hashes for each listener started, each hash having the following keys (note that for UNIX domain socket listeners the \c hostname, \c hostname_desc, and \c port keys will not be present):
        - \c hostname: the hostname of the interface
        - \c hostname_desc: a descriptive string for the hostname including the address family (ex: \c "ipv6[localhost]")
        - \c address: the address of the listener (i.e. \c "192.168.30.4", etc)
        - \c address_desc: a descriptive string for the hostname including the address family (ex: \c "ipv6[::1]")
        - \c port: the port number
        - \c family: an integer giving the address family (\c AF_INET, \c AF_INET6, \c AF_UNIX, etc)
        - \c familystr: a string describing the address family (ex: \c "ipv6")
        - \c proto: either \c "http" or \c "https"
        - \c id: the Qorus ID of the listener
        - \c bind: a string giving the bind address used (ex: \c "127.0.0.1:8001")

        @note listeners started with this API will be served by global Qorus HTTP handlers; they will not be added as service-specific listeners

        @see
        - stopListener()
        - stopListenerId()
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object>[] startListeners(String bind, String cert_path, String key_path, String key_password) throws Throwable {
        return (HashMap<String, Object>[])QoreJavaApi.callStaticMethod("ServiceApi", "startListeners", bind, cert_path, key_path, key_password);
    }

    //! starts one or more new global HTTP listeners; listeners will be started on all possible bind addresses in case more than one interface is resolved from the bind address given
    /** @param bind the bind address of the new listener; listeners will be started on all possible bind addresses in case more than one interface is resolved from the bind address given

        @return a list of hashes for each listener started, each hash having the following keys (note that for UNIX domain socket listeners the \c hostname, \c hostname_desc, and \c port keys will not be present):
        - \c hostname: the hostname of the interface
        - \c hostname_desc: a descriptive string for the hostname including the address family (ex: \c "ipv6[localhost]")
        - \c address: the address of the listener (i.e. \c "192.168.30.4", etc)
        - \c address_desc: a descriptive string for the hostname including the address family (ex: \c "ipv6[::1]")
        - \c port: the port number
        - \c family: an integer giving the address family (\c AF_INET, \c AF_INET6, \c AF_UNIX, etc)
        - \c familystr: a string describing the address family (ex: \c "ipv6")
        - \c proto: either \c "http" or \c "https"
        - \c id: the Qorus ID of the listener
        - \c bind: a string giving the bind address used (ex: \c "127.0.0.1:8001")

        @note listeners started with this API will be served by global Qorus HTTP handlers; they will not be added as service-specific listeners

        @see
        - stopListener()
        - stopListenerId()
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object>[] startListeners(String bind) throws Throwable {
        return (HashMap<String, Object>[])QoreJavaApi.callStaticMethod("ServiceApi", "startListeners", bind);
    }

    //! stops a single listener based on its name or bind address; does not return until all connections on the listener have closed
    /** @see
        - startListeners()
        - stopListenerId()
    */
    static public void stopListener(String name) throws Throwable {
        QoreJavaApi.callStaticMethod("ServiceApi", "stopListener", name);
    }

    //! stops a single listener based on its listener ID; does not return until all connections on the listener have closed
    /** @see
        - startListeners()
    */
    static public void stopListenerId(int id) throws Throwable {
        QoreJavaApi.callStaticMethod("ServiceApi", "stopListenerId", id);
    }

    /*
    //! starts a dedicated SOAP listener with the given WSDL and registers the current service as a SOAP service and exports its methods that map to SOAP operations in the given WSDL to be called from the Qorus HttpServer with the SOAP protocol
    */
    /* @par Example:
        @code{.py}
hash opts.wsdl = ServiceApi::getResourceData("MySoapService.wsdl");
list ret = ServiceApi::registerSoapListener(opts, port);
log(LL_INFO, "soap listeners: %y", ret);
        @endcode

        Creates a mapping in the system SoapHandler from the given WSDL to the current service.  SOAP operations defined in the WSDL will be mapped directly to Qorus service methods with the same names as the SOAP operations.

        @param sh a hash with the following keys (only \c wsdl, \c wsdl_file, or \c wsdl_resource is required)):
        - \c wsdl, \c wsdl_file, or \c wsdl_resource: a URL to the WSDL, the WSDL string (XSD), a WebService object, or a file resource name giving the WSDL file
        - \c service: a string giving the name of the SOAP service to map to this service; this key is only necessary to set if the WSDL defines multiple SOAP services
        - \c cert_path: (optional) a path to an X509 certificate for HTTPS listeners
        - \c key_path: (optional) a path to a private key file for an X509 certificate for HTTPS listeners
        - \c key_password: (optional) an optional string giving the password for the private key (PEM format only)
        - \c cert: (optional) a Qore::SSLCertificate object for HTTPS listeners
        - \c key: (optional) a Qore::SSLPrivateKey object for HTTPS listeners
        @param bind the bind address of the new listener; listeners will be started on all possible bind addresses in case more than one interface is resolved from the bind address given
        @param family one of the following @ref network_address_family_constants "network family constants":
        - @ref Qore::AF_INET "AF_INET": for binding an IPv4 socket
        - @ref Qore::AF_INET6 "AF_INET6": for binding an IPv6 socket
        - @ref Qore::AF_UNSPEC "AF_UNSPEC": for binding a socket with any available address family
        @param auth if null then the system authenticator is used, otherwise an authenticator object for the listener; to authenticate all requests, use an object of class @ref OMQ::PermissiveAuthenticator "PermissiveAuthenticator"

        @return a list of resource names for the HTTP listener resources added to the service

        @throw REGISTER-SOAP-LISTENER-ERROR missing \c wsdl or \c wsdl_file key in argument hash; cannot find service; multiple services defined by WSDL but no \c service key given in argument hash

        @see
        - registerSoapListeners()
    */
    /*
    static public String[] registerSoapListener(HashMap<String, Object> sh, String bind, int family,
        AbstractAuthenticator auth) throws Throwable {
        return (String[])QoreJavaApi.callStaticMethod("ServiceApi", "registerSoapListener", sh, bind, family, auth);
    }
    */

    /*
    //! starts a dedicated SOAP listener with one or more WSDLs and registers the current service as a SOAP service and exports all methods that map to SOAP operations in the given WSDLs to be called from the Qorus HttpServer with the SOAP protocol
    */
    /* @par Example:
        @code{.py}
list<HashMap<String, Object>> sl = (
    {"wsdl": ServiceApi::getResourceData("MySoapService1.wsdl"},
    {"wsdl": ServiceApi::getResourceData("MySoapService2.wsdl"},
);
list<auto> ret = ServiceApi::registerSoapListeners(sl, port);
log(LL_INFO, "soap listeners: %y", ret);
        @endcode

        Creates a mapping in the system SoapHandler from the given WSDLs to the current service.  SOAP operations defined in the WSDLs will be mapped directly to Qorus service methods with the same names as the SOAP operations.

        @param sl a list of hashes with the following keys (only \c wsdl, \c wsdl_file, or \c wsdl_resource is required):
        - \c wsdl, \c wsdl_file, or \c wsdl_resource: a URL to the WSDL, the WSDL string (XSD), a WebService object, or a file resource name giving the WSDL file
        - \c service: a string giving the name of the SOAP service to map to this service; this key is only necessary to set if the WSDL defines multiple SOAP services
        @param bind the bind address of the new listener; listeners will be started on all possible bind addresses in case more than one interface is resolved from the bind address given
        @param lh an optional hash of listener info for HTTPS listeners
        - \c cert_path: (optional) a path to an X509 certificate for HTTPS listeners
        - \c key_path: (optional) a path to a private key file for an X509 certificate for HTTPS listeners
        - \c key_password: (optional) an optional string giving the password for the private key (PEM format only)
        - \c cert: (optional) a Qore::SSLCertificate object for HTTPS listeners
        - \c key: (optional) a Qore::SSLPrivateKey object for HTTPS listeners
        @param family one of the following @ref network_address_family_constants "network family constants":
        - @ref Qore::AF_INET "AF_INET": for binding an IPv4 socket
        - @ref Qore::AF_INET6 "AF_INET6": for binding an IPv6 socket
        - @ref Qore::AF_UNSPEC "AF_UNSPEC": for binding a socket with any available address family
        @param auth if null then the system authenticator is used, otherwise an authenticator object for the listener; to authenticate all requests, use an object of class @ref OMQ::PermissiveAuthenticator "PermissiveAuthenticator"

        @return a list of resource names for the HTTP listener resources added to the service

        @throw REGISTER-SOAP-LISTENER-ERROR missing \c wsdl or \c wsdl_file key in argument hash; cannot find service; multiple services defined by WSDL but no \c service key given in argument hash

        @see
        - registerSoapListener()
    */
    /*
    static public String[] registerSoapListeners(HashMap<String, Object>[] sl, String bind, *HashMap<String, Object> lh, int family = AF_UNSPEC,
        *HttpServer::AbstractAuthenticator auth) throws Throwable {
    }
    */

    //! return the static data hash for the current workflow order if the service call was made from a workflow order, otherwise return null
    /**
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> tryGetWfStaticData() throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("ServiceApi", "tryGetWfStaticData");
    }

    //! return the dynamic data hash for the current workflow order if the service call was made from a workflow order, otherwise return null
    /**
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> tryGetWfDynamicData() throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("ServiceApi", "tryGetWfDynamicData");
    }

    //! return the temp data hash for the current workflow order if the service call was made from a workflow order, otherwise return null
    /**
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> tryGetWfTempData() throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("ServiceApi", "tryGetWfTempData");
    }

    //! serializes the given hash and stores against the service's state data in \c SERVICE_STATE_DATA
    /** @param data the state data to serialize and store against the service's state data in \c SERVICE_STATE_DATA

        @see
        - getStateData()
        - @ref OMQ::UserApi::Job::JobApi::saveStateData() "JobApi::saveStateData()"
        - @ref OMQ::UserApi::Job::JobApi::getStateData() "JobApi::getStateData()"
        - @ref rest_api_GET_latest_services__id_or_name_
        - @ref rest_api_PUT_latest_services__id_or_name__setStateData
    */
    static public void saveStateData(HashMap<String, Object> data) throws Throwable {
        QoreJavaApi.callStaticMethod("ServiceApi", "saveStateData", data);
    }

    //! removes all service state data in \c SERVICE_STATE_DATA for the current service
    /**
        @see
        - getStateData()
        - @ref OMQ::UserApi::Job::JobApi::saveStateData() "JobApi::saveStateData()"
        - @ref OMQ::UserApi::Job::JobApi::getStateData() "JobApi::getStateData()"
        - @ref rest_api_GET_latest_services__id_or_name_
        - @ref rest_api_PUT_latest_services__id_or_name__setStateData
    */
    static public void saveStateData() throws Throwable {
        QoreJavaApi.callStaticMethod("ServiceApi", "saveStateData");
    }

    //! returns any service state state data stored with saveStateData()
    /** @return any service state state data stored with saveStateData()

        @note service state state data is automatically cleared when a service instance gets a @ref OMQ.StatComplete status

        @see
        - saveStateData()
        - @ref OMQ::UserApi::Job::JobApi::getStateData() "JobApi::getStateData()"
        - @ref OMQ::UserApi::Job::JobApi::saveStateData() "JobApi::saveStateData()"
        - @ref rest_api_GET_latest_services__id_or_name_
        - @ref rest_api_PUT_latest_services__id_or_name__setStateData
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getStateData() throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("ServiceApi", "getStateData");
    }

    //! Changes option values on a service
    /**
        @param opts a hash of option-value pairs

        @throw SERVICE-OPTION-ERROR invalid option name

        @see
        - @ref OMQ::UserApi::Service::ServiceApi::setOption()
        - getOption()
    */
    static public void setOption(HashMap<String, Object> opts) throws Throwable {
        QoreJavaApi.callStaticMethod("ServiceApi", "setOption", opts);
    }

    //! Changes a single option value on a service
    /**
        @param option the option to set
        @param value the value to set for the option

        @throw SERVICE-OPTION-ERROR invalid option name

        @see
        - @ref OMQ::UserApi::Service::ServiceApi::setOption()
        - getOption()
    */
    static public void setOption(String option, Object value) throws Throwable {
        HashMap<String, Object> opts = new HashMap<String, Object>() {
            {
                put(option, value);
            }
        };
        QoreJavaApi.callStaticMethod("ServiceApi", "setOption", opts);
    }

    //! Returns the value of all service options
    /**
        @return all service-level options are returned as a hash

        @see
        - @ref OMQ::UserApi::Service::ServiceApi::getOption()
        - setOption()
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getOption() throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("ServiceApi", "getOption");
    }

    //! Returns the value of the named service option or options
    /** If the option is not set on the service, and it is a valid system option, then the value of the system
        option will be returned.

        @param args the list of options to return

        @return the value requested directly if only one argument is passed, otherwise a hash of option keys and
        values; note that if no arguments are passed to the method all service-level options are returned as a hash

        @note Invalid options do not cause an errors to be raised; the associated key
        values in the hash returned will be null

        @see
        - @ref OMQ::UserApi::Service::ServiceApi::getOption()
        - setOption()
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getOption(String... args) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("ServiceApi", "getOption", (Object)args);
    }

    //! Returns the value of the named service option
    /** If the option is not set on the service, and it is a valid system option, then the value of the system option
        will be returned.

        @return the value of the requested option

        @note Invalid options do not cause an errors to be raised; the associated value returned will be null

        @see @ref OMQ::UserApi::Workflow::WorkflowApi::getOption() "WorkflowApi::getOption()"
    */
    static public Object getOption(String key) throws Throwable {
        return QoreJavaApi.callStaticMethod("ServiceApi", "getOption", key);
    }

    //! puts the current thread to sleep for a certain number of seconds
    /**
        If the service is stopping, this method returns immediately with a
        return value of -1; otherwise the current thread is put to sleep for the full time period requested.  If this
        method (or usleep()) is called again after -1 is returned, then a \c "STOP-ERROR" exception is thrown.

        @param arg the number of seconds to sleep

        @return 0 if current thread was put to sleep for the full time period; -1 if the sleep was interrupted because
        the current object is being stopped

        @throw STOP-ERROR the current object is stopping and this method already returned -1 as a warning

        @see
        - @ref OMQ::UserApi::Service::ServiceApi::sleep()
        - usleep()
    */
    static public int sleep(int arg) throws Throwable {
        return (int)QoreJavaApi.callStaticMethod("ServiceApi", "sleep", arg);
    }

    //! puts the current thread to sleep for a certain number of microseconds
    /**
        If the service is stopping, this method returns immediately with a return
        value of -1; otherwise the current thread is put to sleep for the full time period requested.  If this method
        (or sleep()) is called again after -1 is returned, then a \c "STOP-ERROR" exception is thrown.

        @param arg the number of microseconds to sleep (1 microsecond = 1/1000000 of a second)

        @return 0 if current thread was put to sleep for the full time period; -1 if the sleep was interrupted because
        the current object is being stopped

        @throw STOP-ERROR the current object is stopping and this method already returned -1 as a warning

        @see
        - @ref OMQ::UserApi::Service::ServiceApi::usleep()
        - sleep()
    */
    static public int usleep(int arg) throws Throwable {
        return (int)QoreJavaApi.callStaticMethod("ServiceApi", "usleep", arg);
    }

    //! puts the current thread to sleep for a certain number of microseconds
    /**
        If the service is stopping, this method returns immediately with a return
        value of -1; otherwise the current thread is put to sleep for the full time period requested.  If this method
        (or sleep()) is called again after -1 is returned, then a \c "STOP-ERROR" exception is thrown.

        @param arg the amount of time in microseconds to sleep (1 microsecond = 1/1000000 of a second)

        @return 0 if current thread was put to sleep for the full time period; -1 if the sleep was interrupted because
        the current object is being stopped

        @throw STOP-ERROR the current object is stopping and this method already returned -1 as a warning

        @see
        - @ref OMQ::UserApi::Service::ServiceApi::usleep()
        - sleep()
    */
    static public int usleep(QoreRelativeTime arg) throws Throwable {
        return (int)QoreJavaApi.callStaticMethod("ServiceApi", "usleep", arg);
    }

    //! returns the value of the given configuration item
    /** @par Example:
        @code{.java}
Object val = ServiceApi.getConfigItemValue(item, local_context);
        @endcode

        @param item the name of the service configuration item; service configuration item values
        take precedence over values on global level if both are set otherwise if both are not set
        the default value is returned
        @param local_context the caller can supply its "local" context for template variables (plus user context info is
                             added - see @ref UserApi::getUserContextInfo() method)
        @param expand_complex_values if true then lists and hashes will have their string values expanded recursively

        @return the value of the given service configuration item

        @throw CONFIG-ITEM-ERROR thrown if the configuration item is not valid

        @note the value is always substituted with
        @ref com.qoretechnologies.qorus.UserApi.expandTemplatedValue() "UserApi.expandTemplatedValue()"; make sure and escape any \c "$"
        characters with a backslash (\c "\") to avoid template substitution

        @see @ref serviceconfigitems
    */
    static public Object getConfigItemValue(String item, HashMap<String, Object> local_context,
                                            boolean expand_complex_values) throws Throwable {
        return QoreJavaApi.callStaticMethod("ServiceApi", "getConfigItemValue", item, local_context, expand_complex_values);
    }

    //! returns the value of the given configuration item
    /** @par Example:
        @code{.java}
Object val = ServiceApi.getConfigItemValue(item, local_context);
        @endcode

        @param item the name of the service configuration item; service configuration item values
        take precedence over values on global level if both are set otherwise if both are not set
        the default value is returned
        @param local_context the caller can supply its "local" context for template variables (plus user context info is
                             added - see @ref UserApi::getUserContextInfo() method)

        @return the value of the given service configuration item

        @throw CONFIG-ITEM-ERROR thrown if the configuration item is not valid

        @note the value is always substituted with
        @ref com.qoretechnologies.qorus.UserApi.expandTemplatedValue() "UserApi.expandTemplatedValue()"; make sure and escape any \c "$"
        characters with a backslash (\c "\") to avoid template substitution

        @see @ref serviceconfigitems
    */
    static public Object getConfigItemValue(String item, HashMap<String, Object> local_context) throws Throwable {
        return QoreJavaApi.callStaticMethod("ServiceApi", "getConfigItemValue", item, local_context);
    }

    //! returns the value of the given configuration item
    /** @par Example:
        @code{.java}
Object val = ServiceApi.getConfigItemValue(item);
        @endcode

        @param item the name of the service configuration item; service configuration item values
        take precedence over values on global level if both are set otherwise if both are not set
        the default value is returned

        @return the value of the given service configuration item

        @throw CONFIG-ITEM-ERROR thrown if the configuration item is not valid

        @note the value is always substituted with
        @ref com.qoretechnologies.qorus.UserApi.expandTemplatedValue() "UserApi.expandTemplatedValue()"; make sure and escape any \c "$"
        characters with a backslash (\c "\") to avoid template substitution

        @see @ref serviceconfigitems
    */
    static public Object getConfigItemValue(String item) throws Throwable {
        return QoreJavaApi.callStaticMethod("ServiceApi", "getConfigItemValue", item);
    }

    //! returns a hash of all configuration items for the current service as a combination of local and global configuration items
    /** @par Example:
        @code{.java}
HashMap<String, Object> config = ServiceApi.getConfigItemHash(local_context);
        @endcode

        @param local_context the caller can supply its "local" context for template variables (plus user context info is
                             added - see @ref UserApi::getUserContextInfo() method)

        @return a hash of all configuration items for the current service; keys are config item names; values are
        config item values.  If there are no config items for the current service, then an empty hash is returned.

        @note
        - if there are local configuration item values and values on global level, local values will take precedence
          over the global values
        - values are always substituted with
        @ref com.qoretechnologies.qorus.UserApi.expandTemplatedValue() "UserApi.expandTemplatedValue()"; make sure and escape any \c "$"
        characters with a backslash (\c "\") to avoid template substitution

        @see @ref serviceconfigitems
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getConfigItemHash(HashMap<String, Object> local_context) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("ServiceApi", "getConfigItemHash", local_context);
    }

    //! returns a hash of all configuration items for the current service as a combination of local and global configuration items
    /** @par Example:
        @code{.java}
HashMap<String, Object> config = ServiceApi.getConfigItemHash();
        @endcode

        @return a hash of all configuration items for the current service; keys are config item names; values are
        config item values.  If there are no config items for the current service, then an empty hash is returned.

        @note
        - if there are local configuration item values and values on global level, local values will take precedence
          over the global values
        - values are always substituted with
        @ref com.qoretechnologies.qorus.UserApi.expandTemplatedValue() "UserApi.expandTemplatedValue()"; make sure and escape any \c "$"
        characters with a backslash (\c "\") to avoid template substitution

        @see @ref serviceconfigitems
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getConfigItemHash() throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("ServiceApi", "getConfigItemHash");
    }

    //! Set a callback for config item value changes in the service
    /** @par Example:
        @code{.java}
class MyService extends QorusService {
    private void doSomething(String config_item_name) {
        // ...
    }

    void init() {
        ConfigItemValueCallback callback = (String item_name) -> doSomething(item_name);
        setConfigItemChangeCallback(callback);
    }
}
        @endcode

        @param callback the callback in the service; must take a single string argument giving the name of the config
        item whose value was updated

        @note The callback is executed asynchronously to the update; there can be a lag between the actual update and
        the delivery of the message from @ref qorus-core "qorus-core" to the remote process (if the interface is
        running remotely), also the callback is always run in a background thread that is unsynchronized with the
        change of the config item value; keep these facts in mind when writing code that reacts to config item value
        updates.

        @since Qorus 4.1
    */
    static public void setConfigItemChangeCallback(ConfigItemValueCallback callback) throws Throwable {
        QoreJavaApi.callStaticMethod("ServiceApi", "setConfigItemChangeCallback", callback);
    }
}
