/** Qorus Java Job API
 *
 */

package com.qoretechnologies.qorus.job;

// java imports
import java.util.HashMap;
import java.time.ZonedDateTime;

// jni module imports
import org.qore.jni.QoreJavaApi;
import org.qore.jni.QoreRelativeTime;

// Qorus imports
import com.qoretechnologies.qorus.OMQ;
import com.qoretechnologies.qorus.UserApi;

//! The main Qorus Java job API class
public class JobApi extends UserApi {
    //! raises an error in a running job; does not affect the flow of execution in the job code
    /** the error information is stored in the \c job_errors table with a severity of @ref OMQ.ES_Major and
        the business flag set to true

        @param err the error code
        @param desc_fmt the @ref string_formatting "format specifier" for the warning description string;
        following arguments will be included in the description string as combined with
        @ref Qore::vsprintf() "vsprintf()"
        @param args the args for \a desc_fmt

        @since %Qorus 3.1.0

        @see
        - @ref OMQ::UserApi::Job::JobApi::err()
        - errWithInfo()
        - warn()
        - warnWithInfo()
    */
    static public void err(String err, String desc_fmt, Object... args) throws Throwable {
        Object[] new_args = new Object[args.length + 2];
        new_args[0] = err;
        new_args[1] = desc_fmt;
        System.arraycopy(args, 0, new_args, 2, args.length);
        QoreJavaApi.callStaticMethodArgs("JobApi", "err", new_args);
    }

    //! raises an error in a running job; does not affect the flow of execution in the job code
    /** the error information is stored to the \c job_errors table, errors errors with a severity less than or
        equal to @ref OMQ.ES_Warning are treated as warnings

        @param err the error code
        @param desc a description for the error
        @param info additional information to be saved with the error (data structures are serialized in YAML
        format and saved in the database)
        @param severity the severity of the error, errors with a severity less than or equal to
        @ref OMQ.ES_Warning are treated as warnings; see @ref JavaErrorSeverityCodes for valid values (default =
        @ref OMQ.ES_Major)
        @param business set to true if the error represents a business error

        @note If the severity is less than or equal to @ref OMQ.ES_Warning, the job instance
        does not get an @ref OMQ.JS_Error status

        @see
        - @ref OMQ::UserApi::Job::JobApi::errWithInfo()
        - err()
        - warn()
        - warnWithInfo()
    */
    static public void errWithInfo(String err, String desc, Object info, String severity, boolean business) throws Throwable {
        QoreJavaApi.callStaticMethod("JobApi", "errWithInfo", err, desc, info, severity, business);
    }

    //! raises an error in a running job; does not affect the flow of execution in the job code
    /** the error information is stored to the \c job_errors table, errors errors with a severity less than or
        equal to @ref OMQ.ES_Warning are treated as warnings

        @param err the error code
        @param desc a description for the error
        @param info additional information to be saved with the error (data structures are serialized in YAML
        format and saved in the database)
        @param severity the severity of the error, errors with a severity less than or equal to
        @ref OMQ.ES_Warning are treated as warnings; see @ref JavaErrorSeverityCodes for valid values (default =
        @ref OMQ.ES_Major)

        @note If the severity is less than or equal to @ref OMQ.ES_Warning, the job instance
        does not get an @ref OMQ.JS_Error status

        @see
        - @ref OMQ::UserApi::Job::JobApi::errWithInfo()
        - err()
        - warn()
        - warnWithInfo()
    */
    static public void errWithInfo(String err, String desc, Object info, String severity) throws Throwable {
        QoreJavaApi.callStaticMethod("JobApi", "errWithInfo", err, desc, info, severity, false);
    }

    //! raises an error in a running job; does not affect the flow of execution in the job code
    /** the error information is stored to the \c job_errors table, errors errors with a severity less than or
        equal to @ref OMQ.ES_Warning are treated as warnings

        @param err the error code
        @param desc a description for the error
        @param info additional information to be saved with the error (data structures are serialized in YAML
        format and saved in the database)

        @see
        - @ref OMQ::UserApi::Job::JobApi::errWithInfo()
        - err()
        - warn()
        - warnWithInfo()
    */
    static public void errWithInfo(String err, String desc, Object info) throws Throwable {
        QoreJavaApi.callStaticMethod("JobApi", "errWithInfo", err, desc, info, OMQ.ES_Major, false);
    }

