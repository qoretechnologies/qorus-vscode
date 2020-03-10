/** Qorus Java Workflow API
 *
 */

package com.qoretechnologies.qorus.workflow;

// java imports
import java.util.HashMap;
import java.time.ZonedDateTime;

// jni module imports
import org.qore.jni.QoreJavaApi;
import org.qore.jni.QoreRelativeTime;

// Qorus imports
import com.qoretechnologies.qorus.OMQ;
import com.qoretechnologies.qorus.UserApi;

//! The main Qorus Java workflow API class
public class WorkflowApi extends UserApi {
    //! returns a unique async key for the order for use with submitAsyncKey()
    /** the generated key uses the workflow_instanceid, stepid, and ind number for the step
        to generate a unique key.  Another alterative would be to call \c UUID.randomUUID().toString()

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::generateUniqueKey() "WorkflowApi::generateUniqueKey()"
        - @ref wf_generate_unique_key()
    */
    static public String generateUniqueKey() throws Throwable {
        return (String)QoreJavaApi.callStaticMethod("WorkflowApi", "generateUniqueKey");
    }

    //! Raises an error against the current step without affecting the flow of processing
    /** This method will affect the final status of the step, segment, and workflow, if the severity of the error
        is @ref OMQ.ES_Major or @ref OMQ.ES_Fatal.  If the error raised is not defined, severity @ref OMQ.ES_Major is
        assumed.

        @param err the string error code
        @param info additional information for the error; should normally be a string in order to be logged in the database; if not a string then it will
be converted to a string for saving in error history
        @param retry_delay_secs the amount of time in seconds to wait until a retry is made; overrides any value in the error definition

        @note workflow errors can also be raised by throwing an exception; this method does not affect the flow of execution in the step

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::stepError() "WorkflowApi::stepError()"
        - @ref wf_serror()
    */
    static public void stepError(String err, Object info, int retry_delay_secs) throws Throwable {
        QoreJavaApi.callStaticMethod("WorkflowApi", "stepError", err, info, retry_delay_secs);
    }

    //! Raises an error against the current step without affecting the flow of processing
    /** This method will affect the final status of the step, segment, and workflow, if the severity of the error
        is @ref OMQ.ES_Major or @ref OMQ.ES_Fatal.  If the error raised is not defined, severity @ref OMQ.ES_Major is
        assumed.

        @param err the string error code
        @param retry_delay_secs the amount of time in seconds to wait until a retry is made; overrides any value in the error definition

        @note workflow errors can also be raised by throwing an exception; this method does not affect the flow of execution in the step

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::stepError() "WorkflowApi::stepError()"
        - @ref wf_serror()
    */
    static public void stepError(String err, int retry_delay_secs) throws Throwable {
        QoreJavaApi.callStaticMethod("WorkflowApi", "stepError", err, null, retry_delay_secs);
    }

    //! Raises an error against the current step without affecting the flow of processing
    /** This method will affect the final status of the step, segment, and workflow, if the severity of the error
        is @ref OMQ.ES_Major or @ref OMQ.ES_Fatal.  If the error raised is not defined, severity @ref OMQ.ES_Major is
        assumed.

        @param err the string error code
        @param info additional information for the error; should normally be a string in order to be logged in the database; if not a string then it will
be converted to a string for saving in error history

        @note workflow errors can also be raised by throwing an exception; this method does not affect the flow of execution in the step

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::stepError() "WorkflowApi::stepError()"
        - @ref wf_serror()
    */
    static public void stepError(String err, Object info) throws Throwable {
        QoreJavaApi.callStaticMethod("WorkflowApi", "stepError", err, info);
    }

    //! Raises an error against the current step without affecting the flow of processing
    /** This method will affect the final status of the step, segment, and workflow, if the severity of the error
        is @ref OMQ.ES_Major or @ref OMQ.ES_Fatal.  If the error raised is not defined, severity @ref OMQ.ES_Major is
        assumed.

        @param err the string error code

        @note workflow errors can also be raised by throwing an exception; this method does not affect the flow of execution in the step

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::stepError() "WorkflowApi::stepError()"
        - @ref wf_serror()
    */
    static public void stepError(String err) throws Throwable {
        QoreJavaApi.callStaticMethod("WorkflowApi", "stepError", err);
    }

    //! Raises a warning against the step
    /** The information is logged, but does not affect the step’s status.

        @param err the string warning code
        @param info additional information for the warning; should normally be a string in order to be logged in the database; if not a string then it will be converted to a string for saving in error history

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::stepWarning() "WorkflowApi::stepWarning()"
        - @ref wf_swarning()
    */
    static public void stepWarning(String err, Object info) throws Throwable {
        QoreJavaApi.callStaticMethod("WorkflowApi", "stepWarning", err, info);
    }

    //! Raises a warning against the step
    /** The information is logged, but does not affect the step’s status.

        @param err the string warning code

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::stepWarning() "WorkflowApi::stepWarning()"
        - @ref wf_swarning()
    */
    static public void stepWarning(String err) throws Throwable {
        QoreJavaApi.callStaticMethod("WorkflowApi", "stepWarning", err);
    }

    //! Sets the value of the retry delay for an asynchronous step
    /** Only takes effect when called from an asynchronous step that will receive an
        @ref OMQ.StatAsyncWaiting (\c "A") status or when called from a normal step after an error has been raised
        that will cause the step to get a @ref OMQ::StatRetry (\c "R") status.  Note that if this method is called
        before an error is raised, the retry delay setting will be lost.

        Otherwise, to affect the retry of a normal step when an error has been raised that will give the step a
        status of @ref OMQ.StatRetry (\c "R"), you can also use the stepError() method with the optional third argument
        giving the retry delay instead of calling this method after the call to stepError().

        @param secs the amount of time in seconds to wait until a retry is made; overrides any value in the error
        definition

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::setRetryDelay() "WorkflowApi::setRetryDelay()"
        - @ref wf_set_retry_delay()
    */
    static public void setRetryDelay(int secs) throws Throwable {
        QoreJavaApi.callStaticMethod("WorkflowApi", "setRetryDelay", secs);
    }

    //! Updates the values of one or more keys in the workflow order data instance’s dynamic data hash
    /** Dynamic data is directly linked to the order data the workflow execution instance is processing.

        Changes are committed to the database before the method returns.
        @see @ref dynamicdata "Workflow Order Dynamic Data"
        @param hash the key-value pairs to update in dynamic data

        @note
        - this call does not replace the dynamic data hash; any keys in the hash parameter are added to the dynamic data hash
        - the use of this method causes SQL I/O to be performed in the system schema; to maximize performance, calls to this and other similar methods should be minimized if possible

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::updateDynamicData() "WorkflowApi::updateDynamicData()"
        - @ref wf_update_dynamic_data()
        - @ref DynamicDataHelper
    */
    static public void updateDynamicData(HashMap<String, Object> hash) throws Throwable {
        QoreJavaApi.callStaticMethod("WorkflowApi", "updateDynamicData", hash);
    }

    //! Deletes one or more keys from the workflow order data instance’s dynamic data hash
    /** Dynamic data is directly linked to the order data the workflow execution instance is processing.

        Changes are committed to the database before the method returns.

        @see @ref dynamicdata "Workflow Order Dynamic Data"

        @param keys a list of keys to delete in the workflow order's dynamic data

        @note the use of this method causes SQL I/O to be performed in the system schema; to maximize performance, calls to this and other similar methods should be minimized if possible

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::deleteDynamicDataKey() "WorkflowApi::deleteDynamicDataKey()"
        - @ref wf_delete_dynamic_data_key()
        - @ref DynamicDataHelper
    */
    static public void deleteDynamicDataKey(String... keys) throws Throwable {
        QoreJavaApi.callStaticMethodArgs("WorkflowApi", "deleteDynamicDataKey", keys);
    }

    //! Deletes one key from the workflow order data instance’s dynamic data hash
    /** Dynamic data is directly linked to the order data the workflow execution instance is processing.

        Changes are committed to the database before the method returns.

        @see @ref dynamicdata "Workflow Order Dynamic Data"

        @param key a single key to delete in the workflow order's dynamic data

        @note the use of this method causes SQL I/O to be performed in the system schema; to maximize performance, calls to this and other similar methods should be minimized if possible

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::deleteDynamicDataKey() "WorkflowApi::deleteDynamicDataKey()"
        - @ref wf_delete_dynamic_data_key()
        - @ref DynamicDataHelper
    */
    static public void deleteDynamicDataKey(String key) throws Throwable {
        QoreJavaApi.callStaticMethod("WorkflowApi", "deleteDynamicDataKey", key);
    }

    //! Retrieves the value of one keys from the workflow order data instance’s dynamic data hash
    /** Dynamic data is directly linked to the order data the workflow execution instance is processing.

        @see @ref dynamicdata "Workflow Order Dynamic Data"

        @param key the dynamic data key value to return

        @return the value of the dynamic data key given

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::getDynamicData() "WorkflowApi::getDynamicData()"
        - @ref wf_get_dynamic_data()
        - @ref DynamicDataHelper
    */
    static public Object getDynamicData(String key) throws Throwable {
        return QoreJavaApi.callStaticMethod("WorkflowApi", "getDynamicData", key);
    }

