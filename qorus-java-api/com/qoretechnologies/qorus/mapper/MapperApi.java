/** Qorus Java API
 *
 */

package com.qoretechnologies.qorus.mapper;

// java imports
import java.util.Map;
import java.util.HashMap;
import java.time.ZonedDateTime;

// jni module imports
import org.qore.jni.QoreJavaApi;
import org.qore.jni.QoreObject;

//! This class is used for callbacks for config item updates
/** @ref com.qoretechnologies.qorus.service.ServiceApi.setConfigItemChangeCallback() "ServiceApi.setConfigItemChangeCallback()"
 */
public class MapperApi {
    //! returns a hash for the current user context
    /** @par Example:
        @code{.py}
Map<String, Object> h = MapperApi::getUserContextInfo();
        @endcode

        @return a hash describing the current user context or @ref nothing if called outside a workflow, service, or job; hash keys are as follows:
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
    */
    @SuppressWarnings("unchecked")
    public static HashMap<String, Object> getUserContextInfo() throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("UserApi", "getUserContextInfo");
    }

    //! returns the value of the given configuration item on global level; throws an exception if there is no value on global level for the configuration item
    /** @param item the name of the configuration item to retrieve the value
        @param local_context the caller can supply its "local" context for template variables (plus user context info is
        added - see @ref MapperApi::getUserContextInfo() method)
        @param expand_complex_values if true then lists and hashes will have their string values expanded recursively

        @return the value of the given configuration item on global level

        @throw CONFIG-ITEM-ERROR thrown if the configuration item is not valid

        @note the value is always substituted with
        @ref OMQ::UserApi::UserApi::expandTemplatedValue() "UserApi::expandTemplatedValue()"; make sure and escape any \c "$"
        characters with a backslash (\c "\") to avoid template substitution

        @see getGlobalConfigItemValueWithDefault()
    */
    public static Object getGlobalConfigItemValue(String item, Map<String, Object> local_context,
                                                  boolean expand_complex_values) throws Throwable {
        return QoreJavaApi.callStaticMethod("UserApi", "getGlobalConfigItemValue", item, local_context, expand_complex_values);
    }

    //! returns the value of the given configuration item on global level; throws an exception if there is no value on global level for the configuration item
    /** @param item the name of the configuration item to retrieve the value
        @param local_context the caller can supply its "local" context for template variables (plus user context info is
        added - see @ref MapperApi::getUserContextInfo() method)

        @return the value of the given configuration item on global level

        @throw CONFIG-ITEM-ERROR thrown if the configuration item is not valid

        @note the value is always substituted with
        @ref OMQ::UserApi::UserApi::expandTemplatedValue() "UserApi::expandTemplatedValue()"; make sure and escape any \c "$"
        characters with a backslash (\c "\") to avoid template substitution

        @see getGlobalConfigItemValueWithDefault()
    */
    public static Object getGlobalConfigItemValue(String item, Map<String, Object> local_context) throws Throwable {
        return QoreJavaApi.callStaticMethod("UserApi", "getGlobalConfigItemValue", item, local_context);
    }

    //! returns the value of the given configuration item on global level; throws an exception if there is no value on global level for the configuration item
    /** @param item the name of the configuration item to retrieve the value

        @return the value of the given configuration item on global level

        @throw CONFIG-ITEM-ERROR thrown if the configuration item is not valid

        @note the value is always substituted with
        @ref OMQ::UserApi::UserApi::expandTemplatedValue() "UserApi::expandTemplatedValue()"; make sure and escape any \c "$"
        characters with a backslash (\c "\") to avoid template substitution

        @see getGlobalConfigItemValueWithDefault()
    */
    public static Object getGlobalConfigItemValue(String item) throws Throwable {
        return QoreJavaApi.callStaticMethod("UserApi", "getGlobalConfigItemValue", item);
    }

    //! returns the value of the given configuration item on global level; throws an exception if there is no value on global level for the configuration item
    /** @param item the name of the configuration item to retrieve the value
        @param default_value the value to be returned if the value is not set
        @param local_context the caller can supply its "local" context for template variables (plus user context info is
        added - see @ref MapperApi::getUserContextInfo() method)

        @return the value of the given global configuration item or \a default_value, if no value is set at the
        global level for the given configuration item

        @note
        - the value is always substituted with
          @ref OMQ::UserApi::UserApi::expandTemplatedValue() "UserApi::expandTemplatedValue()"
        - if the config item is not set, \a default_value is returned after substitutions with
          @ref OMQ::UserApi::UserApi::expandTemplatedValue() "UserApi::expandTemplatedValue()"
        - make sure and escape any \c "$" characters with a backslash (\c "\") to avoid template substitution

        @see getGlobalConfigItemValue()
    */
    public static Object getGlobalConfigItemValueWithDefault(String item, Object default_value, Map<String, Object> local_context) throws Throwable {
        return QoreJavaApi.callStaticMethod("UserApi", "getGlobalConfigItemValueWithDefault", item, default_value, local_context);
    }

    //! returns the value of the given configuration item on global level; throws an exception if there is no value on global level for the configuration item
    /** @param item the name of the configuration item to retrieve the value
        @param default_value the value to be returned if the value is not set

        @return the value of the given global configuration item or \a default_value, if no value is set at the
        global level for the given configuration item

        @note
        - the value is always substituted with
          @ref OMQ::UserApi::UserApi::expandTemplatedValue() "UserApi::expandTemplatedValue()"
        - if the config item is not set, \a default_value is returned after substitutions with
          @ref OMQ::UserApi::UserApi::expandTemplatedValue() "UserApi::expandTemplatedValue()"
        - make sure and escape any \c "$" characters with a backslash (\c "\") to avoid template substitution

        @see getGlobalConfigItemValue()
    */
    public static Object getGlobalConfigItemValueWithDefault(String item, Object default_value) throws Throwable {
        return QoreJavaApi.callStaticMethod("UserApi", "getGlobalConfigItemValueWithDefault", item, default_value);
    }

    //! returns a hash of system info
    /** @return a hash of system info with the following keys:
        - \c instance-key: value of the system option by the same name
        - \c session-id: the session ID for the current Qorus application session
        - \c omq-version: the version string for the Qorus server
        - \c omq-version-code: a numeric code of the Qorus server version, where @code{.py} major = (x / 10000),
          minor = (x / 100) % 100, = x % 100 @endcode this value is suitable for comparisons (ex: for Qorus 2.6.0,
          \c omq-version-code = 20600) <!-- % -->
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
    */
    @SuppressWarnings("unchecked")
    public static HashMap<String, Object> getSystemInfo() throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("UserApi", "getSystemInfo");
    }

    //! Gets a lookup value from the value map by a key; the value map must be registered to the current interface
    /** @param mapname name of the value map
        @param key a key name

        @return the value assigned to the key

        @throw VALUE-MAP-ERROR the given value map is unknown or not registered to the current interface
    */
    public static Object getValueMap(String mapname, String key) throws Throwable {
        return QoreJavaApi.callStaticMethod("UserApi", "getValueMap", mapname, key);
    }

    //! expands all variables in a templated string
    /** @param value templated string to be expanded; see @ref bb_template_strings for more information on this
        parameter
        @param local_context local context supplied by the caller (plus user context info is added - see
        @ref MapperApi::getUserContextInfo() method)

        @return the value of the string as substituted with all variables expanded recursively until there are no more
        expansions to perform (or the derived value is not a string)

        @throw LIST-VALUE-ERROR cannot parse list value expression
        @throw REST-EXPRESSION-ERROR cannot parse REST expression and argument
        @throw NOT-WF-CONTEXT-ERROR if WF specific context (e.g. static) variable is specified to be expanded
        @throw UNSUPPORTED-CONTEXT-ERROR if an unknown context variable is specified to be expanded
        @throw FORMAT-ERROR if the templated string doesn't have correct format (e.g. unescaped dollar sign that does
        not represent a variable)
        @throw SENSITIVE-DATA-FORMAT-ERROR if the \c "$sensitive:<skey>.<svalue>.field-ref..." value or
        \c "$sensitive-alias:<alias>.field-ref..." template string does not have the required format

        @see @ref bb_template_strings
    */
    public static Object expandTemplatedValue(Object value, Map<String, Object> local_context) throws Throwable {
        return QoreJavaApi.callStaticMethod("UserApi", "expandTemplatedValue", value, local_context);
    }

    //! expands all variables in a templated string
    /** @param value templated string to be expanded; see @ref bb_template_strings for more information on this
        parameter

        @return the value of the string as substituted with all variables expanded recursively until there are no more
        expansions to perform (or the derived value is not a string)

        @throw LIST-VALUE-ERROR cannot parse list value expression
        @throw REST-EXPRESSION-ERROR cannot parse REST expression and argument
        @throw NOT-WF-CONTEXT-ERROR if WF specific context (e.g. static) variable is specified to be expanded
        @throw UNSUPPORTED-CONTEXT-ERROR if an unknown context variable is specified to be expanded
        @throw FORMAT-ERROR if the templated string doesn't have correct format (e.g. unescaped dollar sign that does
        not represent a variable)
        @throw SENSITIVE-DATA-FORMAT-ERROR if the \c "$sensitive:<skey>.<svalue>.field-ref..." value or
        \c "$sensitive-alias:<alias>.field-ref..." template string does not have the required format

        @see @ref bb_template_strings
    */
    public static Object expandTemplatedValue(Object value) throws Throwable {
        return QoreJavaApi.callStaticMethod("UserApi", "expandTemplatedValue", value);
    }

    //! returns a hash of all system properties in all domains
    /** @par Example:
        @code{.py}
Map<String, Object> h = MapperApi::propGet();
        @endcode

        @return a hash of all system properties in all domains; the top-level keys are domain keys which have as values hashes with all key-value pairs set in the domain
    */
    @SuppressWarnings("unchecked")
    public static HashMap<String, Object> propGet() throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("UserApi", "propGet");
    }

    //! returns a hash of all key-value pairs in the given domain or @ref nothing if the system property domain does not exist
    /** @par Example:
        @code{.py}
Map<String, Object> h = MapperApi::propGet(domain);
        @endcode

        @return a hash of all key-value pairs in the given domain or @ref nothing if the system property domain does not exist
    */
    @SuppressWarnings("unchecked")
    public static HashMap<String, Object> propGet(String domain) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("UserApi", "propGet", domain);
    }

    //! returns the value of the given system property key in the given domain or @ref nothing if the system property does not exist
    /** @par Example:
        @code{.py}
auto val = MapperApi::propGet(domain, key);
        @endcode

        @return the value of the given system property key in the given domain
    */
    public static Object propGet(String domain, String key) throws Throwable {
        return QoreJavaApi.callStaticMethod("UserApi", "propGet", domain, key);
    }
}