    //! raises an error in a running job; does not affect the flow of execution in the job code
    /** the error information is stored to the \c job_errors table, errors errors with a severity less than or
        equal to @ref OMQ.ES_Warning are treated as warnings

        @param err the error code
        @param info additional information to be saved with the error (data structures are serialized in YAML
        format and saved in the database)

        @see
        - @ref OMQ::UserApi::Job::JobApi::errWithInfo()
        - err()
        - warn()
        - warnWithInfo()
    */
    static public void errWithInfo(String err, Object info) throws Throwable {
        QoreJavaApi.callStaticMethod("JobApi", "errWithInfo", err, null, info, OMQ.ES_Major, false);
    }

    //! raises a warning in a running job; does not affect the flow of execution in the job code
    /** the warning information is stored to the \c job_errors table with a severity of @ref OMQ.ES_Warning
        and the business flag set to true

        @param err the warning or error code
        @param desc_fmt the @ref string_formatting "format specifier" for the warning description string;
        following arguments will be included in the description string as combined with
        @ref Qore::vsprintf() "vsprintf()"
        @param args the args for \a desc_fmt

        @see
        - @ref OMQ::UserApi::Job::JobApi::warn()
        - job_warn()
        - warnWithInfo()
        - err()
        - errWithInfo()
    */
    static public void warn(String err, String desc_fmt, Object... args) throws Throwable {
        Object[] new_args = new Object[args.length + 2];
        new_args[0] = err;
        new_args[1] = desc_fmt;
        System.arraycopy(args, 0, new_args, 2, args.length);
        QoreJavaApi.callStaticMethodArgs("JobApi", "warn", new_args);
    }

    //! raises a warning in a running job; does not affect the flow of execution in the job code
    /** the warning information is stored to the \c job_errors table with a severity of @ref OMQ.ES_Warning
        @param err the warning or error code
        @param desc a description for the warning
        @param info additional information to be saved with the warning (data structures are serialized in
        YAML format and saved in the database)
        @param business set to true if the warning represents a business warning

        @see
        - @ref OMQ::UserApi::Job::JobApi::warnWithInfo()
        - warn()
        - err()
        - errWithInfo()
    */
    static public void warnWithInfo(String err, String desc, Object info, boolean business) throws Throwable {
        QoreJavaApi.callStaticMethod("JobApi", "warnWithInfo", err, desc, info, business);
    }

    //! raises a warning in a running job; does not affect the flow of execution in the job code
    /** the warning information is stored to the \c job_errors table with a severity of @ref OMQ.ES_Warning
        @param err the warning or error code
        @param desc a description for the warning
        @param info additional information to be saved with the warning (data structures are serialized in
        YAML format and saved in the database)

        @see
        - @ref OMQ::UserApi::Job::JobApi::warnWithInfo()
        - warn()
        - err()
        - errWithInfo()
    */
    static public void warnWithInfo(String err, String desc, Object info) throws Throwable {
        QoreJavaApi.callStaticMethod("JobApi", "warnWithInfo", err, desc, info, false);
    }

    //! raises a warning in a running job; does not affect the flow of execution in the job code
    /** the warning information is stored to the \c job_errors table with a severity of @ref OMQ.ES_Warning
        @param err the warning or error code
        @param info additional information to be saved with the warning (data structures are serialized in
        YAML format and saved in the database)

        @see
        - @ref OMQ::UserApi::Job::JobApi::warnWithInfo()
        - warn()
        - err()
        - errWithInfo()
    */
    static public void warnWithInfo(String err, Object info) throws Throwable {
        QoreJavaApi.callStaticMethod("JobApi", "warnWithInfo", err, null, info, false);
    }

    //! saves information against the job instance in the database
    /** The information is serialized in YAML format and saved in the database in the \c JOB_INSTANCE row as a
        part of the job results.

        This information is returned in the API as the \c info key in @ref rest_job_result_hash data,
        for example in the return value to the REST @ref rest_api_GET_latest_jobresults__id_ call.

        @param info the information to save

        @note the data stored here is different from the data returned by @ref job_info()

        @see
        - @ref OMQ::UserApi::Job::JobApi::saveInfo()
        - getInfo()
    */
    static public void saveInfo(Object info) throws Throwable {
        QoreJavaApi.callStaticMethod("JobApi", "saveInfo", info);
    }