    //! Retrieves the values of one or more keys from the workflow order data instance’s dynamic data hash
    /** Dynamic data is directly linked to the order data the workflow execution instance is processing.

        @see @ref dynamicdata "Workflow Order Dynamic Data"

        @param keys the dynamic data key values to return

        @return if a single string argument is passed, the value of that key is returned, otherwise a hash is returned
        giving the values of all the keys requested

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::getDynamicData() "WorkflowApi::getDynamicData()"
        - @ref wf_get_dynamic_data()
        - @ref DynamicDataHelper
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getDynamicData(String... keys) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethodArgs("WorkflowApi", "getDynamicData", keys);
    }

    //! Retrieves the entire workflow order data instance’s dynamic data hash
    /** Dynamic data is directly linked to the order data the workflow execution instance is processing.

        @see @ref dynamicdata "Workflow Order Dynamic Data"

        @return the entire dynamic data hash for the order

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::getDynamicData() "WorkflowApi::getDynamicData()"
        - @ref wf_get_dynamic_data()
        - @ref DynamicDataHelper
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getDynamicData() throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("WorkflowApi", "getDynamicData");
    }

    //! Retrieves the value of one key from the workflow order data instance’s static data hash
    /** Workflow order static data is the primary workflow order data and corresponds to the deserialized contents of
        the database field \c ORDER_INSTANCE.STATICDATA for the current workflow order data instance.

        @param key the static data key value to return

        @return the value of the requested key is returned

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::getStaticData() "WorkflowApi::getStaticData()"
        - @ref wf_get_static_data()
        - @ref staticdata "Workflow Order Static Data"
    */
    static public Object getStaticData(String key) throws Throwable {
        return QoreJavaApi.callStaticMethod("WorkflowApi", "getStaticData", key);
    }

    //! Retrieves the values of multiple keys from the workflow order data instance’s static data hash
    /** Workflow order static data is the primary workflow order data and corresponds to the deserialized contents of
        the database field \c ORDER_INSTANCE.STATICDATA for the current workflow order data instance.

        @param keys the static data key values to return

        @return a hash is returned giving the values of all the keys requested

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::getStaticData() "WorkflowApi::getStaticData()"
        - @ref wf_get_static_data()
        - @ref staticdata "Workflow Order Static Data"
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getStaticData(String... keys) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethodArgs("WorkflowApi", "getStaticData", keys);
    }

    //! Retrieves the entire workflow order data instance’s static data hash
    /** Workflow order static data is the primary workflow order data and corresponds to the deserialized contents of
        the database field \c ORDER_INSTANCE.STATICDATA for the current workflow order data instance.

        @return the entire static data hash for the order

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::getStaticData() "WorkflowApi::getStaticData()"
        - @ref wf_get_static_data()
        - @ref staticdata "Workflow Order Static Data"
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getStaticData() throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("WorkflowApi", "getStaticData");
    }

    //! Updates the values of one or more keys in the workflow order data instance’s temporary data hash
    /** @param hash the key-value pairs to update in workflow temporary data
        @see @ref tempdata "Workflow Temporary Data"

        @note
        - this call does not replace the @ref tempdata "temporary data hash"; any keys in the hash parameter are added to the @ref tempdata "temporary data hash"

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::updateTempData() "WorkflowApi::updateTempData()"
        - @ref wf_update_temp_data()
        - @ref TempDataHelper
    */
    static public void updateTempData(HashMap<String, Object> hash) throws Throwable {
        QoreJavaApi.callStaticMethod("WorkflowApi", "updateTempData", hash);
    }

    //! Retrieves the value of one key from the workflow order data instance’s temporary data hash
    /** @see @ref tempdata "Workflow Temporary Data"

        @return the value of the requested key is returned

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::getTempData() "WorkflowApi::getTempData()"
        - @ref wf_get_temp_data()
        - @ref TempDataHelper
    */
    static public Object getTempData(String key) throws Throwable {
        return QoreJavaApi.callStaticMethod("WorkflowApi", "getTempData", key);
    }

    //! Retrieves the values multiple keys from the workflow order data instance’s temporary data hash
    /** @see @ref tempdata "Workflow Temporary Data"

        @param keys the keys in the worklfow order data instance's temporary data hash

        @return a hash is returned giving the values of all the keys requested

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::getTempData() "WorkflowApi::getTempData()"
        - @ref wf_get_temp_data()
        - @ref TempDataHelper
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getTempData(String... keys) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethodArgs("WorkflowApi", "getTempData", keys);
    }

    //! Retrieves the entire workflow order data instance’s temporary data hash
    /** @see @ref tempdata "Workflow Temporary Data"

        @return the entire workflow order data instance’s temporary data hash

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::getTempData() "WorkflowApi::getTempData()"
        - @ref wf_get_temp_data()
        - @ref TempDataHelper
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getTempData() throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("WorkflowApi", "getTempData");
    }

    //! Deletes one or more keys from the workflow order data instance’s temporary data hash
    /** @param keys a list of strings (keys) to delete in workflow temporary data

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::deleteTempDataKey() "WorkflowApi::deleteTempDataKey()"
        - @ref wf_delete_temp_data_key()
        - @ref tempdata "Workflow Temporary Data"
        - @ref TempDataHelper
    */
    static public void deleteTempDataKey(String... keys) throws Throwable {
        QoreJavaApi.callStaticMethodArgs("WorkflowApi", "deleteTempDataKey", keys);
    }

    //! Updates or creates the values of one or more keys in the workflow order's sensitive data hash for the given sensitive data key and value
    /** @par Example:
        @code{.java}
WorkflowApi.updateSensitiveData("personal_id", h.get("personal_id"), h, aliases, meta);
        @endcode

        @param skey the type of value provided in \a svalue; must not be longer than 100 bytes long or a \c SENSITIVE-DATA-ERROR exception is raised
        @param svalue the value of the sensitive data key identified by \a skey; if this string is empty or longer than 100 bytes, a \c SENSITIVE-DATA-ERR
OR exception is raised
        @param hash the data to create or update against \a skey; existing keys will be replaced; new keys will be added; if the new hash does not refer to existing keys, then those existing keys remain untouched
        @param aliases other values for the sensitive data
        @param meta optional sensitve data metadata with the following recommended keys:
        - \c PURPOSE: free-form information about the purpose of the sensitive data
        - \c CATEGORIES: free-form information about the categories of sensitive data
        - \c RECIPIENTS: free-form information about the recipients or recipient catories of sensitive data
        - \c STORAGE: free-form information about the storage time or rules for sensitive data

        @throw SENSITIVE-DATA-ERROR no sensitive key value was provided; sensitive key value too long (100 bytes maximum length in the encoding used by the system schema)

        @note
        - do not use sensitive data for the sensitive key names itself (\a skey); key names are logged to provide an audit trail of changes to sensitive data
        - metadata keys listed above for the \a meta argument are recommended for consistency's sake but are not checked; a hash with any keys can be stored with this API

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::updateSensitiveData() "WorkflowApi::updateSensitiveData()"
        - @ref wf_update_sensitive_data()
        - @ref sensitive_data
        - @ref SensitiveDataHelper
    */
    static public void updateSensitiveData(String skey, String svalue, HashMap<String, Object> hash, String[] aliases, HashMap<String, Object> meta) throws Throwable {
        QoreJavaApi.callStaticMethod("WorkflowApi", "updateSensitiveData", skey, svalue, hash, aliases, meta);
    }

    //! Updates or creates the values of one or more keys in the workflow order's sensitive data hash for the given sensitive data key and value
    /** @par Example:
        @code{.java}
WorkflowApi.updateSensitiveData("personal_id", h.get("personal_id"), h, aliases, meta);
        @endcode

        @param skey the type of value provided in \a svalue; must not be longer than 100 bytes long or a \c SENSITIVE-DATA-ERROR exception is raised
        @param svalue the value of the sensitive data key identified by \a skey; if this string is empty or longer than 100 bytes, a \c SENSITIVE-DATA-ERR
OR exception is raised
        @param hash the data to create or update against \a skey; existing keys will be replaced; new keys will be added; if the new hash does not refer to existing keys, then those existing keys remain untouched
        @param aliases other values for the sensitive data

        @throw SENSITIVE-DATA-ERROR no sensitive key value was provided; sensitive key value too long (100 bytes maximum length in the encoding used by the system schema)

        @note
        - do not use sensitive data for the sensitive key names itself (\a skey); key names are logged to provide an audit trail of changes to sensitive data
        - metadata keys listed above for the \a meta argument are recommended for consistency's sake but are not checked; a hash with any keys can be stored with this API

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::updateSensitiveData() "WorkflowApi::updateSensitiveData()"
        - @ref wf_update_sensitive_data()
        - @ref sensitive_data
        - @ref SensitiveDataHelper
    */
    static public void updateSensitiveData(String skey, String svalue, HashMap<String, Object> hash, String[] aliases) throws Throwable {
        QoreJavaApi.callStaticMethod("WorkflowApi", "updateSensitiveData", skey, svalue, hash, aliases);
    }

    //! Updates or creates the values of one or more keys in the workflow order's sensitive data hash for the given sensitive data key and value
    /** @par Example:
        @code{.java}
WorkflowApi.updateSensitiveData("personal_id", h.get("personal_id"), h, aliases, meta);
        @endcode

        @param skey the type of value provided in \a svalue; must not be longer than 100 bytes long or a \c SENSITIVE-DATA-ERROR exception is raised
        @param svalue the value of the sensitive data key identified by \a skey; if this string is empty or longer than 100 bytes, a \c SENSITIVE-DATA-ERR
OR exception is raised
        @param hash the data to create or update against \a skey; existing keys will be replaced; new keys will be added; if the new hash does not refer to existing keys, then those existing keys remain untouched

        @throw SENSITIVE-DATA-ERROR no sensitive key value was provided; sensitive key value too long (100 bytes maximum length in the encoding used by the system schema)

        @note
        - do not use sensitive data for the sensitive key names itself (\a skey); key names are logged to provide an audit trail of changes to sensitive data
        - metadata keys listed above for the \a meta argument are recommended for consistency's sake but are not checked; a hash with any keys can be stored with this API

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::updateSensitiveData() "WorkflowApi::updateSensitiveData()"
        - @ref wf_update_sensitive_data()
        - @ref sensitive_data
        - @ref SensitiveDataHelper
    */
    static public void updateSensitiveData(String skey, String svalue, HashMap<String, Object> hash) throws Throwable {
        QoreJavaApi.callStaticMethod("WorkflowApi", "updateSensitiveData", skey, svalue, hash);
    }

    //! Updates or creates the values of one or more keys in the workflow order's sensitive data hash for the given sensitive data alias
    /** @par Example:
        @code{.java}
WorkflowApi.updateSensitiveDataFromAlias("0", h);
        @endcode

        @param alias the alias to use for updating the data; if the alias is unknown, an \c INVALID-ALIAS exception is raised
        @param hash the data to create or update against \a skey; existing keys will be replaced; new keys will be added; if the new hash does not refer to existing keys, then those existing keys remain untouched
        @param meta optional sensitve data metadata with the following recommended keys:
        - \c PURPOSE: free-form information about the purpose of the sensitive data
        - \c CATEGORIES: free-form information about the categories of sensitive data
        - \c RECIPIENTS: free-form information about the recipients or recipient catories of sensitive data
        - \c STORAGE: free-form information about the storage time or rules for sensitive data

        @throw INVALID-ALIAS the alias given is unknown

        @note
        - metadata keys listed above for the \a meta argument are recommended for consistency's sake but are not checked; a hash with any keys can be stored with this API

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::updateSensitiveDataFromAlias() "WorkflowApi::updateSensitiveDataFromAlias()"
        - @ref wf_update_sensitive_data_from_alias()
        - @ref sensitive_data
        - @ref SensitiveDataHelper
    */
    static public void updateSensitiveDataFromAlias(String alias, HashMap<String, Object> hash, HashMap<String, Object> meta) throws Throwable {
        QoreJavaApi.callStaticMethod("WorkflowApi", "updateSensitiveDataFromAlias", alias, hash, meta);
    }

    //! Updates or creates the values of one or more keys in the workflow order's sensitive data hash for the given sensitive data alias
    /** @par Example:
        @code{.java}
WorkflowApi.updateSensitiveDataFromAlias("0", h);
        @endcode

        @param alias the alias to use for updating the data; if the alias is unknown, an \c INVALID-ALIAS exception is raised
        @param hash the data to create or update against \a skey; existing keys will be replaced; new keys will be added; if the new hash does not refer to existing keys, then those existing keys remain untouched

        @throw INVALID-ALIAS the alias given is unknown

        @note
        - metadata keys listed above for the \a meta argument are recommended for consistency's sake but are not checked; a hash with any keys can be stored with this API

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::updateSensitiveDataFromAlias() "WorkflowApi::updateSensitiveDataFromAlias()"
        - @ref wf_update_sensitive_data_from_alias()
        - @ref sensitive_data
        - @ref SensitiveDataHelper
    */
    static public void updateSensitiveDataFromAlias(String alias, HashMap<String, Object> hash) throws Throwable {
        QoreJavaApi.callStaticMethod("WorkflowApi", "updateSensitiveDataFromAlias", alias, hash);
    }

    //! Returns the sensitive metadata hash for the given sensitive data key and value if present, otherwise returns an empty hash
    /** @par Example:
        @code{.java}
HashMap<String, Object> metadata = WorkflowApi.getSensitiveMetadata("personal_id", personal_id);
        @endcode

        @param skey the type of sensitive key provided in \a svalue
        @param svalue the value of the sensitive data key identified by \a skey

        @return the sensitive metadata hash stored according to the sensitive data key and value; if no such sensitive
        key and value exist for the order, or no metadata is present for the given sensitive key and value, then an
        empty hash is returned

        @note returns sensitive data; take care not to log any of the data returned by this method

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::getSensitiveMetadata() "WorkflowApi::getSensitiveMetadata()"
        - @ref wf_get_sensitive_metadata()
        - @ref getSensitiveMetadataFromAlias()
        - @ref sensitive_data
        - @ref SensitiveDataHelper
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getSensitiveMetadata(String skey, String svalue) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("WorkflowApi", "getSensitiveMetadata", skey, svalue);
    }

    //! returns a hash with the corresponding sensitive data key and sensitive data value as well as the value of the sensitive metadata hash for the given sensitive data alias corresponding to a sensitive data key and value
    /** @par Example:
        @code{.java}
// get sensitive metadata
HashMap<String, Object> metadata = WorkflowApi.getSensitiveMetadataFromAlias("0").get("value");
        @endcode

        @param alias the alias to lookup; if the alias is unknown, an \c INVALID-ALIAS exception is raised

        @return a hash of information corresponding to the arguments; the hash returned has the following keys:
        - \c skey: (@ref string_type "string") the sensitive data key type
        - \c svalue: (@ref string_type "string") the sensitive data value (considered sensitive itself)
        - \c value: (@ref hash_type "hash") the value of the sensitive metadata hash, if any

        @throw INVALID-ALIAS the given alias is unknown

        @note returns sensitive data; take care not to log any of the sensitive data returned by this method

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::getSensitiveMetadataFromAlias() "WorkflowApi::getSensitiveMetadataFromAlias()"
        - @ref wf_get_sensitive_metadata_from_alias()
        - @ref getSensitiveMetadata()
        - @ref sensitive_data
        - @ref SensitiveDataHelper
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getSensitiveMetadataFromAlias(String alias) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("WorkflowApi", "getSensitiveMetadataFromAlias", alias);
    }

    //! Returns the sensitive data hash for the given sensitive data key and value
    /** @par Example:
        @code{.java}
HashMap<String, Object> hm = WorkflowApi.getSensitiveData("personal_id", personal_id).get("tax_number", "address");
        @endcode

        @param skey the type of sensitive key provided in \a svalue
        @param svalue the value of the sensitive data key identified by \a skey
        @param keys sensitive data keys for the given key and value

        @return the sensitive data hash stored according to the sensitive data key and value; if no such sensitive key and value exist for the order, then @ref nothing is returned

        @note returns sensitive data; take care not to log any of the data returned by this method

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::getSensitiveData() "WorkflowApi::getSensitiveData()"
        - @ref wf_get_sensitive_data()
        - @ref getSensitiveDataFromAlias()
        - @ref sensitive_data
        - @ref SensitiveDataHelper
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getSensitiveData(String skey, String svalue, String... keys) throws Throwable {
        String[] args = new String[keys.length + 2];
        args[0] = skey;
        args[1] = svalue;
        for (int i = 0; i < keys.length; ++i) {
            args[i+2] = keys[i];
        }
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethodArgs("WorkflowApi", "getSensitiveData", args);
    }

    //! Returns the sensitive data hash for the given sensitive data key and value
    /** @par Example:
        @code{.java}
String tax_number = WorkflowApi.getSensitiveData("personal_id", personal_id).get("tax_number");
        @endcode

        @param skey the type of sensitive key provided in \a svalue
        @param svalue the value of the sensitive data key identified by \a skey
        @param key a sensitive data key for the given key and value

        @return the sensitive data value for the given key

        @note returns sensitive data; take care not to log any of the data returned by this method

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::getSensitiveData() "WorkflowApi::getSensitiveData()"
        - @ref wf_get_sensitive_data()
        - @ref getSensitiveDataFromAlias()
        - @ref sensitive_data
        - @ref SensitiveDataHelper
    */
    static public Object getSensitiveData(String skey, String svalue, String key) throws Throwable {
        String[] args = new String[3];
        args[0] = skey;
        args[1] = svalue;
        args[2] = key;
        return QoreJavaApi.callStaticMethodArgs("WorkflowApi", "getSensitiveData", args);
    }