    //! returns a hash of job information about the current job
    /** @return a hash with the following keys:
        - \c jobid: the metadata jobid of the job type
        - \c job_instanceid: the id of the job instance
        - \c name: the job name
        - \c version: the job version
        - \c description: the job description
        - \c trigger: a String describing the timer/trigger for the job
        - \c last_executed: the last executed date/time of the job (NOTHING if never executed before the
            current iteration)
        - \c last_executed_job_instanceid: the last executed instance id of the job
        - \c single_instance: true if the job can only be run in a single Qorus instance, false if no such
            restriction is enabled
        - \c next: the next trigger date/time

        @note the data returned here is different from the data stored by @ref job_save_info()

        @see
        - @ref OMQ::UserApi::Job::JobApi::getInfo()
        - saveInfo()
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getInfo() throws Throwable {
        return(HashMap<String, Object>)QoreJavaApi.callStaticMethod("JobApi", "getInfo");
    }

    //! serializes the given hash and stores against the job's state data in \c JOB_STATE_DATA
    /** @param data the state data to serialize and store against the job's state data in \c JOB_STATE_DATA

        @note job state state data is automatically cleared when a job instance gets a @ref OMQ::StatComplete
        status

        @see
        - @ref OMQ::UserApi::Job::JobApi::saveStateData()
        - getStateData()
        - svc_get_state_data()
        - @ref rest_api_GET_latest_jobs__id_or_name_
        - @ref rest_api_PUT_latest_jobs__id_or_name__setStateData

    */
    static public void saveStateData(HashMap<String, Object> data) throws Throwable {
        QoreJavaApi.callStaticMethod("JobApi", "saveStateData", data);
    }

    //! returns any job state state data stored with job_save_state_data()
    /** @return any job state state data stored with job_save_state_data()

        @note job state state data is automatically cleared when a job instance gets a @ref OMQ::StatComplete
        status

        @see
        - @ref OMQ::UserApi::Job::JobApi::getStateData()
        - saveStateData()
        - svc_save_state_data()
        - @ref rest_api_GET_latest_jobs__id_or_name_
        - @ref rest_api_PUT_latest_jobs__id_or_name__setStateData
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getStateData() throws Throwable {
        return(HashMap<String, Object>)QoreJavaApi.callStaticMethod("JobApi", "getStateData");
    }

    //! sets a one-time custom trigger time for the job; returns true if set, false if ignored
    /** @param ts the timestamp to trigger the job; must be in the future and before the next trigger time

        @return true if set, false if ignored; the call will be ignored if the date/time value is in
        the past or after the next scheduled job trigger time

        @note when this API returns with a true return value, the job's custom trigger time has already
        been committed to the database

        @see @ref OMQ::UserApi::Job::JobApi::setTrigger()
    */
    static public boolean setTrigger(ZonedDateTime ts) throws Throwable {
        return(boolean)QoreJavaApi.callStaticMethod("JobApi", "setTrigger", ts);
    }

    //! Changes option values on a job
    /** If the job has defined job options, and at least one invalid option is passed to
        the method, an exception will be raised; however all other valid options in the hash will be set before the
        exception is raised

        @param opts a hash of option-value pairs

        @throw JOB-OPTION-ERROR invalid option name

        @see
        - @ref OMQ::UserApi::Job::JobApi::setOption()
        - getOption()
        - getOptionArgs()
    */
    static public void setOption(HashMap<String, Object> opts) throws Throwable {
        QoreJavaApi.callStaticMethod("JobApi", "setOption", opts);
    }

    //! Changes a single option value on a job
    /** If the job has defined job options and an invalid option is passed to the method, an exception will
        be raised.

        @param option the option to set
        @param value the value to set for the option

        @throw JOB-OPTION-ERROR invalid option name

        @see
        - @ref OMQ::UserApi::Job::JobApi::setOption()
        - getOption()
        - getOptionArgs()
    */
    static public void setOption(String option, Object value) throws Throwable {
        HashMap<String, Object> opts = new HashMap<String, Object>() {
            {
                put(option, value);
            }
        };
        QoreJavaApi.callStaticMethod("JobApi", "setOption", opts);
    }