    //! Returns the sensitive data hash for the given sensitive data key and value
    /** @par Example:
        @code{.java}
String tax_number = WorkflowApi.getSensitiveData("personal_id", personal_id).get("tax_number");
        @endcode

        @param skey the type of sensitive key provided in \a svalue
        @param svalue the value of the sensitive data key identified by \a skey

        @return the sensitive data hash stored according to the sensitive data key and value; if no such sensitive
        key and value exist for the order, then @ref nothing is returned

        @note returns sensitive data; take care not to log any of the data returned by this method

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::getSensitiveData() "WorkflowApi::getSensitiveData()"
        - @ref wf_get_sensitive_data()
        - @ref getSensitiveDataFromAlias()
        - @ref sensitive_data
        - @ref SensitiveDataHelper
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getSensitiveData(String skey, String svalue) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("WorkflowApi", "getSensitiveData", skey, svalue);
    }

    //! returns a hash with the corresponding sensitive data key and sensitive data value as well as the value of one or more keys in the @ref sensitive_data "workflow sensitive data" hash for the given sensitive data alias corresponding to a sensitive data key and value
    /** @par Example:
        @code{.java}
// get the tax number for the person
String tax_number = WorkflowApi.getSensitiveDataFromAlias("0", "tax_number").get("value");
        @endcode

        @param alias the alias to lookup; if the alias is unknown, an \c INVALID-ALIAS exception is raised
        @param keys String key fields to return

        @return a hash of information corresponding to the arguments; the hash returned has the following keys:
        - \c skey: (@ref string_type "string") the sensitive data key type
        - \c svalue: (@ref string_type "string") the sensitive data value
        - \c value: a hash givin the values of the requested keys

        @throw INVALID-ALIAS the given alias is unknown

        @note returns sensitive data; take care not to log any of the data returned by this method

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::getSensitiveDataFromAlias() "WorkflowApi::getSensitiveDataFromAlias()"
        - @ref wf_get_sensitive_data_from_alias()
        - @ref getSensitiveData()
        - @ref sensitive_data
        - @ref SensitiveDataHelper
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getSensitiveDataFromAlias(String alias, String... keys) throws Throwable {
        String[] args = new String[keys.length + 1];
        args[0] = alias;
        for (int i = 0; i < keys.length; ++i) {
            args[i+1] = keys[i];
        }
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethodArgs("WorkflowApi", "getSensitiveDataFromAlias", args);
    }

    //! returns a hash with the corresponding sensitive data key and sensitive data value as well as the value of one or more keys in the @ref sensitive_data "workflow sensitive data" hash for the given sensitive data alias corresponding to a sensitive data key and value
    /** @par Example:
        @code{.java}
// get the tax number for the person
String tax_number = WorkflowApi.getSensitiveDataFromAlias("0", "tax_number").get("value");
        @endcode

        @param alias the alias to lookup; if the alias is unknown, an \c INVALID-ALIAS exception is raised
        @param key the key field to return

        @return a hash of information corresponding to the arguments; the hash returned has the following keys:
        - \c skey: (@ref string_type "string") the sensitive data key type
        - \c svalue: (@ref string_type "string") the sensitive data value
        - \c value: the value of the requested key

        @throw INVALID-ALIAS the given alias is unknown

        @note returns sensitive data; take care not to log any of the data returned by this method

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::getSensitiveDataFromAlias() "WorkflowApi::getSensitiveDataFromAlias()"
        - @ref wf_get_sensitive_data_from_alias()
        - @ref getSensitiveData()
        - @ref sensitive_data
        - @ref SensitiveDataHelper
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getSensitiveDataFromAlias(String alias, String key) throws Throwable {
        String[] args = new String[2];
        args[0] = alias;
        args[1] = key;
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethodArgs("WorkflowApi", "getSensitiveDataFromAlias", args);
    }

    //! returns a hash with the corresponding sensitive data key and sensitive data value as well as the value of one or more keys in the @ref sensitive_data "workflow sensitive data" hash for the given sensitive data alias corresponding to a sensitive data key and value
    /** @par Example:
        @code{.java}
// get the tax number for the person
String tax_number = WorkflowApi.getSensitiveDataFromAlias("0").get("value").get("tax_number");
        @endcode

        @param alias the alias to lookup; if the alias is unknown, an \c INVALID-ALIAS exception is raised

        @return a hash of information corresponding to the arguments; the hash returned has the following keys:
        - \c skey: (@ref string_type "string") the sensitive data key type
        - \c svalue: (@ref string_type "string") the sensitive data value
        - \c value: the value of the entire hash

        @throw INVALID-ALIAS the given alias is unknown

        @note returns sensitive data; take care not to log any of the data returned by this method

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::getSensitiveDataFromAlias() "WorkflowApi::getSensitiveDataFromAlias()"
        - @ref wf_get_sensitive_data_from_alias()
        - @ref getSensitiveData()
        - @ref sensitive_data
        - @ref SensitiveDataHelper
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getSensitiveDataFromAlias(String alias) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("WorkflowApi", "getSensitiveDataFromAlias", alias);
    }

    //! returns a hash of all sensitive data aliases for the current order or an empty hash if there are none
    /** @par Example:
        @code{.java}
HashMap<String, Object> ah = WorkflowApi.getSensitiveDataAliases();
        @endcode

        @return a hash of all sensitive data aliases for the current order or an empty hash if there are none, otherwise keys are alias names and values are hashes with the following keys:
        - \c skey: (@ref string_type "string") the sensitive data key type
        - \c svalue: (@ref string_type "string") the sensitive data value (considered sensitive itself)

        @note returns sensitive data; sensitive data values (\a svalue) should not be logged

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::getSensitiveDataAliases() "WorkflowApi::getSensitiveDataAliases()"
        - @ref wf_get_sensitive_data_aliases()
        - @ref sensitive_data
        - @ref SensitiveDataHelper
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getSensitiveDataAliases() throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("WorkflowApi", "getSensitiveDataAliases");
    }

    //! Deletes the sensitive data hash for the given sensitive data key and value; changes have already been committed to the database when this method returns
    /** @par Example:
        @code{.java}
WorkflowApi.deleteSensitiveData("personal_id", personal_id);
        @endcode

        @param skey the type of sensitive key provided in \a svalue
        @param svalue the value of the sensitive data key identified by \a skey

        @return true if the data existed and was deleted, false if no such sensitive data key and value were present in the order

        @note the use of this method causes SQL I/O to be performed in the system schema; to maximize performance, calls to this and other similar methods should be minimized if possible

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::deleteSensitiveData() "WorkflowApi::deleteSensitiveData()"
        - @ref wf_delete_sensitive_data()
        - @ref sensitive_data
        - @ref SensitiveDataHelper
    */
    static public boolean deleteSensitiveData(String skey, String svalue) throws Throwable {
        return (boolean)QoreJavaApi.callStaticMethod("WorkflowApi", "deleteSensitiveData", skey, svalue);
    }

    //! Deletes one or more keys from the workflow order data instance’s sensitive data hash for the given sensitive data key and value; changes have already been committed to the database when this method returns
    /** @par Example:
        @code{.java}
// delete the "tax_number" and "insurance_number" keys from the sensitive data hash for the given person
WorkflowApi.deleteSensitiveDataKey("personal_id", personal_id, "tax_number", "insurance_number");
        @endcode

        Changes are committed to the database before the method returns.

        @param skey the type of sensitive key provided in \a svalue
        @param svalue the value of the sensitive data key identified by \a skey
        @param keys a single key or a list of keys to delete in the workflow order's sensitive data hash for the given sensitive key-value pair

        @return true if the data existed and was deleted, false if no data was deleted

        @note the use of this method causes SQL I/O to be performed in the system schema; to maximize performance, calls to this and other similar methods should be minimized if possible

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::deleteSensitiveDataKey() "WorkflowApi::deleteSensitiveDataKey()"
        - @ref wf_delete_sensitive_data_key()
        - @ref sensitive_data
        - @ref SensitiveDataHelper
    */
    static public boolean deleteSensitiveDataKey(String skey, String svalue, String... keys) throws Throwable {
        String[] args = new String[keys.length + 2];
        args[0] = skey;
        args[1] = svalue;
        for (int i = 0; i < keys.length; ++i) {
            args[i + 2] = keys[i];
        }
        return (boolean)QoreJavaApi.callStaticMethodArgs("WorkflowApi", "deleteSensitiveDataKey", args);
    }

    //! Returns a hash of sensitive data keys and values saved against the order; the sensitive data hashes themselves are not returned, just the information used to index sensitive data against the order
    /** @par Example:
        @code{.java}
        HashMap<String, Object> h = WorkflowApi.getSensitiveDataKeyValues();
        @endcode

        @return a hash of sensitive data keys and values saved against the order; the sensitive data hashes themselves are not returned, just the informat
    ion used to index sensitive data against the order; if no sensitive data is stored against the order, an empty hash is returned

        @note returns sensitive data; sensitive data values should not be logged

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::getSensitiveDataKeyValues() "WorkflowApi::getSensitiveDataKeyValues()"
        - @ref wf_get_sensitive_data_key_values()
        - @ref sensitive_data
        - @ref SensitiveDataHelper
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getSensitiveDataKeyValues() throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("WorkflowApi", "getSensitiveDataKeyValues");
    }

    //! Deletes a single key or a list of keys from the workflow execution instance’s instance data hash
    /** @param keys a single key or a list of strings (keys) to delete in workflow execution instance data

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::deleteInstanceDataKey() "WorkflowApi::deleteInstanceDataKey()"
        - @ref wf_delete_instance_data_key()
        - @ref instancedata "Workflow Execution Instance Data"
    */
    static public void deleteInstanceDataKey(String... keys) throws Throwable {
        QoreJavaApi.callStaticMethodArgs("WorkflowApi", "deleteInstanceDataKey", keys);
    }

    //! Updates the values of one or more keys in the workflow execution instance’s instance data hash
    /** @param hash the key-value pairs to update in workflow execution instance data

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::updateInstanceData() "WorkflowApi::updateInstanceData()"
        - @ref wf_update_instance_data()
        - @ref instancedata "Workflow Execution Instance Data"
    */
    static public void updateInstanceData(HashMap<String, Object> hash) throws Throwable {
        QoreJavaApi.callStaticMethod("WorkflowApi", "updateInstanceData", hash);
    }

    //! Retrieves the workflow execution instance’s instance data hash
    /** This data is set by the user (by calling updateInstanceData()) and is not associated to the order data being processed, but rather directly with the workflow execution instance.  In this sense, this data is similar to global variables in a program.

        @return a hash of @ref instancedata "workflow execution instance data"

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::getInstanceData() "WorkflowApi::getInstanceData()"
        - @ref instancedata "Workflow Execution Instance Data"

        @note not to be confused with wf_get_workflow_instance_data(), which returns system properties of the workflow execution instance
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getInstanceData() throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("WorkflowApi", "getInstanceData");
    }

    //! Retrieves the value of the given key in the workflow execution instance’s instance data hash
    /** This data is set by the user (by calling updateInstanceData()) and is not associated to the order data being processed, but rather directly with the workflow execution instance.  In this sense, this data is similar to global variables in a program.

        @param key the key value to retrieve

        @return a single value in the @ref instancedata "workflow execution instance data hash"

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::getInstanceData() "WorkflowApi::getInstanceData()"
        - @ref instancedata "Workflow Execution Instance Data"

        @note not to be confused with getWorkflowInstanceData(), which returns system properties of the workflow execution instance
    */
    static public Object getInstanceData(String key) throws Throwable {
        return QoreJavaApi.callStaticMethod("WorkflowApi", "getInstanceData", key);
    }

    //! Retrieves the values of multiple keys from the workflow execution instance’s instance data hash
    /** This data is set by the user (by calling updateInstanceData()) and is not associated to the order data being processed, but rather directly with the workflow execution instance.  In this sense, this data is similar to global variables in a program.

        @return a hash of @ref instancedata "workflow execution instance data" corresponding to the arguments

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::getInstanceData() "WorkflowApi::getInstanceData()"
        - @ref instancedata "Workflow Execution Instance Data"

        @note not to be confused with wf_get_workflow_instance_data(), which returns system properties of the workflow execution instance
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getInstanceData(String... args) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethodArgs("WorkflowApi", "getInstanceData", args);
    }

    //! This method returns true if the step passed has been executed and has status @ref OMQ.StatComplete (\c "C")
    /** If the step name does not exist then an exception is thrown

        @return True if the step passed has been executed and has status @ref OMQ.StatComplete (\c "C")

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::stepExecuted() "WorkflowApi::stepExecuted()"
        - @ref wf_step_executed()
    */
    static public boolean stepExecuted(String stepname) throws Throwable {
        return (boolean)QoreJavaApi.callStaticMethod("WorkflowApi", "stepExecuted", stepname);
    }

    //! Returns the current status of the given step for the current workflow order instance
    /** If the step name does not exist then an exception is thrown

        @return the current status of the given step for the current workflow order instance

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::getStepStatus() "WorkflowApi::getStepStatus()"
        - @ref wf_get_step_status()
    */
    static public String getStepStatus(String stepname) throws Throwable {
        return (String)QoreJavaApi.callStaticMethod("WorkflowApi", "getStepStatus", stepname);
    }

    //! This method will return a hash of step information for the current step
    /**
        @return if not called from a step; returns @ref nothing, otherwise returns a hash with the following members:
        - \c stepid: the ID of the step
        - \c name: the name of the step
        - [\c patch]: the patch string for the step
        - [\c desc]: the description of the step
        - \c version: the version of the step
        - \c steptype: @ref OMQ::ExecNormal, @ref OMQ::ExecSubWorkflow, or @ref OMQ::ExecAsync
        - \c arraytype: either @ref OMQ::ArraySeries or @ref OMQ::ArrayNone for non-array steps
        - \c index: the element number for @ref arraysteps "array steps" (always 0 for non-array steps)
        - [\c array_size]: the number of elements in the array for @ref arraysteps "array steps"
        - [\c stepstatus]: the previous step status when called from a workflow execution instance run in
          @ref OMQ::WM_Recovery mode
        - [\c retries]: the current retry number when called from a workflow execution instance run in
          @ref OMQ::WM_Recovery mode
        - [\c step_classid]: the class ID of the step's class for @ref classstepdefs "class-based steps"; either this
          value or \c stepfunction_instanceid will be returned
        - [\c stepfunction_instanceid]: the function instance ID of the primary step function for
          @ref funcstepdefs "function-based steps"
        - [\c sfname]: the name of the primary step function for @ref funcstepdefs "function-based steps"
        - [\c validationfunction_instanceid]: the function instance ID of the validation function for
          @ref funcstepdefs "function-based steps"
        - [\c vfname]: the name of the validation function (corresponds to \c validationfunction_instanceid) for
          @ref funcstepdefs "function-based steps"
        - [\c endfunction_instanceid]: the function instance ID of the asynchronous end function for asynchronous
          steps for @ref funcstepdefs "function-based" @ref asyncsteps "asynchronous steps"
        - [\c efname]: the name of the end function (corresponds to \c endfunction_instanceid) for
          @ref funcstepdefs "function-based" @ref asyncsteps "asynchronous steps"
        - [\c arrayfunction_instanceid]: the function instance ID of the array function for
          @ref funcstepdefs "function-based" @ref arraysteps "array steps"
        - [\c afname]: the name of the array function (corresponds to \c arrayfunction_instanceid) for
          @ref funcstepdefs "function-based" @ref arraysteps "array steps"
        - [\c queueid]: the ID of the asynchronous queue for asynchronous steps for @ref funcstepdefs "function-based"
          @ref asyncsteps "asynchronous steps"
        - [\c queuename]: the name of the asynchronous queue (corresponds to \c queueid) for
          @ref funcstepdefs "function-based" @ref asyncsteps "asynchronous steps"
        - [\c workflow_event_typeid]: the event type ID for workflow synchronization event steps for
          @ref eventsteps "workflow synchronization event steps"
        - [\c eventtype]: the name of the event type (corresponds to \c workflow_event_typeid) for
          @ref eventsteps "workflow synchronization event steps"

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::getStepInfo() "WorkflowApi::getStepInfo()"
        - @ref wf_get_step_info()
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getStepInfo() throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("WorkflowApi", "getStepInfo");
    }

    //! Retrieves all available values from the workflow execution instance object itself
    /** @return a hash of key-value pairs giving the value of the given keys in the current workflow execution instance

        @throw GET-WORKFLOW-INSTANCE-DATA-ERROR invalid arguments to method

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::getWorkflowInstanceData() "WorkflowApi::getWorkflowInstanceData()"
        - @ref wf_get_workflow_instance_data()
        - @ref parentWfiid()
        - @ref getWfiid()

        @note not to be confused with wf_get_instance_data()
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getWorkflowInstanceData() throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("WorkflowApi", "getWorkflowInstanceData");
    }

    //! Retrieves the value of a single key (system-defined property) from the workflow execution instance object itself
    /** @param key the workflow execution instance key; see @ref workflowexecutioninstanceinfo "Running Workflow Execution Instance Properties" for valid keys

        @return the value of the key in the current workflow execution instance

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::getWorkflowInstanceData() "WorkflowApi::getWorkflowInstanceData()"
        - @ref wf_get_workflow_instance_data()
        - @ref parentWfiid()
        - @ref getWfiid()

        @note not to be confused with wf_get_instance_data()
    */
    static public Object getWorkflowInstanceData(String key) throws Throwable {
        return QoreJavaApi.callStaticMethod("WorkflowApi", "getWorkflowInstanceData", key);
    }

    //! Retrieves the values of one or more keys (system-defined properties) from the workflow execution instance object itself
    /** Pass a single string argument, in which case on the value of that key is returned, or a list of strings, in which case a hash is returned giving the values of all the keys requested; see @ref workflowexecutioninstanceinfo "Running Workflow Execution Instance Properties" for valid keys; if no arguments are passed, then a hash of all possible keys is returned

        @return a hash of key-value pairs giving the value of the given keys in the current workflow execution instance

        @throw GET-WORKFLOW-INSTANCE-DATA-ERROR invalid arguments to method

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::getWorkflowInstanceData() "WorkflowApi::getWorkflowInstanceData()"
        - @ref wf_get_workflow_instance_data()
        - @ref parentWfiid()
        - @ref getWfiid()

        @note not to be confused with getInstanceData()
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getWorkflowInstanceData(String... args) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethodArgs("WorkflowApi", "getWorkflowInstanceData", args);
    }

    //! This method sets user-defined order keys against an order, so that the workflow order data instance can be quickly searched and retrieved using the key value
    /** The hash provided replaces orders keys on the workflow order; existing order keys matching keys given in the
        hash provided as an argument to this method are replaced and any new keys in the hash are added.

        The data is committed to the database before the method returns.

        @param h key-value pairs to set for order keys; the keys in this hash must match those defined for the
        workflow
        @param truncate allow key values to be truncated without an error

        @throw SET-ORDER-KEYS-ERROR empty hash passed to wf_set_order_keys()
        @throw INVALID-WORKFLOW-KEY invalid key for workflow
        @throw DUPLICATE-KEY-VALUE an order key was assigned a value more than once

        @note the use of this method causes SQL I/O to be performed in the system schema; to maximize performance,
        calls to this and other similar methods should be minimized if possible

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::setOrderKeys() "WorkflowApi::setOrderKeys()"
        - @ref wf_set_order_keys()
        - setOrderKeys()
        - appendOrderKeys()
    */
    static public void setOrderKeys(HashMap<String, Object> h, boolean truncate) throws Throwable {
        QoreJavaApi.callStaticMethod("WorkflowApi", "setOrderKeys", h, truncate);
    }

    //! This method sets user-defined order keys against an order, so that the workflow order data instance can be quickly searched and retrieved using the key value
    /** The hash provided replaces orders keys on the workflow order; existing order keys matching keys given in the
        hash provided as an argument to this method are replaced and any new keys in the hash are added.

        The data is committed to the database before the method returns.

        @param h key-value pairs to set for order keys; the keys in this hash must match those defined for the
        workflow

        @throw SET-ORDER-KEYS-ERROR empty hash passed to wf_set_order_keys()
        @throw INVALID-WORKFLOW-KEY invalid key for workflow
        @throw DUPLICATE-KEY-VALUE an order key was assigned a value more than once

        @note the use of this method causes SQL I/O to be performed in the system schema; to maximize performance,
        calls to this and other similar methods should be minimized if possible

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::setOrderKeys() "WorkflowApi::setOrderKeys()"
        - @ref wf_set_order_keys()
        - setOrderKeys()
        - appendOrderKeys()
    */
    static public void setOrderKeys(HashMap<String, Object> h) throws Throwable {
        QoreJavaApi.callStaticMethod("WorkflowApi", "setOrderKeys", h);
    }