    //! Returns the value of all job options
    /**
        @return all job-level options are returned as a hash

        @see
        - @ref OMQ::UserApi::Job::JobApi::getOption()
        - getOptionArgs()
        - setOption()
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getOption() throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("JobApi", "getOption");
    }

    //! Returns the value of the named job option or options
    /** If the option is not set on the job, and it is a valid system option, then the value of the system
        option will be returned.

        @param args the list of options to return

        @return the value requested directly if only one argument is passed, otherwise a hash of option keys and
        values; note that if no arguments are passed to the method all job-level options are returned as a hash

        @note Invalid options do not cause an errors to be raised; the associated key
        values in the hash returned will be NOTHING

        @see
        - @ref OMQ::UserApi::Job::JobApi::getOption()
        - setOption()
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getOption(String... args) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("JobApi", "getOption", (Object)args);
    }

    //! Returns the value of the named job option
    /** If the option is not set on the job, and it is a valid system option, then the value of the system option
        will be returned.

        @return the value of the requested option

        @note Invalid options do not cause an errors to be raised; the associated value returned will be null

        @see @ref OMQ::UserApi::Workflow::WorkflowApi::getOption() "WorkflowApi::getOption()"
    */
    static public Object getOption(String key) throws Throwable {
        return QoreJavaApi.callStaticMethod("JobApi", "getOption", key);
    }

    //! puts the current thread to sleep for a certain number of seconds
    /**
        If the job is stopping, this method returns immediately with a
        return value of -1; otherwise the current thread is put to sleep for the full time period requested.  If this
        method (or usleep()) is called again after -1 is returned, then a \c "STOP-ERROR" exception is thrown.

        @param arg the number of seconds to sleep

        @return 0 if current thread was put to sleep for the full time period; -1 if the sleep was interrupted because
        the current object is being stopped

        @throw STOP-ERROR the current object is stopping and this method already returned -1 as a warning

        @see
        - @ref OMQ::UserApi::Job::JobApi::sleep()
        - usleep()
    */
    static public int sleep(int arg) throws Throwable {
        return (int)QoreJavaApi.callStaticMethod("JobApi", "sleep", arg);
    }

    //! puts the current thread to sleep for a certain number of microseconds
    /**
        If the job is stopping, this method returns immediately with a return
        value of -1; otherwise the current thread is put to sleep for the full time period requested.  If this method
        (or sleep()) is called again after -1 is returned, then a \c "STOP-ERROR" exception is thrown.

        @param arg the number of microseconds to sleep (1 microsecond = 1/1000000 of a second)

        @return 0 if current thread was put to sleep for the full time period; -1 if the sleep was interrupted because
        the current object is being stopped

        @throw STOP-ERROR the current object is stopping and this method already returned -1 as a warning

        @see
        - @ref OMQ::UserApi::Job::JobApi::usleep()
        - sleep()
    */
    static public int usleep(int arg) throws Throwable {
        return (int)QoreJavaApi.callStaticMethod("JobApi", "usleep", arg);
    }

    //! puts the current thread to sleep for a certain number of microseconds
    /**
        If the job is stopping, this method returns immediately with a return
        value of -1; otherwise the current thread is put to sleep for the full time period requested.  If this method
        (or sleep()) is called again after -1 is returned, then a \c "STOP-ERROR" exception is thrown.

        @param arg the amount of time in microseconds to sleep (1 microsecond = 1/1000000 of a second)

        @return 0 if current thread was put to sleep for the full time period; -1 if the sleep was interrupted because
        the current object is being stopped

        @throw STOP-ERROR the current object is stopping and this method already returned -1 as a warning

        @see
        - @ref OMQ::UserApi::Job::JobApi::usleep()
        - sleep()
    */
    static public int usleep(QoreRelativeTime arg) throws Throwable {
        return (int)QoreJavaApi.callStaticMethod("JobApi", "usleep", arg);
    }

    //! returns the value of the given configuration item for the current job
    /** @par Example:
        @code{.java}
Object val = JobApi.getConfigItemValue(item, local_context);
        @endcode

        @param item the name of the job configuration item; job configuration item values
        take precedence over values on global level if both are set otherwise if both are not set
        the default value is returned
        @param local_context the caller can supply its "local" context for template variables (plus user context info is
                             added - see @ref UserApi::getUserContextInfo() method)
        @param expand_complex_values if true then lists and hashes will have their string values expanded recursively

        @return the value of the given configuration item

        @throw CONFIG-ITEM-ERROR thrown if the configuration item is not valid

        @note the value is always substituted with
        @ref com.qoretechnologies.qorus.UserApi.expandTemplatedValue() "UserApi.expandTemplatedValue()"; make sure and escape any \c "$"
        characters with a backslash (\c "\") to avoid template substitution

        @see @ref jobconfigitems
    */
    static public Object getConfigItemValue(String item, HashMap<String, Object> local_context,
                                            boolean expand_complex_values) throws Throwable {
        return QoreJavaApi.callStaticMethod("JobApi", "getConfigItemValue", item, local_context);
    }