    //! This method sets the values for a sinle user-defined order key against an order, so that the workflow order data instance can be quickly searched and retrieved using the key value
    /** The value provided replaces any order key value on the workflow order

        The data is committed to the database before the method returns.

        @param key the workflow key to set; must be a valid workflow key
        @param value one or more string values for the workflow key
        @param truncate allow key values to be truncated without an error

        @throw INVALID-WORKFLOW-KEY invalid key for workflow
        @throw DUPLICATE-KEY-VALUE an order key was assigned a value more than once

        @note the use of this method causes SQL I/O to be performed in the system schema; to maximize performance,
        calls to this and other similar methods should be minimized if possible

        @see
        - @ref wf_set_order_keys()
        - appendOrderKeys()
        - getOrderKeys()
        - setOrderKeys()
    */
    static public void setOrderKey(String key, String value, boolean truncate) throws Throwable {
        QoreJavaApi.callStaticMethod("WorkflowApi", "setOrderKey", key, value, truncate);
    }

    //! This method sets the values for a sinle user-defined order key against an order, so that the workflow order data instance can be quickly searched and retrieved using the key value
    /** The value provided replaces any order key value on the workflow order

        The data is committed to the database before the method returns.

        @param key the workflow key to set; must be a valid workflow key
        @param value one or more string values for the workflow key

        @throw INVALID-WORKFLOW-KEY invalid key for workflow
        @throw DUPLICATE-KEY-VALUE an order key was assigned a value more than once

        @note the use of this method causes SQL I/O to be performed in the system schema; to maximize performance,
        calls to this and other similar methods should be minimized if possible

        @see
        - @ref wf_set_order_keys()
        - appendOrderKeys()
        - getOrderKeys()
        - setOrderKeys()
    */
    static public void setOrderKey(String key, String value) throws Throwable {
        QoreJavaApi.callStaticMethod("WorkflowApi", "setOrderKey", key, value);
    }

    //! This method sets the values for a sinle user-defined order key against an order, so that the workflow order data instance can be quickly searched and retrieved using the key value
    /** The value provided replaces any order key value on the workflow order

        The data is committed to the database before the method returns.

        @param key the workflow key to set; must be a valid workflow key
        @param values one or more string values for the workflow key
        @param truncate allow key values to be truncated without an error

        @throw INVALID-WORKFLOW-KEY invalid key for workflow
        @throw DUPLICATE-KEY-VALUE an order key was assigned a value more than once

        @note the use of this method causes SQL I/O to be performed in the system schema; to maximize performance,
        calls to this and other similar methods should be minimized if possible

        @see
        - @ref wf_set_order_keys()
        - appendOrderKeys()
        - getOrderKeys()
        - setOrderKeys()
    */
    static public void setOrderKey(String key, String[] values, boolean truncate) throws Throwable {
        QoreJavaApi.callStaticMethod("WorkflowApi", "setOrderKey", key, values, truncate);
    }

    //! This method sets the values for a sinle user-defined order key against an order, so that the workflow order data instance can be quickly searched and retrieved using the key value
    /** The value provided replaces any order key value on the workflow order

        The data is committed to the database before the method returns.

        @param key the workflow key to set; must be a valid workflow key
        @param values one or more values for the workflow key; values must be directly convertible to String

        @throw INVALID-WORKFLOW-KEY invalid key for workflow
        @throw DUPLICATE-KEY-VALUE an order key was assigned a value more than once

        @note the use of this method causes SQL I/O to be performed in the system schema; to maximize performance,
        calls to this and other similar methods should be minimized if possible

        @see
        - @ref wf_set_order_keys()
        - appendOrderKeys()
        - getOrderKeys()
        - setOrderKeys()
    */
    static public void setOrderKey(String key, Object... values) throws Throwable {
        QoreJavaApi.callStaticMethod("WorkflowApi", "setOrderKey", key, values);
    }

    //! This method appends user-defined order key values to a workflow order key, so that the workflow order data instance can be quickly searched and retrieved using the key value
    /** The hash provided appends orders keys to the workflow order; existing order keys matching keys given in the hash provided as an argument to this method are updated and any new keys are added.

        The data is committed to the database before the method returns.

        @param h key-value pairs to append to workflow order keys; the keys in this hash must match those defined for the workflow
        @param truncate allow key values to be truncated without an error

        @throw APPEND-ORDER-KEYS-ERROR empty hash passed to wf_append_order_keys()
        @throw INVALID-WORKFLOW-KEY invalid key for workflow
        @throw SET-ORDER-KEYS-ERROR an invalid data type (not convertible to a string) was given as a key value

        @note the use of this method causes SQL I/O to be performed in the system schema; to maximize performance, calls to this and other similar methods should be minimized if possible

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::appendOrderKeys() "WorkflowApi::appendOrderKeys()"
        - @ref wf_append_order_keys()
        - setOrderKeys()
        - getOrderKeys()
    */
    static public void appendOrderKeys(HashMap<String, Object> h, boolean truncate) throws Throwable {
        QoreJavaApi.callStaticMethod("WorkflowApi", "appendOrderKeys", h, truncate);
    }

    //! This method appends user-defined order key values to a workflow order key, so that the workflow order data instance can be quickly searched and retrieved using the key value
    /** The hash provided appends orders keys to the workflow order; existing order keys matching keys given in the hash provided as an argument to this method are updated and any new keys are added.

        The data is committed to the database before the method returns.

        @param h key-value pairs to append to workflow order keys; the keys in this hash must match those defined for the workflow

        @throw APPEND-ORDER-KEYS-ERROR empty hash passed to wf_append_order_keys()
        @throw INVALID-WORKFLOW-KEY invalid key for workflow
        @throw SET-ORDER-KEYS-ERROR an invalid data type (not convertible to a string) was given as a key value

        @note the use of this method causes SQL I/O to be performed in the system schema; to maximize performance, calls to this and other similar methods should be minimized if possible

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::appendOrderKeys() "WorkflowApi::appendOrderKeys()"
        - @ref wf_append_order_keys()
        - setOrderKeys()
        - getOrderKeys()
    */
    static public void appendOrderKeys(HashMap<String, Object> h) throws Throwable {
        QoreJavaApi.callStaticMethod("WorkflowApi", "appendOrderKeys", h);
    }

    //! This method appends user-defined order key values to a workflow order key, so that the workflow order data instance can be quickly searched and retrieved using the key value
    /** This method appends order keys to the workflow order; existing order keys matching keys given in the
        arguments provided are updated and any new keys are added.

        The data is committed to the database before the method returns.

        @param key the workflow order key to append to; this key must match a defined workflow order key
        @param value the value to append for the given key
        @param truncate allow key values to be truncated without an error

        @throw APPEND-ORDER-KEYS-ERROR empty hash passed to wf_append_order_keys()
        @throw INVALID-WORKFLOW-KEY invalid key for workflow
        @throw DUPLICATE-KEY-VALUE an order key was assigned a value more than once

        @note the use of this method causes SQL I/O to be performed in the system schema; to maximize performance,
        calls to this and other similar methods should be minimized if possible

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::appendOrderKeys() "WorkflowApi::appendOrderKeys()"
        - @ref wf_append_order_keys()
        - setOrderKeys()
        - getOrderKeys()
    */
    static public void appendOrderKeys(String key, String value, boolean truncate) throws Throwable {
        QoreJavaApi.callStaticMethod("WorkflowApi", "appendOrderKeys", key, value, truncate);
    }

    //! This method appends user-defined order key values to a workflow order key, so that the workflow order data instance can be quickly searched and retrieved using the key value
    /** This method appends order keys to the workflow order; existing order keys matching keys given in the
        arguments provided are updated and any new keys are added.

        The data is committed to the database before the method returns.

        @param key the workflow order key to append to; this key must match a defined workflow order key
        @param values the value(s) to append for the given key; must be directly convertible to String

        @throw APPEND-ORDER-KEYS-ERROR empty hash passed to wf_append_order_keys()
        @throw INVALID-WORKFLOW-KEY invalid key for workflow
        @throw DUPLICATE-KEY-VALUE an order key was assigned a value more than once

        @note the use of this method causes SQL I/O to be performed in the system schema; to maximize performance,
        calls to this and other similar methods should be minimized if possible

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::appendOrderKeys() "WorkflowApi::appendOrderKeys()"
        - @ref wf_append_order_keys()
        - setOrderKeys()
        - getOrderKeys()
    */
    static public void appendOrderKeys(String key, Object... values) throws Throwable {
        QoreJavaApi.callStaticMethod("WorkflowApi", "appendOrderKeys", key, values);
    }

    //! This method retrieves the user-defined order key information saved against the workflow order data instance
    /** @param key the order key to return

        @return the value of the given key is returned

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::getOrderKeys() "WorkflowApi::getOrderKeys()"
        - @ref wf_get_order_keys()
        - appendOrderKeys()
        - setOrderKeys()
    */
    static public Object getOrderKeys(String key) throws Throwable {
        return QoreJavaApi.callStaticMethod("WorkflowApi", "getOrderKeys", key);
    }