    //! returns the value of the given configuration item for the current job
    /** @par Example:
        @code{.java}
Object val = JobApi.getConfigItemValue(item, local_context);
        @endcode

        @param item the name of the job configuration item; job configuration item values
        take precedence over values on global level if both are set otherwise if both are not set
        the default value is returned
        @param local_context the caller can supply its "local" context for template variables (plus user context info is
                             added - see @ref UserApi::getUserContextInfo() method)

        @return the value of the given configuration item

        @throw CONFIG-ITEM-ERROR thrown if the configuration item is not valid

        @note the value is always substituted with
        @ref com.qoretechnologies.qorus.UserApi.expandTemplatedValue() "UserApi.expandTemplatedValue()"; make sure and escape any \c "$"
        characters with a backslash (\c "\") to avoid template substitution

        @see @ref jobconfigitems
    */
    static public Object getConfigItemValue(String item, HashMap<String, Object> local_context) throws Throwable {
        return QoreJavaApi.callStaticMethod("JobApi", "getConfigItemValue", item, local_context);
    }

    //! returns the value of the given configuration item for the current job
    /** @par Example:
        @code{.java}
Object val = JobApi.getConfigItemValue(item);
        @endcode

        @param item the name of the job configuration item; job configuration item values
        take precedence over values on global level if both are set otherwise if both are not set
        the default value is returned

        @return the value of the given configuration item

        @throw CONFIG-ITEM-ERROR thrown if the configuration item is not valid

        @note the value is always substituted with
        @ref com.qoretechnologies.qorus.UserApi.expandTemplatedValue() "UserApi.expandTemplatedValue()"; make sure and escape any \c "$"
        characters with a backslash (\c "\") to avoid template substitution

        @see @ref jobconfigitems
    */
    static public Object getConfigItemValue(String item) throws Throwable {
        return QoreJavaApi.callStaticMethod("JobApi", "getConfigItemValue", item);
    }

    //! returns a hash of all configuration items for the current job as a combination of local and global configuration items
    /** @par Example:
        @code{.java}
HashMap<String, Object> config = JobApi.getConfigItemHash(local_context);
        @endcode

        @param local_context the caller can supply its "local" context for template variables (plus user context info is
                             added - see @ref UserApi::getUserContextInfo() method)

        @return a hash of all configuration items for the current job; keys are config item names; values are
        config item values. If there are no config items for the current job, then an empty hash is returned.

        @note
        - if there are local configuration item values and values on global level, local values will take precedence
          over the global values
        - values are always substituted with
        @ref com.qoretechnologies.qorus.UserApi.expandTemplatedValue() "UserApi.expandTemplatedValue()"; make sure and escape any \c "$"
        characters with a backslash (\c "\") to avoid template substitution

        @see @ref jobconfigitems
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getConfigItemHash(HashMap<String, Object> local_context) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("JobApi", "getConfigItemHash", local_context);
    }

    //! returns a hash of all configuration items for the current job as a combination of local and global configuration items
    /** @par Example:
        @code{.java}
HashMap<String, Object> config = JobApi.getConfigItemHash();
        @endcode

        @return a hash of all configuration items for the current job; keys are config item names; values are
        config item values. If there are no config items for the current job, then an empty hash is returned.

        @note
        - if there are local configuration item values and values on global level, local values will take precedence
          over the global values
        - values are always substituted with
        @ref com.qoretechnologies.qorus.UserApi.expandTemplatedValue() "UserApi.expandTemplatedValue()"; make sure and escape any \c "$"
        characters with a backslash (\c "\") to avoid template substitution

        @see @ref jobconfigitems
    */
    @SuppressWarnings("unchecked")
    static public HashMap<String, Object> getConfigItemHash() throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("JobApi", "getConfigItemHash");
    }
}