    //! This method retrieves the user-defined order key information saved against the workflow order data instance
    /** @param keys a list of String key values

        @return a hash is returned giving the values of all the keys requested

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::getOrderKeys() "WorkflowApi::getOrderKeys()"
        - @ref wf_get_order_keys()
        - appendOrderKeys()
        - setOrderKeys()
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getOrderKeys(String... keys) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethodArgs("WorkflowApi", "getOrderKeys", keys);
    }

    //! This method retrieves the user-defined order key information saved against the workflow order data instance
    /**
        @return a hash is returned giving the values of all the keys requested

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::getOrderKeys() "WorkflowApi::getOrderKeys()"
        - @ref wf_get_order_keys()
        - appendOrderKeys()
        - setOrderKeys()
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getOrderKeys() throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("WorkflowApi", "getOrderKeys");
    }

    //! returns workflow metadata for the currently running workflow as a hash
    /** @return a hash of workflow metadata; see @ref workflowmetadata for the hash description

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::getWorkflowMetadata() "WorkflowApi::getWorkflowMetadata()"
        - @ref wf_get_workflow_metadata()
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getWorkflowMetadata() throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("WorkflowApi", "getWorkflowMetadata");
    }

    //! set the current workflow order status to @ref OMQ.StatBlocked, can only be called from the @ref attach "attach function"
    /** Processing of the workflow order will stop after this call; in order to be further processed the workflow
        order must be unblocked

        @throw BLOCK-ERROR method not called from @ref attach "attach function"

        @note This method can only be called in the @ref attach "attach function" of the workflow; if called from any
        other code, an exception will result.

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::setBlocked() "WorkflowApi::setBlocked()"
        - @ref wf_set_blocked()
    */
    static public void setBlocked() throws Throwable {
        QoreJavaApi.callStaticMethod("WorkflowApi", "setBlocked");
    }

    //! Get @ref order_instance_notes
    /** @param count an optional integer to limit the list size

        @return list of hashes of @ref order_instance_notes

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::getOrderNotes() "WorkflowApi::getOrderNotes()"
        - @ref wf_get_order_notes()
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object>[] getOrderNotes(int count) throws Throwable {
        return (HashMap<String, Object>[])QoreJavaApi.callStaticMethod("WorkflowApi", "getOrderNotes", count);
    }

    //! Get @ref order_instance_notes
    /** @return list of hashes of @ref order_instance_notes

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::getOrderNotes() "WorkflowApi::getOrderNotes()"
        - @ref wf_get_order_notes()
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object>[] getOrderNotes() throws Throwable {
        return (HashMap<String, Object>[])QoreJavaApi.callStaticMethod("WorkflowApi", "getOrderNotes");
    }

    //! Add new note as described in @ref order_instance_notes
    /** @param notestr a string with note

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::addOrderNote() "WorkflowApi::addOrderNote()"
        - @ref wf_add_order_note()
    */
    static public void addOrderNote(String notestr) throws Throwable {
        QoreJavaApi.callStaticMethod("WorkflowApi", "addOrderNote", notestr);
    }

    //! Sets a user-defined custom status for the current step
    /** The custom status is also propagatef to the segment and workflow order data instances. The status is reset when the step is updated subsequently.  The value of the custom status is only used for display purposes; it does not affect Qorus’ internal behavior at all.

        @param stat the custom user-defined status to set for the step

        @throw CUSTOM-STATUS-ERROR this exception is thrown if this method is called outside of step code

        @note The custom status must be a single character

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::setCustomStatus() "WorkflowApi::setCustomStatus()"
        - @ref wf_set_custom_status()
    */
    static public void setCustomStatus(String stat) throws Throwable {
        QoreJavaApi.callStaticMethod("WorkflowApi", "setCustomStatus", stat);
    }

    //! reschedules the current workflow order instance for later processing
    /** Can only be called in the @ref attach "attach function"; calling anywhere else will cause an exception to be
        raised.
        Can only be called when the workflow order has status @ref OMQ.StatReady or @ref OMQ.StatScheduled; otherwise
        an exception will be raised.

        @param scheduled If the date is ealier than the current time; then this call is ignored

        @throw RESCHEDULE-ERROR method not called from the @ref attach "attach function"; order data does not have
        @ref OMQ.StatReady or @ref OMQ.StatScheduled status

        @note the scheduled date can be changed or cleared by calling the system API method omq.system.reschedule-order()

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::rescheduleOrder() "WorkflowApi::rescheduleOrder()"
        - @ref wf_reschedule_order()
    */
    static public void rescheduleOrder(ZonedDateTime scheduled) throws Throwable {
        QoreJavaApi.callStaticMethod("WorkflowApi", "rescheduleOrder", scheduled);
    }

    //! changes the order priority for the current workflow order instance
    /** @param prio must be an integer >= 0 and <= 999

        @note the order priority can be changed externally by calling the system API method omq.system.reprioritize-order()

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::reprioritizeOrder() "WorkflowApi::reprioritizeOrder()"
        - @ref wf_reprioritize_order()
    */
    static public void reprioritizeOrder(int prio) throws Throwable {
        QoreJavaApi.callStaticMethod("WorkflowApi", "reprioritizeOrder", prio);
    }

    //! leaves feedback for a parent workflow
    /** When this call returns, the feedback data has already been committed to the database.

        @param key the key name for the feedback in the parent workflow
        @param value the value of the key

        @throw FEEDBACK-ERROR the current workflow is not a subworkflow; value is null or an error occurred accessing the parent workflow order
        @throw SESSION-ERROR the parent workflow order is being processed by another Qorus session
        @throw STATUS-ERROR the parent workflow order is already COMPLETE or CANCELED and cannot be updated

        The parent workflow should then call getChildFeedback() to get the feedback data left by the child workflow.

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::leaveParentFeedback() "WorkflowApi::leaveParentFeedback()"
        - @ref wf_leave_parent_feedback()
        - @ref subworkflowsteps
        - @ref getChildFeedback()

        @note the use of this method causes SQL I/O to be performed in the system schema; to maximize performance, calls to this and other similar methods should be minimized if possible
    */
    static public void leaveParentFeedback(String key, Object value) throws Throwable {
        QoreJavaApi.callStaticMethod("WorkflowApi", "leaveParentFeedback", key, value);
    }

    //! gets feedback from a child workflow order with the given key
    /** the child workflow has to set a value with the given key first with leaveParentFeedback() for any value to be returned with this method call

        @param key the feedback key name used by the child workflow

        @return the value of the feedback saved by the child workflow order with leaveParentFeedback() under the given key

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::getChildFeedback() "WorkflowApi::getChildFeedback()"
        - @ref wf_get_child_feedback()
        - @ref subworkflowsteps
        - @ref leaveParentFeedback()
    */
    static public Object getChildFeedback(String key) throws Throwable {
        return QoreJavaApi.callStaticMethod("WorkflowApi", "getChildFeedback", key);
    }

    //! gets all feedback from all child workflow orders as a hash
    /** child workflows have to set feedback values with leaveParentFeedback() for any value to be returned with this method call

        @return a hash representing all feedback values saved by child workflow orders with leaveParentFeedback()

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::getChildFeedback() "WorkflowApi::getChildFeedback()"
        - @ref wf_get_child_feedback()
        - @ref subworkflowsteps
        - @ref leaveParentFeedback()
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getChildFeedback() throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("WorkflowApi", "getChildFeedback");
    }

    //! Returns the parent workflow order data instance ID from a subworkflow or null if the current workflow order is not a subworkflow and therefore has no parent
    /** @return the parent workflow order data instance ID of a subworkflow or null if the current workflow order is not a subworkflow

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::parentWfiid() "WorkflowApi::parentWfiid()"
        - @ref wf_parent_wfiid()
        - @ref getWorkflowInstanceData()
        - @ref getWfiid()
    */
    static public Integer parentWfiid() throws Throwable {
        return (Integer)QoreJavaApi.callStaticMethod("WorkflowApi", "parentWfiid");
    }

    //! Returns the value of the named workflow options
    /** If the option is not set on the workflow, and it is a valid system option, then the value of the system option
        will be returned.

        @return a hash of requested option keys and values

        @note Invalid options do not cause an errors to be raised; the associated key values in the hash returned will
        be null

        @see @ref OMQ::UserApi::Workflow::WorkflowApi::getOption() "WorkflowApi::getOption()"
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getOption(String... keys) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethodArgs("WorkflowApi", "getOption", keys);
    }

    //! Returns the value of the named workflow option
    /** If the option is not set on the workflow, and it is a valid system option, then the value of the system option
        will be returned.

        @return the value of the requested option

        @note Invalid options do not cause an errors to be raised; the associated key values in the hash returned will
        be null

        @see @ref OMQ::UserApi::Workflow::WorkflowApi::getOption() "WorkflowApi::getOption()"
    */
    static public Object getOption(String key) throws Throwable {
        return QoreJavaApi.callStaticMethod("WorkflowApi", "getOption", key);
    }

    //! Returns the value of all workflow options
    /** @return all workflow-level options are returned as a hash

        @see @ref OMQ::UserApi::Workflow::WorkflowApi::getOption() "WorkflowApi::getOption()"
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getOption() throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("WorkflowApi", "getOption");
    }

    //! Changes option values on a workflow
    /** If the workflow has defined workflow options and at least one invalid option is passed to
        the method, an exception will be raised; however all other valid options in the hash will be set before the
        exception is raised

        @param hash a hash of option-value pairs

        @throw WORKFLOW-OPTION-ERROR invalid option name

        @see @ref OMQ::UserApi::Workflow::WorkflowApi::setOption() "WorkflowApi::setOption()"
    */
    static public void setOption(HashMap<String, Object> hash) throws Throwable {
        QoreJavaApi.callStaticMethod("WorkflowApi", "setOption", hash);
    }

    //! Changes a single option value on a workflow
    /** If the workflow has defined workflow options and an invalid option is passed to the method, an exception will
        be raised.

        @param option the option to set
        @param value the value to set for the option

        @throw WORKFLOW-OPTION-ERROR invalid option name

        @see @ref OMQ::UserApi::Workflow::WorkflowApi::setOption() "WorkflowApi::setOption()"
    */
    static public void setOption(String option, Object value) throws Throwable {
        HashMap<String, Object> opts = new HashMap<String, Object>() {
            {
                put(option, value);
            }
        };

        QoreJavaApi.callStaticMethod("WorkflowApi", "setOption", opts);
    }

    //! returns the current workflow_instanceid as an integer; returns null if not called in a workflow order context (ex: @ref onetimeinit "onetimeinit function", etc)
    /**
        @return the current workflow_instanceid as an integer; returns null if not called in a workflow order context
        (ex: @ref onetimeinit "onetimeinit function", etc)

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::getWfiid() "WorkflowApi::getWfiid()"
        - @ref wf_wfiid()
        - @ref getWorkflowInstanceData()
        - @ref parentWfiid()
    */
    static public Integer getWfiid() throws Throwable {
        return (Integer)QoreJavaApi.callStaticMethod("WorkflowApi", "getWfiid");
    }

    //! puts the current thread to sleep for a certain number of seconds
    /**
        If the worklow is stopping, this method returns immediately with a
        return value of -1; otherwise the current thread is put to sleep for the full time period requested.  If this
        method (or usleep()) is called again after -1 is returned, then a \c "STOP-ERROR" exception is thrown.

        @param arg the number of seconds to sleep

        @return 0 if current thread was put to sleep for the full time period; -1 if the sleep was interrupted because
        the current object is being stopped

        @throw STOP-ERROR the current object is stopping and this method already returned -1 as a warning

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::sleep()
        - usleep()
    */
    static public int sleep(int arg) throws Throwable {
        return (int)QoreJavaApi.callStaticMethod("WorkflowApi", "sleep", arg);
    }

    //! puts the current thread to sleep for a certain number of microseconds
    /**
        If the worklow is stopping, this method returns immediately with a return
        value of -1; otherwise the current thread is put to sleep for the full time period requested.  If this method
        (or sleep()) is called again after -1 is returned, then a \c "STOP-ERROR" exception is thrown.

        @param arg the number of microseconds to sleep (1 microsecond = 1/1000000 of a second)

        @return 0 if current thread was put to sleep for the full time period; -1 if the sleep was interrupted because
        the current object is being stopped

        @throw STOP-ERROR the current object is stopping and this method already returned -1 as a warning

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::usleep()
        - sleep()
    */
    static public int usleep(int arg) throws Throwable {
        return (int)QoreJavaApi.callStaticMethod("WorkflowApi", "usleep", arg);
    }

    //! puts the current thread to sleep for a certain number of microseconds
    /**
        If the worklow is stopping, this method returns immediately with a return
        value of -1; otherwise the current thread is put to sleep for the full time period requested.  If this method
        (or sleep()) is called again after -1 is returned, then a \c "STOP-ERROR" exception is thrown.

        @param arg the amount of time in microseconds to sleep (1 microsecond = 1/1000000 of a second)

        @return 0 if current thread was put to sleep for the full time period; -1 if the sleep was interrupted because
        the current object is being stopped

        @throw STOP-ERROR the current object is stopping and this method already returned -1 as a warning

        @see
        - @ref OMQ::UserApi::Workflow::WorkflowApi::usleep()
        - sleep()
    */
    static public int usleep(QoreRelativeTime arg) throws Throwable {
        return (int)QoreJavaApi.callStaticMethod("WorkflowApi", "usleep", arg);
    }

    //! returns the value of the given step configuration item
    /** @par Example:
        @code{.java}
Object val = WorkflowApi.getConfigItemValue(item, local_context);
        @endcode

        @param item the name of the step configuration item; step configuration item values
        take precedence over values on workflow level. Values on workflow level take precedence over
        values on global level. If there is no value on the previous levels then the default value is returned.
        @param local_context the caller can supply its "local" context for template variables (plus user context info is
                             added - see @ref UserApi::getUserContextInfo() method)
        @param expand_complex_values if true then lists and hashes will have their string values expanded recursively

        @return the value of the given configuration item

        @throw CONFIG-ITEM-ERROR thrown if the configuration item is not valid

        @note Any global configuration item declared for any step in a workflow can be accessed in any other step in
        that workflow regardless of whether the step declared the global configuration item or not.

        @note the value is always substituted with
        @ref com.qoretechnologies.qorus.UserApi.expandTemplatedValue() "UserApi.expandTemplatedValue()"; make sure and escape any \c "$"
        characters with a backslash (\c "\") to avoid template substitution

        @see @ref stepconfigitems
    */
    static public Object getConfigItemValue(String item, HashMap<String, Object> local_context,
                                            boolean expand_complex_values) throws Throwable {
        return QoreJavaApi.callStaticMethod("WorkflowApi", "getConfigItemValue", item, local_context, expand_complex_values);
    }

    //! returns the value of the given step configuration item
    /** @par Example:
        @code{.java}
Object val = WorkflowApi.getConfigItemValue(item, local_context);
        @endcode

        @param item the name of the step configuration item; step configuration item values
        take precedence over values on workflow level. Values on workflow level take precedence over
        values on global level. If there is no value on the previous levels then the default value is returned.
        @param local_context the caller can supply its "local" context for template variables (plus user context info is
                             added - see @ref UserApi::getUserContextInfo() method)

        @return the value of the given configuration item

        @throw CONFIG-ITEM-ERROR thrown if the configuration item is not valid

        @note Any global configuration item declared for any step in a workflow can be accessed in any other step in
        that workflow regardless of whether the step declared the global configuration item or not.

        @note the value is always substituted with
        @ref com.qoretechnologies.qorus.UserApi.expandTemplatedValue() "UserApi.expandTemplatedValue()"; make sure and escape any \c "$"
        characters with a backslash (\c "\") to avoid template substitution

        @see @ref stepconfigitems
    */
    static public Object getConfigItemValue(String item, HashMap<String, Object> local_context) throws Throwable {
        return QoreJavaApi.callStaticMethod("WorkflowApi", "getConfigItemValue", item, local_context);
    }

    //! returns the value of the given step configuration item
    /** @par Example:
        @code{.java}
Object val = WorkflowApi.getConfigItemValue(item);
        @endcode

        @param item the name of the step configuration item; step configuration item values
        take precedence over values on workflow level. Values on workflow level take precedence over
        values on global level. If there is no value on the previous levels then the default value is returned.

        @return the value of the given configuration item

        @throw CONFIG-ITEM-ERROR thrown if the configuration item is not valid

        @note Any global configuration item declared for any step in a workflow can be accessed in any other step in
        that workflow regardless of whether the step declared the global configuration item or not.

        @note the value is always substituted with
        @ref com.qoretechnologies.qorus.UserApi.expandTemplatedValue() "UserApi.expandTemplatedValue()"; make sure and escape any \c "$"
        characters with a backslash (\c "\") to avoid template substitution

        @see @ref stepconfigitems
    */
    static public Object getConfigItemValue(String item) throws Throwable {
        return QoreJavaApi.callStaticMethod("WorkflowApi", "getConfigItemValue", item);
    }

    //! returns a hash of all configuration items for the current step as a combination of local and global configuration items
    /** @par Example:
        @code{.java}
HashMap<String, Object> config = WorkflowApi.getConfigItemHash(local_context);
        @endcode

        @param local_context the caller can supply its "local" context for template variables (plus user context info is
                             added - see @ref UserApi::getUserContextInfo() method)

        @return a hash of all configuration items for the current step; keys are config item names; values are
        config item values. If there are no config items for the current step, then an empty hash is returned.

        @note
        - if there are local configuration item values and values on global level, local values will take precedence
          over the global values
        - values are always substituted with
        @ref com.qoretechnologies.qorus.UserApi.expandTemplatedValue() "UserApi.expandTemplatedValue()"; make sure and escape any \c "$"
        characters with a backslash (\c "\") to avoid template substitution

        @see @ref stepconfigitems
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getConfigItemHash(HashMap<String, Object> local_context) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("WorkflowApi", "getConfigItemHash", local_context);
    }

    //! returns a hash of all configuration items for the current step as a combination of local and global configuration items
    /** @par Example:
        @code{.java}
HashMap<String, Object> config = WorkflowApi.getConfigItemHash();
        @endcode

        @return a hash of all configuration items for the current step; keys are config item names; values are
        config item values. If there are no config items for the current step, then an empty hash is returned.

        @note
        - if there are local configuration item values and values on global level, local values will take precedence
          over the global values
        - values are always substituted with
        @ref com.qoretechnologies.qorus.UserApi.expandTemplatedValue() "UserApi.expandTemplatedValue()"; make sure and escape any \c "$"
        characters with a backslash (\c "\") to avoid template substitution

        @see @ref stepconfigitems
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getConfigItemHash() throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("WorkflowApi", "getConfigItemHash");
    }
}
