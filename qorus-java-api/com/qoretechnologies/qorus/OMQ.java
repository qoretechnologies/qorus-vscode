/** Qorus Java Common API constant Declarations
 *
 */

package com.qoretechnologies.qorus;

// java imports
import java.util.Map;
import java.util.HashMap;
import java.util.Collections;

//! The main class with common definitions, equivalent to the \c %OMQ namespace in Qorus
public class OMQ {
    /** @defgroup JavaLibraryObjectTypes Java Workflow and Service Library Object Types
        These are the possible library object types for workflows and services
    */
    //@{
    //! for constant library objects
    public static final String OT_CONSTANT = "CONSTANT";
    //! for class library objects
    public static final String OT_CLASS    = "CLASS";
    //! for function library objects
    public static final String OT_FUNCTION = "FUNCTION";
    //@}

    /** @defgroup JavaStepTypes Java Step Types
        These are the possible types for steps
    */
    //@{
    //! step attribute: for normal steps
    public static final String ExecNormal      = "NORMAL";
    //! step attribute: for async steps
    public static final String ExecAsync       = "ASYNC";
    //! step attribute: for subworkflow steps
    public static final String ExecSubWorkflow = "SUBWORKFLOW";
    //! step attribute: for synchronization event steps
    public static final String ExecEvent       = "EVENT";
    //@}

    /** @defgroup JavaServiceStatuses Java Service Status Values
        These are the possible values for the status of a service
    */
    //@{
    //! service status: running
    public static final String SSRunning = "running";
    //! service status: running
    public static final String SSLoaded  = "loaded";
    //@}

    /** @defgroup JavaMethodLockAttributes Java Service Method Lock Attribute Values
        These are the possible values for the lock attribute of a service method
    */
    //@{
    //! service lock type: none
    public static final String SLNone  = "none";
    //! service lock type: read
    public static final String SLRead  = "read";
    //! service lock type: write
    public static final String SLWrite = "write";
    //@}

    /** @defgroup JavaSQLStatusCodes Java Workflow, Segment, and Step SQL Status Codes
        These are the possible values for a workflow order data instance; most of these can also be
        used for the status of a segment instance and a step instance

        @see
        - @ref JavaStatusDescriptions for the corresponding description for each status code
        - @ref OMQ.StatMap for a hash that can be used to map from descriptive status codes to @ref JavaSQLStatusCodes
        - @ref OMQ.SQLStatMap for a hash that can be used to map from SQL status codes to @ref JavaStatusDescriptions
    */
    //@{
    //! SQL Status: COMPLETE
    /** The equivalent descriptive status is @ref OMQ.StatComplete */
    public static final String SQLStatComplete       = "C";
    //! SQL Status: ERROR
    /** The equivalent descriptive status is @ref OMQ.StatError */
    public static final String SQLStatError          = "E";
    //! SQL Status: WAITING
    /** The equivalent descriptive status is @ref OMQ.StatWaiting */
    public static final String SQLStatWaiting        = "W";
    //! SQL Status: IN-PROGRESS
    /** The equivalent descriptive status is @ref OMQ.StatInProgress */
    public static final String SQLStatInProgress     = "I";
    //! SQL Status: INCOMPLETE
    /** The equivalent descriptive status is @ref OMQ.StatIncomplete */
    public static final String SQLStatIncomplete     = "N";
    //! SQL Status: ASYNC-WAITING
    /** The equivalent descriptive status is @ref OMQ.StatAsyncWaiting */
    public static final String SQLStatAsyncWaiting   = "A";
    //! SQL Status: EVENT-WAITING
    /** The equivalent descriptive status is @ref OMQ.StatEventWaiting */
    public static final String SQLStatEventWaiting   = "V";
    //! SQL Status: RETRY
    /** The equivalent descriptive status is @ref OMQ.StatRetry */
    public static final String SQLStatRetry          = "R";
    //! SQL Status: CANCELED
    /** The equivalent descriptive status is @ref OMQ.StatCanceled */
    public static final String SQLStatCanceled       = "X";
    //! SQL Status: READY
    /** The equivalent descriptive status is @ref OMQ.StatReady */
    public static final String SQLStatReady          = "Y";
    //! SQL Status: SCHEDULED
    /** The equivalent descriptive status is @ref OMQ.StatScheduled */
    public static final String SQLStatScheduled      = "S";
    //! SQL Status: BLOCKED
    /** The equivalent descriptive status is @ref OMQ.StatBlocked */
    public static final String SQLStatBlocked        = "B";
    //@}

    /** @defgroup JavaLogLevels Java Log Levels
        These are the possible values for log levels when calling system logging functions
    */
    //@{
    //! Log Level: CRITICAL
    public static final int LL_CRITICAL   = -1;
    //! Log Level: IMPORTANT
    public static final int LL_IMPORTANT  = 0;
    //! Log Level: INFO
    public static final int LL_INFO       = 1;
    //! Log Level: DETAIL_1
    public static final int LL_DETAIL_1   = 2;
    //! Log Level: DETAIL_2
    public static final int LL_DETAIL_2   = 3;
    //! Log Level: DEBUG_1
    public static final int LL_DEBUG_1    = 4;
    //! Log Level: DEBUG_2
    public static final int LL_DEBUG_2    = 5;
    //! Log Level: DEBUG_3
    public static final int LL_DEBUG_3    = 6;
    //@}

    /** @defgroup JavaWorkflowModes Java Workflow Execution Instance Modes
    These are the possible values for a workflow execution instance's mode attribute
    */
    //@{
    //! Workflow Mode: NORMAL
    public static final String WM_Normal = "NORMAL";
    //! Workflow Mode: RECOVERY
    public static final String WM_Recovery = "RECOVERY";
    //@}

    /** @defgroup JavaStatusDescriptions Java Workflow, Segment, and Step Status Descriptions
        These are the possible values for the descriptive status of a workflow order data instance; most of these can also be
        used for the status of a segment instance and a step instance.

        @note Descriptive status values are returned by almost all API functions even though @ref JavaSQLStatusCodes "abbreviated codes" are actually stored in th
e database; this is mainly for backwards compatibility.

        @see
        - @ref JavaSQLStatusCodes for the corresponding values stored in the database
        - @ref OMQ.StatMap for a hash that can be used to map from descriptive status codes to @ref JavaSQLStatusCodes
        - @ref OMQ.SQLStatMap for a hash that can be used to map from SQL status codes to @ref JavaStatusDescriptions
    */
    //@{
    //! This status indicates that the object it is attached to has successfully completed its processing
    /** This is a final status; once a workflow, segment, or step is \c COMPLETE, it will not be processed anymore.

        @note The equivalent status code actually stored in the database is @ref OMQ.SQLStatComplete
    */
    public static final String StatComplete       = "COMPLETE";

    //! Indicates that the workflow order data instance has at least one step with an @ref OMQ.StatError status
    /** This status takes the highest priority; if any one step in a workflow has an @ref OMQ.StatError status, then the entire workflow will also have an @ref OMQ.StatError status.  Workflow order data instances must be manually updated to @ref OMQ.StatRetry when an @ref OMQ.StatError status is reached.

        @note The equivalent status code actually stored in the database is @ref OMQ.SQLStatError
    */
    public static final String StatError          = "ERROR";

    //! Indicates that subworkflow steps are in progress and the system is waiting on the subworkflows to become @ref OMQ.StatComplete
    /** @note The equivalent status code actually stored in the database is @ref OMQ.SQLStatWaiting
     */
    public static final String StatWaiting        = "WAITING";

    //! Indicates that the workflow order data instance is currently being processed
    /** @note The equivalent status code actually stored in the database is @ref OMQ.SQLStatInProgress
     */
    public static final String StatInProgress     = "IN-PROGRESS";

    //! Indicates that processing for the workflow order data instance is not yet complete yet has no errors
    /** This status will be assigned after asynchronous segments have completed and
        dependent segments have not yet been started.

        @note The equivalent status code actually stored in the database is @ref OMQ.SQLStatIncomplete
    */
    public static final String StatIncomplete     = "INCOMPLETE";

    //! Indicates that asynchronous steps are in process and the system is waiting on data to become available in the queue assigned to the step
    /** @note The equivalent status code actually stored in the database is @ref OMQ.SQLStatAsyncWaiting
     */
    public static final String StatAsyncWaiting   = "ASYNC-WAITING";

    //! Indicates that one or more workflow event synchronization steps are in progress and the workflow is waiting for the event(s) to be posted
    /** @note The equivalent status code actually stored in the database is @ref OMQ.SQLStatEventWaiting
     */
    public static final String StatEventWaiting   = "EVENT-WAITING";

    //! Indicates that workflow processing on the order data instance has generated an error and is now waiting for an automatic retry
    /** @note The equivalent status code actually stored in the database is @ref OMQ.SQLStatRetry
     */
    public static final String StatRetry          = "RETRY";

    //! Indicates that workflow order data instance processing has been canceled
    /** This status is similar to @ref OMQ.StatBlocked but is considered a final status.
        @note The equivalent status code actually stored in the database is @ref OMQ.SQLStatCanceled
    */
    public static final String StatCanceled       = "CANCELED";

    //! Indicates that a workflow order data instance has been created and is waiting for processing to start
    /** @note The equivalent status code actually stored in the database is @ref OMQ.SQLStatReady
     */
    public static final String StatReady          = "READY";

    //! Indicates that a workflow order data instance has been created and has not yet been processed because at the time the order was created, the \c scheduled date (the earliest possible processing date) was in the future.
    /** @note The equivalent status code actually stored in the database is @ref OMQ.SQLStatScheduled
    */
    public static final String StatScheduled      = "SCHEDULED";

    //! Indicates that workflow order data instance processing has been temporarily blocked
    /** This status is similar to @ref OMQ.StatCanceled but is considered only temporary.
        @note The equivalent status code actually stored in the database is @ref OMQ.SQLStatBlocked
    */
    public static final String StatBlocked        = "BLOCKED";
    //@}

    //! map from text descriptions to SQL status characters
    public static final Map<String, String> StatMap = Collections.unmodifiableMap(new HashMap<String, String>() {
        {
            put("COMPLETE", "C");
            put("ERROR", "E");
            put("WAITING", "W");
            put("IN-PROGRESS", "I");
            put("INCOMPLETE", "N");
            put("ASYNC-WAITING", "A");
            put("EVENT-WAITING", "V");
            put("RETRY", "R");
            put("CANCELED", "X");
            put("READY", "Y");
            put("SCHEDULED", "S");
            put("BLOCKED", "B");
        }
    });

    //! hash mapping SQL status characters to text descriptions
    public static final Map<String, String> SQLStatMap = Collections.unmodifiableMap(new HashMap<String, String>() {
        {
            put("C", "COMPLETE");
            put("E", "ERROR");
            put("W", "WAITING");
            put("I", "IN-PROGRESS");
            put("N", "INCOMPLETE");
            put("A", "ASYNC-WAITING");
            put("V", "EVENT-WAITING");
            put("R", "RETRY");
            put("X", "CANCELED");
            put("Y", "READY");
            put("S", "SCHEDULED");
            put("B", "BLOCKED");
        }
    });

    /** @defgroup JavaErrorSeverityCodes Java Error Severity Codes
        These are the possible values for error severity codes
    */
    //@{
    //! Error Severity: MAJOR
    public static final String ES_Major = "MAJOR";
    //! Error Severity: WARNING
    public static final String ES_Warning = "WARNING";
    //@}

    /** @defgroup JavaWorkflowCompleteDisposition Java Workflow Order Complete Disposition Constants
        These constants provide codes that indicate how a workflow order went to \c COMPLETE
    */
    //@{
    //! order went to \c COMPLETE without any errors
    public static final String CS_Clean = "C";
    //! order went to \c COMPLETE after being recovered automatically
    public static final String CS_RecoveredAuto = "A";
    //! order went to \c COMPLETE after being recovered with manual retries
    public static final String CS_RecoveredManual = "M";
    //@}

    /** @defgroup JavaQueueStatusDescriptions Java Queue Data Status Descriptions
        These are the possible descriptions for an asynchronous queue data's status code.
        Note that descriptive status values are returned by almost all API functions even though
        @ref JavaSQLQueueStatusCodes "abbreviated codes" are actually stored in the database; this is
        mainly for backwards compatibility.
        @see @ref JavaSQLQueueStatusCodes for the corresponding value for each status description
        @see OMQ.QSMap for a hash that can be used to map from descriptive status codes to @ref JavaSQLQueueStatusCodes
        @see OMQ.SQLQSMap for a hash that can be used to map from SQL status codes to @ref JavaQueueStatusDescriptions
        @see OMQ.QS_ALL for a list of all valid queue statuses
    */
    //@{
    //! Queue Status Text Description: \c WAITING
    /** The equivalent status code actually stored in the database is @ref OMQ.SQL_QS_Waiting */
    public static final String QS_Waiting  = "WAITING";
    //! Queue Status Text Description: \c RECEIVED
    /** The equivalent status code actually stored in the database is @ref OMQ.SQL_QS_Received */
    public static final String QS_Received = "RECEIVED";
    //! Queue Status Text Description: \c ERROR
    /** The equivalent status code actually stored in the database is @ref OMQ.SQL_QS_Error */
    public static final String QS_Error    = "ERROR";
    //! Queue Status Text Description: \c USED
    /** The equivalent status code actually stored in the database is @ref OMQ.SQL_QS_Used
        @note this status is only used in Oracle databases where the queue rows are not deleted
        in order to preserve the integrity of the indexes on the \c QUEUE_DATA table */
    public static final String QS_Used     = "USED";
    //@}

    /** @defgroup JavaSQLQueueStatusCodes Java Queue Data Status Codes
        These are the possible values for an asynchronous queue data's status; this is the actual value that is stored in the DB
        @see @ref JavaQueueStatusDescriptions for the corresponding description for each status code
        @see OMQ.QSMap for a hash that can be used to map from descriptive status codes to @ref JavaSQLQueueStatusCodes
        @see OMQ.SQLQSMap for a hash that can be used to map from SQL status codes to @ref JavaQueueStatusDescriptions
    */
    //@{
    //! Queue Status SQL Character Code: \c WAITING
    /** The equivalent descriptive status is @ref OMQ.QS_Waiting */
    public static final String SQL_QS_Waiting  = "W";
    //! Queue Status SQL Character Code: \c RECEIVED
    /** The equivalent descriptive status is @ref OMQ.QS_Received */
    public static final String SQL_QS_Received = "R";
    //! Queue Status SQL Character Code: \c ERROR
    /** The equivalent descriptive status is @ref OMQ.QS_Error */
    public static final String SQL_QS_Error    = "E";
    //! Queue Status SQL Character Code: \c USED
    /** The equivalent descriptive status is @ref OMQ.QS_Used
        @note this status is only used in Oracle databases where the queue rows are not deleted
        in order to preserve the integrity of the indexes on the \c QUEUE_DATA table */
    public static final String SQL_QS_Used     = "X";
    //@}

    //! map of queue status descriptions to the character code
    public static final Map<String, String> QSMap = Collections.unmodifiableMap(new HashMap<String, String>() {
        {
            put("WAITING", "W");
            put("RECEIVED", "R");
            put("ERROR", "E");
            put("USED", "X");
        }
    });

    //! map of queue status character codes to the description
    public static final Map<String, String> SQLQSMap = Collections.unmodifiableMap(new HashMap<String, String>() {
        {
            put("W", "WAITING");
            put("R", "RECEIVED");
            put("E", "ERROR");
            put("X", "USED");
        }
    });

    /** @defgroup JavaRBACPermissions Java RBAC Permissions
        These are the permissions in Qorus' RBAC implementation
    */
    //@{
    // permission constants
    //! RBAC System Permission: \c "LOGIN"
    /** This permission is required for any user to connect to the system; it also implies read-only access to system configuration and data
    */
    public static final String QR_LOGIN = "LOGIN";

    //! RBAC System Permission: \c "SHUTDOWN"
    /** This permission allows the caller to shut down the system (call omq.system.shutdown() and omq.system.shutdown-wait())
    */
    public static final String QR_SHUTDOWN = "SHUTDOWN";

    //! RBAC System Permission: \c "WORKFLOW-CONTROL"
    /** This permission allows the caller to use functions affecting workflow execution instances and workflow order data
        Includes the following:
        - @ref OMQ.QR_WORKFLOW_EXEC_CONTROL
        - @ref OMQ.QR_WORKFLOW_ERROR_CONTROL
        - @ref OMQ.QR_WORKFLOW_ORDER_CONTROL
        - @ref OMQ.QR_SET_WORKFLOW_CONFIG

        @note this permission does not include any permissions for @ref sensitive_data "sensitive data"; these must be added separately
    */
    public static final String QR_WORKFLOW_CONTROL = "WORKFLOW-CONTROL";

    //! RBAC System Permission: \c "WORKFLOW-EXEC-CONTROL"
    /** This permission allows the caller to use functions affecting workflow execution instances (start, stop, refresh, etc workflows)
        Includes the following:
        - @ref OMQ.QR_START_WORKFLOW
        - @ref OMQ.QR_STOP_WORKFLOW
        - @ref OMQ.QR_RESET_WORKFLOW
        - @ref OMQ.QR_WORKFLOW_OPTION_CONTROL
        - @ref OMQ.QR_SET_STEP_CONFIG
    */
    public static final String QR_WORKFLOW_EXEC_CONTROL = "WORKFLOW-EXEC-CONTROL";

    //! RBAC System Permission: \c "START-WORKFLOW"
    /** This permission allows the caller to start workflow execution instances
    */
    public static final String QR_START_WORKFLOW = "START-WORKFLOW";

    //! RBAC System Permission: \c "STOP-WORKFLOW"
    /** This permission allows the caller to stop workflow execution instances
    */
    public static final String QR_STOP_WORKFLOW = "STOP-WORKFLOW";

    //! RBAC System Permission: \c "RESET-WORKFLOW"
    /** This permission allows the caller to reset workflow execution instances
    */
    public static final String QR_RESET_WORKFLOW = "RESET-WORKFLOW";

    //! RBAC System Permission: \c "WORKFLOW-OPTION-CONTROL"
    /** This permission allows the caller to change workflow execution instance options
    */
    public static final String QR_WORKFLOW_OPTION_CONTROL = "WORKFLOW-OPTION-CONTROL";

    //! RBAC System Permission: \c "WORKFLOW-ERROR-CONTROL"
    /** This permission allows the caller to create, change, and delete workflow error definitions
    */
    public static final String QR_WORKFLOW_ERROR_CONTROL = "WORKFLOW-ERROR-CONTROL";

    //! RBAC System Permission: \c "WORKFLOW-ORDER-CONTROL"
    /** This permission allows the caller to use functions affecting workflow order data (except @ref sensitive_data "sensitive data")
        Includes the following:
        - @ref OMQ.QR_RETRY_WORKFLOW_ORDER
        - @ref OMQ.QR_RESCHEDULE_WORKFLOW_ORDER
        - @ref OMQ.QR_REPRIORITIZE_WORKFLOW_ORDER
        - @ref OMQ.QR_BLOCK_WORKFLOW_ORDER
        - @ref OMQ.QR_CANCEL_WORKFLOW_ORDER
        - @ref OMQ.QR_SET_WORKFLOW_ORDER_ERROR
        - @ref OMQ.QR_SKIP_STEP
        - @ref OMQ.QR_SET_ORDER_INFO
        - @ref OMQ.QR_POST_WORKFLOW_EVENT
        - @ref OMQ.QR_LOCK_WORKFLOW_ORDER
        - @ref OMQ.QR_BREAK_WORKFLOW_ORDER_LOCK
        - @ref OMQ.QR_EDIT_WORKFLOW_DATA

        @note this permission does not include any permissions for @ref sensitive_data "sensitive data"; these must be added separately
    */
    public static final String QR_WORKFLOW_ORDER_CONTROL = "WORKFLOW-ORDER-CONTROL";

    //! RBAC System Permission: \c "RETRY-WORKFLOW-ORDER"
    /** This permission allows the caller to retry workflow order instances
    */
    public static final String QR_RETRY_WORKFLOW_ORDER = "RETRY-WORKFLOW-ORDER";

    //! RBAC System Permission: \c "RESCHEDULE-WORKFLOW-ORDER"
    /** This permission allows the caller to reschedule workflow order instances
    */
    public static final String QR_RESCHEDULE_WORKFLOW_ORDER = "RESCHEDULE-WORKFLOW-ORDER";

    //! RBAC System Permission: \c "REPRIORITIZE-WORKFLOW-ORDER"
    /** This permission allows the caller to reprioritize workflow order instances
    */
    public static final String QR_REPRIORITIZE_WORKFLOW_ORDER = "REPRIORITIZE-WORKFLOW-ORDER";

    //! RBAC System Permission: \c "BLOCK-WORKFLOW-ORDER"
    /** This permission allows the caller to block and unblock workflow order instances
    */
    public static final String QR_BLOCK_WORKFLOW_ORDER = "BLOCK-WORKFLOW-ORDER";

    //! RBAC System Permission: \c "CANCEL-WORKFLOW-ORDER"
    /** This permission allows the caller to cancel and uncancel workflow order instances
    */
    public static final String QR_CANCEL_WORKFLOW_ORDER = "CANCEL-WORKFLOW-ORDER";

    //! RBAC System Permission: \c "SET-WORKFLOW-ORDER-ERROR"
    /** This permission allows the caller to set workflow order instances to ERROR
    */
    public static final String QR_SET_WORKFLOW_ORDER_ERROR = "SET-WORKFLOW-ORDER-ERROR";

    //! RBAC System Permission: \c "SKIP-STEP"
    /** This permission allows the caller to skip steps in workflow order instances
    */
    public static final String QR_SKIP_STEP = "SKIP-STEP";

    //! RBAC System Permission: \c "SET-ORDER-INFO"
    /** This permission allows the caller to set username and comments fields in workflow order instances
    */
    public static final String QR_SET_ORDER_INFO = "SET-ORDER-INFO";

    //! RBAC System Permission: \c "POST-WORKFLOW-EVENT"
    /** This permission allows the caller to post workflow events
    */
    public static final String QR_POST_WORKFLOW_EVENT = "POST-WORKFLOW-EVENT";

    //! RBAC System Permission: \c "LOCK-WORKFLOW-ORDER"
    /** This permission allows the caller to acquire and release exclusive operator locks on workflow order instances
    */
    public static final String QR_LOCK_WORKFLOW_ORDER = "LOCK-WORKFLOW-ORDER";

    //! RBAC System Permission: \c "BREAK-WORKFLOW-ORDER-LOCK"
    /** This permission allows the caller to break exclusive operator locks acquired by other users on workflow order instances
    */
    public static final String QR_BREAK_WORKFLOW_ORDER_LOCK = "BREAK-WORKFLOW-ORDER-LOCK";

    //! RBAC System Permission: \c "EDIT-WORKFLOW-DATA"
    /** this permission allows the caller to update @ref staticdata and @ref dynamicdata by calling omq.system.replace-static-data() and omq.system.replace-dynamic-data(), respectively
    */
    public static final String QR_EDIT_WORKFLOW_DATA = "EDIT-WORKFLOW-DATA";

    //! RBAC System Permission: \c "READ-SENSITIVE-DATA";
    /** This permission allows the caller to read @ref sensitive_data "workflow sensitive data"

        @see @ref sensitive_data

        @since Qorus 3.1.1
    */
    public static final String QR_READ_SENSITIVE_DATA = "READ-SENSITIVE-DATA";

    //! RBAC System Permission: \c "EDIT-SENSITIVE-DATA";
    /** This permission allows the caller to update @ref sensitive_data "workflow sensitive data"

        @see @ref sensitive_data

        @since Qorus 3.1.1
    */
    public static final String QR_EDIT_SENSITIVE_DATA = "EDIT-SENSITIVE-DATA";

    //! RBAC System Permission: \c "DELETE-SENSITIVE-DATA";
    /** This permission allows the caller to delete @ref sensitive_data "workflow sensitive data"

        @see @ref sensitive_data

        @since Qorus 3.1.1
    */
    public static final String QR_DELETE_SENSITIVE_DATA = "DELETE-SENSITIVE-DATA";

    //! RBAC System Permission: \c "SENSITIVE-DATA-CONTROL";
    /** This permission allows the caller to read, create, update, and delete @ref sensitive_data "workflow sensitive data"

        Includes the following:
        - @ref OMQ.QR_READ_SENSITIVE_DATA
        - @ref OMQ.QR_EDIT_SENSITIVE_DATA
        - @ref OMQ.QR_DELETE_SENSITIVE_DATA

        @see @ref sensitive_data

        @since Qorus 3.1.1
    */
    public static final String QR_SENSITIVE_DATA_CONTROL = "SENSITIVE-DATA-CONTROL";

    //! RBAC System Permission: \c "EXEC-SYNC-WORKFLOW"
    /** this permission allows the user to execute synchronous workflows (call omq.system.exec-synchronous-workflow() and omq.system.exec-synchronous-existing())
    */
    public static final String QR_EXEC_SYNC_WORKFLOW = "EXEC-SYNC-WORKFLOW";

    //! RBAC System Permission: \c "SUBMIT-ORDER"
    /** this permission allows the caller to submit new workflow order data (call omq.system.submit-data.[workflow].[version]())
    */
    public static final String QR_SUBMIT_ORDER = "SUBMIT-ORDER";

    //! RBAC System Permissions: \c "SET-STEP-CONFIG"
    /** this permission allows the caller to change step configuration item values

        @since Qorus 4.0
    */
    public static final String QR_SET_STEP_CONFIG = "SET-STEP-CONFIG";

    //! RBAC System Permissions: \c "SET-WORKFLOW-CONFIG"
    /** this permission allows the caller to change workflow configuration item values

        @since Qorus 4.0.3
    */
    public static final String QR_SET_WORKFLOW_CONFIG = "SET-WORKFLOW-CONFIG";

    //! RBAC System Permission: \c "SERVICE-CONTROL"
    /** this permission allows the called to start, stop, reload, and generally manipulate services
        Includes the following:
        - @ref OMQ.QR_LOAD_SERVICE
        - @ref OMQ.QR_UNLOAD_SERVICE
        - @ref OMQ.QR_RESET_SERVICE
        - @ref OMQ.QR_SET_SERVICE_AUTOSTART
        - @ref OMQ.QR_SET_SERVICE_OPTIONS
        - @ref OMQ.QR_SET_SERVICE_CONFIG
    */
    public static final String QR_SERVICE_CONTROL = "SERVICE-CONTROL";

    //! RBAC System Permission: \c "LOAD-SERVICE"
    /** This permission allows the caller to load services
    */
    public static final String QR_LOAD_SERVICE = "LOAD-SERVICE";

    //! RBAC System Permission: \c "UNLOAD-SERVICE"
    /** This permission allows the caller to unload services
    */
    public static final String QR_UNLOAD_SERVICE = "UNLOAD-SERVICE";

    //! RBAC System Permission: \c "RESET-SERVICE"
    /** This permission allows the caller to reset services
    */
    public static final String QR_RESET_SERVICE = "RESET-SERVICE";

    //! RBAC System Permission: \c "SET-SERVICE-AUTOSTART"
    /** This permission allows the caller to change the service autostart flag
    */
    public static final String QR_SET_SERVICE_AUTOSTART = "SET-SERVICE-AUTOSTART";

    //! RBAC System Permission: \c "SET-SERVICE-OPTIONS"
    /** This permission allows the caller to set service options
    */
    public static final String QR_SET_SERVICE_OPTIONS = "SET-SERVICE-OPTIONS";

    //! RBAC System Permission: \c "CALL-USER-SERVICES-RO"
    /** this permission allows the caller to call user service methods without the write flag set
    */
    public static final String QR_CALL_USER_SERVICES_RO = "CALL-USER-SERVICES-RO";

    //! RBAC System Permission: \c "CALL-SYSTEM-SERVICES-RO"
    /** this permission allows the caller to call system service methods without the write flag set
    */
    public static final String QR_CALL_SYSTEM_SERVICES_RO = "CALL-SYSTEM-SERVICES-RO";

    //! RBAC System Permission: \c "CALL-USER-SERVICES-RW"
    /** this permission allows the caller to call user service methods with write flag set
    */
    public static final String QR_CALL_USER_SERVICES_RW = "CALL-USER-SERVICES-RW";

    //! RBAC System Permission: \c "CALL-SYSTEM-SERVICES-RW"
    /** this permission allows the caller to call system service methods with write flag set
    */
    public static final String QR_CALL_SYSTEM_SERVICES_RW = "CALL-SYSTEM-SERVICES-RW";

    //! RBAC System Permissions: \c "SET-SERVICE-CONFIG"
    /** this permission allows the caller to change service configuration item values

        @since Qorus 4.0
    */
    public static final String QR_SET_SERVICE_CONFIG = "SET-SERVICE-CONFIG";

    //! RBAC System Permission: \c "USER-CONTROL"
    /** this permission allows the caller to manipulate RBAC information, including other users

        Includes the following:
        - @ref OMQ.QR_RELOAD_RBAC
        - @ref OMQ.QR_ADD_USER
        - @ref OMQ.QR_MODIFY_USER
        - @ref OMQ.QR_DELETE_USER
        - @ref OMQ.QR_ADD_PERMISSION
        - @ref OMQ.QR_MODIFY_PERMISSION
        - @ref OMQ.QR_DELETE_PERMISSION
        - @ref OMQ.QR_ADD_ROLE
        - @ref OMQ.QR_MODIFY_ROLE
        - @ref OMQ.QR_DELETE_ROLE

        @note Any user with this permission can add (or remove) permissions and groups to (or from) any user, so assign with care
        @see @ref OMQ.QR_GROUP_CONTROL
    */
    public static final String QR_USER_CONTROL = "USER-CONTROL";

    //! RBAC System Permission: \c "RELOAD-RBAC"
    /** This permission allows the caller to reload RBAC information from the database
    */
    public static final String QR_RELOAD_RBAC = "RELOAD-RBAC";

    //! RBAC System Permission: \c "ADD-USER"
    /** This permission allows the caller to add a user
    */
    public static final String QR_ADD_USER = "ADD-USER";

    //! RBAC System Permission: \c "MODIFY-USER"
    /** This permission allows the caller to modify a user
    */
    public static final String QR_MODIFY_USER = "MODIFY-USER";

    //! RBAC System Permission: \c "DELETE-USER"
    /** This permission allows the caller to delete a user
    */
    public static final String QR_DELETE_USER = "DELETE-USER";

    //! RBAC System Permission: \c "ADD-PERMISSION"
    /** This permission allows the caller to add a user permission
    */
    public static final String QR_ADD_PERMISSION = "ADD-PERMISSION";

    //! RBAC System Permission: \c "MODIFY-PERMISSION"
    /** This permission allows the caller to modify a user permission
    */
    public static final String QR_MODIFY_PERMISSION = "MODIFY-PERMISSION";

    //! RBAC System Permission: \c "DELETE-PERMISSION"
    /** This permission allows the caller to delete a user permission
    */
    public static final String QR_DELETE_PERMISSION = "DELETE-PERMISSION";

    //! RBAC System Permission: \c "ADD-ROLE"
    /** This permission allows the caller to add a role
    */
    public static final String QR_ADD_ROLE = "ADD-ROLE";

    //! RBAC System Permission: \c "MODIFY-ROLE"
    /** This permission allows the caller to modify a role
    */
    public static final String QR_MODIFY_ROLE = "MODIFY-ROLE";

    //! RBAC System Permission: \c "DELETE-ROLE"
    /** This permission allows the caller to delete a role
    */
    public static final String QR_DELETE_ROLE = "DELETE-ROLE";

    //! RBAC System Permission: \c "OPTION-CONTROL"
    /** this permission allows the caller to change system options
    */
    public static final String QR_OPTION_CONTROL = "OPTION-CONTROL";

    //! RBAC System Permission: \c "LOGGER-CONTROL"
    /** this permission allows the caller to manipulate RBAC information, including other users

        Includes the following:
        - @ref OMQ::QR_ROTATE_LOG_FILES
        - @ref OMQ::QR_MODIFY_LOGGER
        - @ref OMQ::QR_DELETE_LOGGER
        - @ref OMQ::QR_CREATE_LOGGER

        @note Any user with this permission can add (or remove) permissions and groups to (or from) any user, so assign with care
        @see @ref OMQ::QR_GROUP_CONTROL
    */
    public static final String QR_LOGGER_CONTROL = "LOGGER-CONTROL";

    //! RBAC System Permission: \c "ROTATE-LOG-FILES"
    /** this permission allows the user to rotate log files (call omq.system.rotate-log-files())
    */
    public static final String QR_ROTATE_LOG_FILES = "ROTATE-LOG-FILES";

    //! RBAC System Permission: \c "MODIFY-LOGGER"
    /** this permission allows the user to modify loggers and appenders
    */
    public static final String QR_MODIFY_LOGGER = "MODIFY-LOGGER";

    //! RBAC System Permission: \c "DELETE-LOGGER"
    /** this permission allows the user to delete loggers and appenders
    */
    public static final String QR_DELETE_LOGGER = "DELETE-LOGGER";

    //! RBAC System Permission: \c "CREATE-LOGGER"
    /** this permission allows the user to create loggers and appenders
    */
    public static final String QR_CREATE_LOGGER = "CREATE-LOGGER";

    //! RBAC System Permission: \c "DATASOURCE-CONTROL"
    /** this permission allows the user to manage the server-side @ref dsconn and to use functionality that sends datasource passwords

        Includes the following:
        - @ref OMQ.QR_READ_DATASOURCE
        - @ref OMQ.QR_ADD_DATASOURCE
        - @ref OMQ.QR_SELECT_DATASOURCE
        - @ref OMQ.QR_MODIFY_DATASOURCE
        - @ref OMQ.QR_RESET_DATASOURCE
        - @ref OMQ.QR_DELETE_DATASOURCE
        - @ref OMQ.QR_RELOAD_DATASOURCE
        - @ref OMQ.QR_FLUSH_DATASOURCE
        - @ref OMQ.QR_SQLUTIL_READ
        - @ref OMQ.QR_SQLUTIL_WRITE

        @since Qorus 2.5.0
    */
    public static final String QR_DATASOURCE_CONTROL = "DATASOURCE-CONTROL";

    //! RBAC System Permission: \c "READ-DATASOURCE"
    /** Allows reading datasource passwords

        @since Qorus 3.0.0
    */
    public static final String QR_READ_DATASOURCE = "READ-DATASOURCE";

    //! RBAC System Permission: \c "ADD-DATASOURCE"
    /** Allows adding new datasources

        @since Qorus 3.0.0
    */
    public static final String QR_ADD_DATASOURCE = "ADD-DATASOURCE";

    //! RBAC System Permission: \c "SELECT-DATASOURCE"
    /** Allows executing select statements over the REST API on a datasource

        @since Qorus 3.0.0
    */
    public static final String QR_SELECT_DATASOURCE = "SELECT-DATASOURCE";

    //! RBAC System Permission: \c "MODIFY-DATASOURCE"
    /** Allows adding and modifying existing datasources and flushing the configuration to a file

        @since Qorus 3.0.0
    */
    public static final String QR_MODIFY_DATASOURCE = "MODIFY-DATASOURCE";

    //! RBAC System Permission: \c "RESET-DATASOURCE"
    /** Allows resetting existing datasources

        @since Qorus 3.0.0
    */
    public static final String QR_RESET_DATASOURCE= "RESET-DATASOURCE";

    //! RBAC System Permission: \c "DELETE-DATASOURCE"
    /** Allows deleting datasources

        @since Qorus 3.0.0
    */
    public static final String QR_DELETE_DATASOURCE = "DELETE-DATASOURCE";

    //! RBAC System Permission: \c "RELOAD-DATASOURCE"
    /** Allows the user to reload all datasources from the source file

        @since Qorus 3.0.0
    */
    public static final String QR_RELOAD_DATASOURCE = "RELOAD-DATASOURCE";

    //! RBAC System Permission: \c "FLUSH-DATASOURCE"
    /** Allows the user to flush all cached datasource information to the configuration file

        @since Qorus 3.0.0
    */
    public static final String QR_FLUSH_DATASOURCE = "FLUSH-DATASOURCE";

    //! RBAC System Permission: \c "SQLUTIL-READ"
    /** Allows the user to execute remote read operations on the sqlutil service

        @since Qorus 3.0.2
    */
    public static final String QR_SQLUTIL_READ = "SQLUTIL-READ";

    //! RBAC System Permission: \c "SQLUTIL-WRITE"
    /** Allows the user to execute remote write operations on the sqlutil service

        @since Qorus 3.0.2
    */
    public static final String QR_SQLUTIL_WRITE = "SQLUTIL-WRITE";

    //! RBAC System Permission: \c "GROUP-CONTROL"
    /** this permission allows the user to manipulate group definitions and to enable/disable workflow/service groups

        Includes the following:
        - @ref OMQ.QR_ADD_GROUP
        - @ref OMQ.QR_MODIFY_GROUP
        - @ref OMQ.QR_DELETE_GROUP
        - @ref OMQ.QR_MODIFY_GROUP_STATUS

        @note Any user with this permission can change the definition of any group and enable/disable any group, so assign with care

        @see @ref OMQ.QR_USER_CONTROL

        @since Qorus 2.6.0
    */
    public static final String QR_GROUP_CONTROL = "GROUP-CONTROL";

    //! RBAC System Permission: \c "ADD-GROUP"
    /** This permission allows the caller to add interface groups
    */
    public static final String QR_ADD_GROUP = "ADD-GROUP";

    //! RBAC System Permission: \c "MODIFY-GROUP"
    /** This permission allows the caller to modify interface groups

        Includes the following:
        - @ref OMQ.QR_MODIFY_GROUP_STATUS
    */
    public static final String QR_MODIFY_GROUP = "MODIFY-GROUP";

    //! RBAC System Permission: \c "DELETE-GROUP"
    /** This permission allows the caller to delete interface groups
    */
    public static final String QR_DELETE_GROUP = "DELETE-GROUP";

    //! RBAC System Permission: \c "MODIFY-GROUP-STATUS"
    /** This permission allows the caller to modify interface group statuses (ie enable/disable interface groups)
    */
    public static final String QR_MODIFY_GROUP_STATUS = "MODIFY-GROUP-STATUS";

    //! RBAC System Permission: \c "SERVER-CONTROL"
    /** this permission allows the user to start or stop HTTP listeners (call omq.system.stop-listener(), omq.system.stop-listener-id(), omq.system.start-listeners()) and manipulate system properties

        Includes the following:
        - @ref OMQ.QR_SET_PROPERTY
        - @ref OMQ.QR_DELETE_PROPERTY
        - @ref OMQ.QR_RELOAD_PROPERTIES
        - @ref OMQ.QR_START_LISTENER
        - @ref OMQ.QR_STOP_LISTENER

        @since Qorus 2.6.0
    */
    public static final String QR_SERVER_CONTROL = "SERVER-CONTROL";

    //! RBAC System Permission: \c "SET-PROPERTY"
    /** allows the user to create or modify system properties

        @since Qorus 3.0.0
    */
    public static final String QR_SET_PROPERTY = "SET-PROPERTY";

    //! RBAC System Permission: \c "DELETE-PROPERTY"
    /** allows the user to delete system properties

        @since Qorus 3.0.0
    */
    public static final String QR_DELETE_PROPERTY = "DELETE-PROPERTY";

    //! RBAC System Permission: \c "RELOAD-PROPERTIES"
    /** allows the user to reload system properties from the database

        @since Qorus 3.0.0
    */
    public static final String QR_RELOAD_PROPERTIES = "RELOAD-PROPERTIES";

    //! RBAC System Permission: \c "START-LISTENER"
    /** allows the user to start HTTP listeners

        @since Qorus 3.0.0
    */
    public static final String QR_START_LISTENER = "START-LISTENER";

    //! RBAC System Permission: \c "STOP-LISTENER"
    /** allows the user to start HTTP listeners

        @since Qorus 3.0.0
    */
    public static final String QR_STOP_LISTENER = "STOP-LISTENER";

    //! RBAC System Permission: \c "JOB-CONTROL"
    /** this permission allows the user to update the status of jobs

        Includes the following:
        - @ref OMQ.QR_RUN_JOB
        - @ref OMQ.QR_MODIFY_JOB_STATUS
        - @ref OMQ.QR_MODIFY_JOB_EXPIRY
        - @ref OMQ.QR_RESCHEDULE_JOB
        - @ref OMQ.QR_RESET_JOB
        - @ref OMQ.QR_SET_JOB_OPTIONS
        - @ref OMQ.QR_SET_JOB_CONFIG

        @since Qorus 2.6.1
    */
    public static final String QR_JOB_CONTROL = "JOB-CONTROL";

    //! RBAC System Permission: \c "RUN-JOB"
    /** This permission allows the caller to run jobs
    */
    public static final String QR_RUN_JOB = "RUN-JOB";

    //! RBAC System Permission: \c "MODIFY-JOB-STATUS"
    /** This permission allows the caller to modify job statuses
    */
    public static final String QR_MODIFY_JOB_STATUS = "MODIFY-JOB-STATUS";

    //! RBAC System Permission: \c "MODIFY-JOB-EXPIRY"
    /** This permission allows the caller to modify job expiry dates
    */
    public static final String QR_MODIFY_JOB_EXPIRY = "MODIFY-JOB-EXPIRY";

    //! RBAC System Permission: \c "RESCHEDULE-JOB"
    /** This permission allows the caller to reschedule jobs
    */
    public static final String QR_RESCHEDULE_JOB = "RESCHEDULE-JOB";

    //! RBAC System Permission: \c "RESET-JOB"
    /** This permission allows the caller to reset jobs
    */
    public static final String QR_RESET_JOB = "RESET-JOB";

    //! RBAC System Permission: \c "SET-JOB-OPTIONS"
    /** This permission allows the caller to set job options
    */
    public static final String QR_SET_JOB_OPTIONS = "SET-JOB-OPTIONS";

    //! RBAC System Permissions: \c "SET-JOB-CONFIG"
    /** this permission allows the caller to change job configuration item values

        @since Qorus 4.0
    */
    public static final String QR_SET_JOB_CONFIG = "SET-JOB-CONFIG";

    //! RBAC System Permission: \c "SCHEMA-CONTROL"
    /** this permission allows the user to manage system database schema
        @since Qorus 2.6.3
    */
    public static final String QR_SCHEMA_CONTROL = "SCHEMA-CONTROL";

    //! RBAC System Permission: \c "USER-CONNECTION-CONTROL"
    /** this permission allows the user to manage user connections

        Includes the following:
        - @ref OMQ.QR_READ_USER_CONNECTION
        - @ref OMQ.QR_RELOAD_USER_CONNECTION
        - @ref OMQ.QR_ADD_USER_CONNECTION
        - @ref OMQ.QR_MODIFY_USER_CONNECTION
        - @ref OMQ.QR_DELETE_USER_CONNECTION

        @since Qorus 3.0.0
    */
    public static final String QR_USER_CONNECTION_CONTROL = "USER-CONNECTION-CONTROL";

    //! RBAC System Permission: \c "READ-USER-CONNECTION"
    /** this permission allows the user to read user connections

        @since Qorus 3.0.0
    */
    public static final String QR_READ_USER_CONNECTION = "READ-USER-CONNECTION";

    //! RBAC System Permission: \c "RELOAD-USER-CONNECTION"
    /** this permission allows the user to reload user connections

        @since Qorus 3.0.0
    */
    public static final String QR_RELOAD_USER_CONNECTION = "RELOAD-USER-CONNECTION";

    //! RBAC System Permission: \c "ADD-USER-CONNECTION"
    /** this permission allows the user to add user connections

        @since Qorus 3.0.0
    */
    public static final String QR_ADD_USER_CONNECTION = "ADD-USER-CONNECTION";

    //! RBAC System Permission: \c "MODIFY-USER-CONNECTION"
    /** this permission allows the user to modify user connections

        @since Qorus 3.0.0
    */
    public static final String QR_MODIFY_USER_CONNECTION = "MODIFY-USER-CONNECTION";

    //! RBAC System Permission: \c "DELETE-USER-CONNECTION"
    /** this permission allows the user to delete user connections

        @since Qorus 3.0.0
    */
    public static final String QR_DELETE_USER_CONNECTION = "DELETE-USER-CONNECTION";

    //! RBAC System Permission: \c "SERVER-CONNECTION-CONTROL"
    /** this permission allows the user to control Qorus <-> Qorus server connections
        Includes the following:
        - @ref OMQ.QR_READ_SERVER_CONNECTION
        - @ref OMQ.QR_RELOAD_SERVER_CONNECTION

        @since Qorus 3.0.0
    */
    public static final String QR_SERVER_CONNECTION_CONTROL = "SERVER-CONNECTION-CONTROL";

    //! RBAC System Permission: \c "RELOAD-SERVER-CONNECTION"
    /** this permission allows the user to reload Qorus <-> Qorus server connections
        @since Qorus 3.0.0
    */
    public static final String QR_RELOAD_SERVER_CONNECTION = "RELOAD-SERVER-CONNECTION";

    //! RBAC System Permission: \c "READ-SERVER-CONNECTION"
    /** this permission allows the user to read Qorus <-> Qorus server connection information
        @since Qorus 3.0.0
    */
    public static final String QR_READ_SERVER_CONNECTION = "READ-SERVER-CONNECTION";

    //! RBAC System Permission: \c "ADD-SERVER-CONNECTION"
    /** this permission allows the user to add Qorus <-> Qorus server connection information
        @since Qorus 4.0.0
     */
    public static final String QR_ADD_SERVER_CONNECTION = "ADD-SERVER-CONNECTION";

    //! RBAC System Permission: \c "MODIFY-SERVER-CONNECTION"
    /** this permission allows the user to modify Qorus <-> Qorus server connection information
        @since Qorus 4.0.0
     */
    public static final String QR_MODIFY_SERVER_CONNECTION = "MODIFY-SERVER-CONNECTION";

    //! RBAC System Permission: \c "DELETE-SERVER-CONNECTION"
    /** this permission allows the user to delete Qorus <-> Qorus server connection information
        @since Qorus 4.0.0
     */
    public static final String QR_DELETE_SERVER_CONNECTION = "DELETE-SERVER-CONNECTION";

    //! RBAC System Permission: \c "FILESYSTEM-CONTROL"
    /** this permission allows the user to read and write to the filesystem
        @since Qorus 3.0.2
    */
    public static final String QR_FILESYSTEM_CONTROL = "FILESYSTEM-CONTROL";

    //! RBAC System Permission: \c "FILESYSTEM-READ"
    /** this permission allows the user to read from the filesystem
        @since Qorus 3.0.2
    */
    public static final String QR_FILESYSTEM_READ = "FILESYSTEM-READ";

    //! RBAC System Permission: \c "FILESYSTEM-WRITE"
    /** this permission allows the user to write to the filesystem
        @since Qorus 3.0.2
    */
    public static final String QR_FILESYSTEM_WRITE = "FILESYSTEM-WRITE";

    //! RBAC System Permission: \c "MAPPER-CONTROL"
    /** this permission allows the user to control data mapper objects
        Includes the following:
        - @ref OMQ.QR_RELOAD_MAPPER
        - @ref OMQ.QR_MODIFY_MAPPER

        @since Qorus 3.1.0
    */
    public static final String QR_MAPPER_CONTROL = "MAPPER-CONTROL";

    //! RBAC System Permission: \c "RELOAD-MAPPER"
    /** this permission allows the user to reload data mappers

        @since Qorus 3.1.0
    */
    public static final String QR_RELOAD_MAPPER = "RELOAD-MAPPER";

    //! RBAC System Permission: \c "MODIFY-MAPPER"
    /** this permission allows the user to modify existing data mappers

        @since Qorus 3.1.0
    */
    public static final String QR_MODIFY_MAPPER = "MODIFY-MAPPER";

    //! RBAC System Permission: \c "VALUE-MAP-CONTROL"
    /** this permission allows the user to control value maps
        Includes the following:
        - @ref OMQ.QR_RELOAD_VALUE_MAP
        - @ref OMQ.QR_MODIFY_VALUE_MAP

        @since Qorus 3.1.0
    */
    public static final String QR_VALUE_MAP_CONTROL = "VALUE-MAP-CONTROL";

    //! RBAC System Permission: \c "RELOAD-VALUE-MAP"
    /** this permission allows the user to reload value maps

        @since Qorus 3.1.0
    */
    public static final String QR_RELOAD_VALUE_MAP = "RELOAD-VALUE-MAP";

    //! RBAC System Permission: \c "MODIFY-VALUE-MAP"
    /** this permission allows the user to modify existing value maps

        @since Qorus 3.1.0
    */
    public static final String QR_MODIFY_VALUE_MAP = "MODIFY-VALUE-MAP";

    //! RBAC System Permission: \c "CREATE-SLA"
    /** this permission allows the user to create @ref sla_tracking "SLAs"

        @since Qorus 3.1.1
    */
    public static final String QR_CREATE_SLA = "CREATE-SLA";

    //! RBAC System Permission: \c "DELETE-SLA"
    /** this permission allows the user to delete @ref sla_tracking "SLAs"

        @since Qorus 3.1.1
    */
    public static final String QR_DELETE_SLA = "DELETE-SLA";

    //! RBAC System Permission: \c "MODIFY-SLA"
    /** this permission allows the user to modify @ref sla_tracking "SLAs"

        @since Qorus 3.1.1
    */
    public static final String QR_MODIFY_SLA = "MODIFY-SLA";

    //! RBAC System Permission: \c "SLA-CONTROL"
    /** this permission allows the user to create, delete, and modify @ref sla_tracking "SLAs"

        @since Qorus 3.1.1
    */
    public static final String QR_SLA_CONTROL = "SLA-CONTROL";

    //! RBAC System Permission: \c "DEBUG-CONTROL"
    /** this permission allows the user to debug the system

        @since Qorus 3.1.1
    */
    public static final String QR_DEBUG_CONTROL = "DEBUG-CONTROL";

    //! RBAC System Permission: \c "REMOTE-DEPLOYMENT"
    /** this permission allows the user to deploy to Qorus remotely

        @since Qorus 4.0
    */
    public static final String QR_REMOTE_DEPLOYMENT = "REMOTE-DEPLOYMENT";

    //! RBAC System Permission: \c "REMOTE-DELETE-INTERFACE"
    /** this permission allows the user to delete interfaces from Qorus remotely

        @since Qorus 4.0
    */
    public static final String QR_REMOTE_DELETE_INTERFACE = "REMOTE-DELETE-INTERFACE";

    //! RBAC System Permission: \c "REMOTE-RELEASE"
    /** this permission allows the user to release functionality Qorus remotely

        @since Qorus 4.0
    */
    public static final String QR_REMOTE_RELEASE = "REMOTE-RELEASE";

    //! RBAC System Permission: \c "KILL-PROCESS"
    /** this permission allows the user to kill remote Qorus processes

        @since Qorus 4.0
    */
    public static final String QR_KILL_PROCESS = "KILL-PROCESS";

    //! Data Provider System Permission: \c "DATA-PROVIDER-CONTROL"
    /** this permission allows the user to perform all actions with data providers
        Includes the following:
        - @ref OMQ::QR_DATA_PROVIDER_CREATE
        - @ref OMQ::QR_DATA_PROVIDER_READ
        - @ref OMQ::QR_DATA_PROVIDER_UPDATE
        - @ref OMQ::QR_DATA_PROVIDER_DELETE

        @since Qorus 4.1
    */
    public static final String QR_DATA_PROVIDER_CONTROL = "DATA-PROVIDER-CONTROL";

    //! Data Provider System Permission: \c "DATA-PROVIDER-CREATE"
    /** this permission allows the user to create records in data providers

        @since Qorus 4.1
    */
    public static final String QR_DATA_PROVIDER_CREATE = "DATA-PROVIDER-CREATE";

    //! Data Provider System Permission: \c "DATA-PROVIDER-READ"
    /** this permission allows the user to read data from data providers

        @since Qorus 4.1
    */
    public static final String QR_DATA_PROVIDER_READ = "DATA-PROVIDER-READ";

    //! Data Provider System Permission: \c "DATA-PROVIDER-UPDATE"
    /** this permission allows the user to update / upsert records in data providers

        @since Qorus 4.1
    */
    public static final String QR_DATA_PROVIDER_UPDATE = "DATA-PROVIDER-UPDATE";

    //! Data Provider System Permission: \c "DATA-PROVIDER-DELETE"
    /** this permission allows the user to update / upsert records in data providers

        @since Qorus 4.1
    */
    public static final String QR_DATA_PROVIDER_DELETE = "DATA-PROVIDER-DELETE";
    //@}

    /** @defgroup JavaEventClasses Java Qorus Event Classes
        These are the possible event class codes for application event processing.
        @see @ref OMQ.QE_MAP_CLASS for a hash that can be used to map event class codes to event class descriptions
        @see @ref OMQ.QE_RMAP_CLASS for a hash that can be used to map event class descriptions to event class codes
    */
    //@{
    //! Event Class Code for SYSTEM Events
    public static final int QE_CLASS_SYSTEM                = 101;
    //! Event Class Code for WORKFLOW Events
    public static final int QE_CLASS_WORKFLOW              = 102;
    //! Event Class Code for SERVICE Events
    public static final int QE_CLASS_SERVICE               = 103;
    //! Event Class Code for USER Events
    public static final int QE_CLASS_USER                  = 104;
    //! Event Class Code for JOB Events
    public static final int QE_CLASS_JOB                   = 105;
    //! Event Class Code for ALERT Events
    public static final int QE_CLASS_ALERT                 = 106;
    //! Event Class Code for GROUP Events
    public static final int QE_CLASS_GROUP                 = 107;
    //! Event Class Code for CONNECTION events
    public static final int QE_CLASS_CONNECTION            = 108;
    //! Event Class Code for PROCESS events
    /** @since Qorus 4.0 */
    public static final int QE_CLASS_PROCESS               = 109;
    //! Event Class Code for CLUSTER events
    /** @since Qorus 4.0 */
    public static final int QE_CLASS_CLUSTER               = 110;
    //! Event Class Code for LOGGER events
    /** @since Qorus 4.0 */
    public static final int QE_CLASS_LOGGER                = 111;
    //! Event Class Code for CONFIG ITEM events
    /** @since Qorus 4.0 */
    public static final int QE_CLASS_CONFIG_ITEM           = 112;
    //@}

    //! hash mapping event class codes to descriptive strings
    public static final Map<Integer, String> QE_MAP_CLASS = Collections.unmodifiableMap(new HashMap<Integer, String>() {
        {
            put(QE_CLASS_SYSTEM, "SYSTEM");
            put(QE_CLASS_WORKFLOW, "WORKFLOW");
            put(QE_CLASS_SERVICE, "SERVICE");
            put(QE_CLASS_USER, "USER");
            put(QE_CLASS_JOB, "JOB");
            put(QE_CLASS_ALERT, "ALERT");
            put(QE_CLASS_GROUP, "GROUP");
            put(QE_CLASS_CONNECTION, "CONNECTION");
            put(QE_CLASS_PROCESS, "PROCESS");
            put(QE_CLASS_CLUSTER, "CLUSTER");
            put(QE_CLASS_LOGGER, "LOGGER");
            put(QE_CLASS_CONFIG_ITEM, "CONFIG_ITEM");
        }
    });

    /** @defgroup JavaEventCodes Java Qorus Event Codes
        These are the possible event codes for application event processing.
        @see OMQ.QE_MAP_EVENT for a hash that can be used to map event codes to event descriptions
        @see OMQ.QE_RMAP_EVENT for a hash that can be used to map event descriptions to event codes
    */
    //@{
    //! Qorus Event Code: SYSTEM_STARTUP
    /** @see
        - @ref SYSTEM_STARTUP for a description of the event info hash
        - @ref OMQ.AE_SYSTEM_STARTUP
    */
    public static final int QEC_SYSTEM_STARTUP               = 1001;
    //! Qorus Event Code: SYSTEM_SHUTDOWN
    /** This event has no info hash

        @see
        - @ref SYSTEM_SHUTDOWN
        - @ref OMQ.AE_SYSTEM_SHUTDOWN
    */
    public static final int QEC_SYSTEM_SHUTDOWN              = 1002;
    //! Qorus Event Code: SYSTEM_ERROR
    /** @see @ref SYSTEM_ERROR
    */
    public static final int QEC_SYSTEM_ERROR                 = 1003;
    //! Qorus Event Code: SYSTEM_HEALTH_CHANGED
    /** @see @ref SYSTEM_HEALTH_CHANGED for a description of the event info hash
    */
    public static final int QEC_SYSTEM_HEALTH_CHANGED        = 1004;
    //! Qorus Event Code: SYSTEM_REMOTE_HEALTH_CHANGED
    /** @see @ref SYSTEM_REMOTE_HEALTH_CHANGED for a description of the event info hash
    */
    public static final int QEC_SYSTEM_REMOTE_HEALTH_CHANGED = 1005;

    //! Qorus Event Code: GROUP_STATUS_CHANGED
    /** @see @ref GROUP_STATUS_CHANGED for a description of the event info hash
    */
    public static final int QEC_GROUP_STATUS_CHANGED         = 1101;

    //! Qorus Event Code: WORKFLOW_START
    /** @see
        - @ref WORKFLOW_START for a description of the event info hash
        - @ref OMQ.AE_WORKFLOW_START
    */
    public static final int QEC_WORKFLOW_START               = 2001;
    //! Qorus Event Code: WORKFLOW_STOP
    /** @see
        - @ref WORKFLOW_STOP for a description of the event info hash
        - @ref OMQ.AE_WORKFLOW_STOP
    */
    public static final int QEC_WORKFLOW_STOP                = 2002;
    //! Qorus Event Code: WORKFLOW_CACHE_RESET
    /** @see @ref WORKFLOW_CACHE_RESET for a description of the event info hash
    */
    public static final int QEC_WORKFLOW_CACHE_RESET         = 2003;
    //! Qorus Event Code: WORKFLOW_DATA_SUBMITTED
    /** @see
        - @ref WORKFLOW_DATA_SUBMITTED for a description of the event info hash
        - @ref OMQ.AE_WORKFLOW_DATA_CREATED
    */
    public static final int QEC_WORKFLOW_DATA_SUBMITTED      = 2004;
    //! Qorus Event Code: WORKFLOW_DATA_ERROR
    /** @see @ref WORKFLOW_DATA_ERROR for a description of the event info hash
    */
    public static final int QEC_WORKFLOW_DATA_ERROR          = 2005;
    //! Qorus Event Code: WORKFLOW_DATA_RELEASED (workflow detach event)
    /** @see @ref WORKFLOW_DATA_RELEASED for a description of the event info hash
    */
    public static final int QEC_WORKFLOW_DATA_RELEASED       = 2006;
    //! Qorus Event Code: WORKFLOW_DATA_CACHED (workflow attach event)
    /** @see @ref WORKFLOW_DATA_CACHED for a description of the event info hash
    */
    public static final int QEC_WORKFLOW_DATA_CACHED         = 2007;
    //! Qorus Event Code: WORKFLOW_INFO_CHANGED
    /** @see @ref WORKFLOW_INFO_CHANGED for a description of the event info hash
    */
    public static final int QEC_WORKFLOW_INFO_CHANGED        = 2008;
    //! Qorus Event Code: WORKFLOW_STATUS_CHANGED
    /** @see
        - @ref WORKFLOW_STATUS_CHANGED for a description of the event info hash
        - @ref OMQ.AE_WORKFLOW_STATUS_CHANGE
    */
    public static final int QEC_WORKFLOW_STATUS_CHANGED      = 2009;
    //! Qorus Event Code:: WORKFLOW_STEP_PERFORMANCE
    /** @see @ref WORKFLOW_STEP_PERFORMANCE for a description of the event info hash

        @since Qorus 3.0.2
    */
    public static final int QEC_WORKFLOW_STEP_PERFORMANCE    = 2010;
    //! Qorus Event Code:: WORKFLOW_PERFORMANCE
    /** @see @ref WORKFLOW_PERFORMANCE for a description of the event info hash

        @since Qorus 3.0.2
    */
    public static final int QEC_WORKFLOW_PERFORMANCE         = 2011;
    //! Qorus Event Code: WORKFLOW_DATA_LOCKED
    /** @see @ref WORKFLOW_DATA_LOCKED for a description of the event info hash

        @since Qorus 3.0.2
    */
    public static final int QEC_WORKFLOW_DATA_LOCKED         = 2012;
    //! Qorus Event Code: WORKFLOW_DATA_UNLOCKED
    /** @see @ref WORKFLOW_DATA_UNLOCKED for a description of the event info hash

        @since Qorus 3.0.2
    */
    public static final int QEC_WORKFLOW_DATA_UNLOCKED       = 2013;
    //! Qorus Event Code: WORKFLOW_DATA_UPDATED (static or dynamic data changed)
    /** @see @ref WORKFLOW_DATA_UPDATED for a description of the event info hash

        @since Qorus 3.1.0
    */
    public static final int QEC_WORKFLOW_DATA_UPDATED        = 2014;
    //! Qorus Event Code: WORKFLOW_STATS_UPDATED
    /** @see @ref WORKFLOW_STATS_UPDATED for a description of the event info hash

        @since Qorus 4.0
    */
    public static final int QEC_WORKFLOW_STATS_UPDATED       = 2015;
    //! Qorus Event Code: WORKFLOW_RECOVERED
    /** @ref WORKFLOW_RECOVERED for a description of the event info hash

        @since Qorus 4.0
    */
    public static final int QEC_WORKFLOW_RECOVERED           = 2016;
    //! Qorus Event code: WORKFLOW_UPDATED
    /** @ref WORKFLOW_UPDATED for a description of the event info hash

        @since Qorus 4.0
    */
    public static final int QEC_WORKFLOW_UPDATED             = 2017;
    //! Qorus Event Code: WORKFLOW_STEP_DATA_UPDATED (step dynamic data changed)
    /** @see @ref WORKFLOW_STEP_DATA_UPDATED for a description of the event info hash

        @since Qorus 4.0.1
    */
    public static final int QEC_WORKFLOW_STEP_DATA_UPDATED   = 2018;

    //! Qorus Event Code: SERVICE_START
    /** @see
        - @ref SERVICE_START for a description of the event info hash
        - @ref OMQ.AE_SERVICE_START
    */
    public static final int QEC_SERVICE_START                = 3001;
    //! Qorus Event Code: SERVICE_STOP
    /** @see
        - @ref SERVICE_STOP for a description of the event info hash
        - @ref OMQ.AE_SERVICE_STOP
    */
    public static final int QEC_SERVICE_STOP                 = 3002;
    //! Qorus Event Code: SERVICE_ERROR
    /** @see @ref SERVICE_ERROR for a description of the event info hash
    */
    public static final int QEC_SERVICE_ERROR                = 3003;
    //! Qorus Event Code: SERVICE_AUTOSTART_CHANGE
    /** @see @ref SERVICE_AUTOSTART_CHANGE for a description of the event info hash
    */
    public static final int QEC_SERVICE_AUTOSTART_CHANGE     = 3004;
    //! Qorus Event Code:: SERVICE_METHOD_PERFORMANCE
    /** @see @ref SERVICE_METHOD_PERFORMANCE for a description of the event info hash

        @since Qorus 3.0.2
    */
    public static final int QEC_SERVICE_METHOD_PERFORMANCE   = 3005;
    //! Qorus Event code: SERVICE_UPDATED
    /** @ref SERVICE_UPDATED for a description of the event info hash

        @since Qorus 4.0
    */
    public static final int QEC_SERVICE_UPDATED              = 3006;

    //! Qorus Event Code: JOB_START
    /** @see
        - @ref JOB_START for a description of the event info hash
        - @ref OMQ.AE_JOB_START
    */
    public static final int QEC_JOB_START                    = 4001;
    //! Qorus Event Code: JOB_STOP
    /**  for a description of the event info hash@see
        - @ref JOB_STOP for a description of the event info hash
        - @ref OMQ.AE_JOB_STOP
    */
    public static final int QEC_JOB_STOP                     = 4002;
    //! Qorus Event Code: JOB_ERROR
    /** @see @ref JOB_ERROR for a description of the event info hash
    */
    public static final int QEC_JOB_ERROR                    = 4003;
    //! Qorus Event Code: JOB_INSTANCE_START
    /** @see
        - @ref JOB_INSTANCE_START for a description of the event info hash
        - @ref OMQ.AE_JOB_INSTANCE_START
    */
    public static final int QEC_JOB_INSTANCE_START           = 4004;
    //! Qorus Event Code: JOB_INSTANCE_STOP
    /** @see
        - @ref JOB_INSTANCE_STOP for a description of the event info hash
        - @ref OMQ.AE_JOB_INSTANCE_STOP
    */
    public static final int QEC_JOB_INSTANCE_STOP            = 4005;
    //! Qorus Event Code: JOB_RECOVERED
    /** @ref JOB_RECOVERED for a description of the event info hash

        @since Qorus 4.0
    */
    public static final int QEC_JOB_RECOVERED                = 4006;
    //! Qorus Event code: JOB_UPDATED
    /** @ref JOB_UPDATED for a description of the event info hash

        @since Qorus 4.0
    */
    public static final int QEC_JOB_UPDATED                  = 4007;

    //! Qorus Event code: CONFIG_ITEM_CHANGED
    /** @ref CONFIG_ITEM_CHANGED for a description of the event info hash

        @since Qorus 4.0
    */
    public static final int QEC_CONFIG_ITEM_CHANGED          = 4100;

    //! Qorus Event Code: ALERT_ONGOING_RAISED
    /** @see @ref ALERT_ONGOING_RAISED for a description of the event info hash
    */
    public static final int QEC_ALERT_ONGOING_RAISED         = 5006;
    //! Qorus Event Code: ALERT_ONGOING_CLEARED
    /** @see @ref ALERT_ONGOING_CLEARED for a description of the event info hash
    */
    public static final int QEC_ALERT_ONGOING_CLEARED        = 5007;
    //! Qorus Event Code: ALERT_TRANSIENT_RAISED
    /** @see @ref ALERT_TRANSIENT_RAISED for a description of the event info hash
    */
    public static final int QEC_ALERT_TRANSIENT_RAISED       = 5008;

    //! Qorus Event Code: CONNECTION_UP
    /** @see @ref CONNECTION_UP for a description of the event info hash
    */
    public static final int QEC_CONNECTION_UP                = 5101;
    //! Qorus Event Code: CONNECTION_DOWN
    /** @see @ref CONNECTION_DOWN for a description of the event info hash
    */
    public static final int QEC_CONNECTION_DOWN              = 5102;
    //! Qorus Event Code: CONNECTION_ENABLED_CHANGE
    /** Sent when is any connection enabled flag chnged
    */
    public static final int QEC_CONNECTION_ENABLED_CHANGE    = 5103;

    //! Qorus Event Code: CONNECTION_CREATED
    /** Sent when a connection is created by a user using the REST API

        @see @ref CONNECTION_CREATED for a description of the event info hash

        @since Qorus 4.0
    */
    public static final int QEC_CONNECTION_CREATED           = 5104;

    //! Qorus Event Code: CONNECTION_UPDATED
    /** Sent when is a connection updated by a user using the REST API

        @see @ref CONNECTION_UPDATED for a description of the event info hash

        @since Qorus 4.0
    */
    public static final int QEC_CONNECTION_UPDATED           = 5105;

    //! Qorus Event Code: CONNECTION_DELETED
    /** Sent when is a connection deleted by a user using the REST API

        @see @ref CONNECTION_DELETED for a description of the event info hash

        @since Qorus 4.0
    */
    public static final int QEC_CONNECTION_DELETED           = 5106;

    //! Qorus Event Code: CONNECTIONS_RELOADED
    /** Sent when connections are reloaded by a user using the REST API

        @see @ref CONNECTIONS_RELOADED for a description of the event info hash

        @since Qorus 4.0
    */
    public static final int QEC_CONNECTIONS_RELOADED         = 5107;

    //! Qorus Event Code: CONNECTION_DEBUG_DATA_CHANGE
    /** Sent when the debug data flag flag is changed for any connection

        @see @ref QEC_CONNECTION_DEBUG_DATA_CHANGE for a description of the event info hash

        @since Qorus 4.1
    */
    public static final int QEC_CONNECTION_DEBUG_DATA_CHANGE  = 5108;

    //! Qorus Event Code: LOGGER_CREATED
    /** Sent when a logger is created by a user using the REST API

        @see @ref LOGGER_CREATED for a description of the event info hash

        @since Qorus 4.0
    */
    public static final int QEC_LOGGER_CREATED         = 5200;

    //! Qorus Event Code: LOGGER_UPDATED
    /** Sent when a logger is updated by a user using the REST API

        @see @ref LOGGER_UPDATED for a description of the event info hash

        @since Qorus 4.0
    */
    public static final int QEC_LOGGER_UPDATED         = 5201;

    //! Qorus Event Code: LOGGER_DELETED
    /** Sent when a logger is deleted by a user using the REST API

        @see @ref LOGGER_DELETED for a description of the event info hash

        @since Qorus 4.0
    */
    public static final int QEC_LOGGER_DELETED         = 5202;

    //! Qorus Event Code: APPENDER_CREATED
    /** Sent when an appender is created by a user using the REST API

        @see @ref APPENDER_CREATED for a description of the event info hash

        @since Qorus 4.0
    */
    public static final int QEC_APPENDER_CREATED       = 5203;

    //! Qorus Event Code: APPENDER_DELETED
    /** Sent when an appender is deleted by a user using the REST API

        @see @ref APPENDER_DELETED for a description of the event info hash

        @since Qorus 4.0
    */
    public static final int QEC_APPENDER_DELETED       = 5204;

    //! Qorus Event Code: APPENDER_UPDATED
    /** Sent when an appender is updated by a user using the REST API

        @see @ref APPENDER_UPDATED for a description of the event info hash

        @since Qorus 4.0.3
    */
    public static final int QEC_APPENDER_UPDATED       = 5205;

    //! Qorus Event Code: PROCESS_STARTED
    /** @see @ref PROCESS_STARTED for a description of the event info hash

        @since Qorus 4.0
    */
    public static final int QEC_PROCESS_STARTED              = 6001;
    //! Qorus Event Code: PROCESS_STOPPED
    /** @see @ref PROCESS_STOPPED for a description of the event info hash

        @since Qorus 4.0
    */
    public static final int QEC_PROCESS_STOPPED              = 6002;
    //! Qorus Event Code: PROCESS_START_ERROR
    /** @see @ref PROCESS_START_ERROR for a description of the event info hash

        @since Qorus 4.0
    */
    public static final int QEC_PROCESS_START_ERROR          = 6003;
    //! Qorus Event Code: PROCESS_MEMORY_CHANGED
    /** @see @ref PROCESS_MEMORY_CHANGED for a description of the event info hash

        @since Qorus 4.0
    */
    public static final int QEC_PROCESS_MEMORY_CHANGED       = 6004;

    //! Qorus Event Code: NODE_INFO
    /** @see @ref NODE_INFO for a description of the event info hash

        @since Qorus 4.0
    */
    public static final int QEC_NODE_INFO                 = 7001;

    //! Qorus Event Code: USER_EVENT
    /** this is the generic event code used for all user events

        @see @ref USER_EVENT for a description of the event info hash
    */
    public static final int QEC_USER_EVENT                   = 9001;
    //@}

    //! hash mapping event codes to descriptive strings
    public static final Map<Integer, String> QE_MAP_EVENT = Collections.unmodifiableMap(new HashMap<Integer, String>() {
        {
            put(QEC_SYSTEM_STARTUP, "SYSTEM_STARTUP");
            put(QEC_SYSTEM_SHUTDOWN, "SYSTEM_SHUTDOWN");
            put(QEC_SYSTEM_ERROR, "SYSTEM_ERROR");
            put(QEC_SYSTEM_HEALTH_CHANGED, "SYSTEM_HEALTH_CHANGED");
            put(QEC_SYSTEM_REMOTE_HEALTH_CHANGED, "SYSTEM_REMOTE_HEALTH_CHANGED");

            put(QEC_GROUP_STATUS_CHANGED, "GROUP_STATUS_CHANGED");

            put(QEC_WORKFLOW_START, "WORKFLOW_START");
            put(QEC_WORKFLOW_STOP, "WORKFLOW_STOP");
            put(QEC_WORKFLOW_CACHE_RESET, "WORKFLOW_CACHE_RESET");
            put(QEC_WORKFLOW_DATA_SUBMITTED, "WORKFLOW_DATA_SUBMITTED");
            put(QEC_WORKFLOW_DATA_ERROR, "WORKFLOW_DATA_ERROR");
            put(QEC_WORKFLOW_DATA_RELEASED, "WORKFLOW_DATA_RELEASED");
            put(QEC_WORKFLOW_DATA_CACHED, "WORKFLOW_DATA_CACHED");
            put(QEC_WORKFLOW_INFO_CHANGED, "WORKFLOW_INFO_CHANGED");
            put(QEC_WORKFLOW_STATUS_CHANGED, "WORKFLOW_STATUS_CHANGED");
            put(QEC_WORKFLOW_PERFORMANCE, "WORKFLOW_PERFORMANCE");
            put(QEC_WORKFLOW_STEP_PERFORMANCE, "WORKFLOW_STEP_PERFORMANCE");
            put(QEC_WORKFLOW_DATA_LOCKED, "WORKFLOW_DATA_LOCKED");
            put(QEC_WORKFLOW_DATA_UNLOCKED, "WORKFLOW_DATA_UNLOCKED");
            put(QEC_WORKFLOW_DATA_UPDATED, "WORKFLOW_DATA_UPDATED");
            put(QEC_WORKFLOW_STATS_UPDATED, "WORKFLOW_STATS_UPDATED");
            put(QEC_WORKFLOW_RECOVERED, "WORKFLOW_RECOVERED");
            put(QEC_WORKFLOW_UPDATED, "QEC_WORKFLOW_UPDATED");
            put(QEC_WORKFLOW_STEP_DATA_UPDATED, "QEC_WORKFLOW_STEP_DATA_UPDATED");

            put(QEC_SERVICE_START, "SERVICE_START");
            put(QEC_SERVICE_STOP, "SERVICE_STOP");
            put(QEC_SERVICE_ERROR, "SERVICE_ERROR");
            put(QEC_SERVICE_AUTOSTART_CHANGE, "SERVICE_AUTOSTART_CHANGE");
            put(QEC_SERVICE_METHOD_PERFORMANCE, "SERVICE_METHOD_PERFORMANCE");
            put(QEC_SERVICE_UPDATED, "QEC_SERVICE_UPDATED");

            put(QEC_JOB_START, "JOB_START");
            put(QEC_JOB_STOP, "JOB_STOP");
            put(QEC_JOB_ERROR, "JOB_ERROR");
            put(QEC_JOB_INSTANCE_START, "JOB_INSTANCE_START");
            put(QEC_JOB_INSTANCE_STOP, "JOB_INSTANCE_STOP");
            put(QEC_JOB_RECOVERED, "JOB_RECOVERED");
            put(QEC_JOB_UPDATED, "QEC_JOB_UPDATED");

            put(QEC_CONFIG_ITEM_CHANGED, "CONFIG_ITEM_CHANGED");

            put(QEC_ALERT_ONGOING_RAISED, "ALERT_ONGOING_RAISED");
            put(QEC_ALERT_ONGOING_CLEARED, "ALERT_ONGOING_CLEARED");
            put(QEC_ALERT_TRANSIENT_RAISED, "ALERT_TRANSIENT_RAISED");

            put(QEC_CONNECTION_UP, "CONNECTION_UP");
            put(QEC_CONNECTION_DOWN, "CONNECTION_DOWN");
            put(QEC_CONNECTION_ENABLED_CHANGE, "CONNECTION_ENABLED_CHANGE");
            put(QEC_CONNECTION_CREATED, "CONNECTION_CREATED");
            put(QEC_CONNECTION_UPDATED, "CONNECTION_UPDATED");
            put(QEC_CONNECTION_DELETED, "CONNECTION_DELETED");
            put(QEC_CONNECTIONS_RELOADED,"CONNECTIONS_RELOADED");
            put(QEC_CONNECTION_DEBUG_DATA_CHANGE, "CONNECTION_DEBUG_DATA_CHANGE");

            put(QEC_LOGGER_CREATED, "LOGGER_CREATED");
            put(QEC_LOGGER_UPDATED, "LOGGER_UPDATED");
            put(QEC_LOGGER_DELETED, "LOGGER_DELETED");
            put(QEC_APPENDER_CREATED, "APPENDER_CREATED");
            put(QEC_APPENDER_DELETED, "APPENDER_DELETED");
            put(QEC_APPENDER_UPDATED, "APPENDER_UPDATED");

            put(QEC_PROCESS_STARTED, "PROCESS_STARTED");
            put(QEC_PROCESS_STOPPED, "PROCESS_STOPPED");
            put(QEC_PROCESS_START_ERROR, "PROCESS_START_ERROR");
            put(QEC_PROCESS_MEMORY_CHANGED, "PROCESS_MEMORY_CHANGED");

            put(QEC_NODE_INFO, "NODE_INFO");

            put(QEC_USER_EVENT, "USER_EVENT");
        }
    });

    /** @defgroup JavaQorusStartupCodes Java Qorus Startup Codes
        These are the possible values returned by the Qorus process when it starts up
    */
    //@{
    public static final int QSE_OK                     = 0;   //!< Qorus Startup Error Code: no error
    public static final int QSE_NO_INSTANCE_KEY        = 1;   //!< Qorus Startup Error Code: no instance key set
    public static final int QSE_INVALID_DB_MAX_THREADS = 2;   //!< Qorus Startup Error Code: invalid db-max-threads option
    public static final int QSE_DATASOURCE             = 3;   //!< Qorus Startup Error Code: can't open system datasources
    public static final int QSE_LOG_ERROR              = 4;   //!< Qorus Startup Error Code: error opening system log files
    public static final int QSE_RBAC_ERROR             = 5;   //!< Qorus Startup Error Code: error initializing RBAC framework
    public static final int QSE_EVENT_ERROR            = 6;   //!< Qorus Startup Error Code: error initializing event framework
    public static final int QSE_SESSION_ERROR          = 7;   //!< Qorus Startup Error Code: error opening or recovering application session
    public static final int QSE_COMMAND_LINE_ERROR     = 8;   //!< Qorus Startup Error Code: error in command-line options
    public static final int QSE_OPTION_ERROR           = 9;   //!< Qorus Startup Error Code: error setting options on startup
    public static final int QSE_VERSION_ONLY           = 10;  //!< Qorus Startup Error Code: command-line option requested version display and exit
    public static final int QSE_STARTUP_ERROR          = 99;  //!< Qorus Startup Error Code: other error starting server
    //@}

    //! default order priority
    public static final int DefaultOrderPriority = 500;

    /** @defgroup JavaJobStatusDescriptions Java Job Data Status Descriptions
        These are the possible descriptions for a job's status code.
        Note that descriptive status values are returned by almost all API functions even though
        @ref JavaSQLJobStatusCodes "abbreviated codes" are actually stored in the database.
        @see @ref JavaSQLJobStatusCodes for the corresponding value for each status description
        @see OMQ.JSMap for a hash that can be used to map from descriptive status codes to @ref JavaSQLJobStatusCodes
        @see OMQ.SQLJSMap for a hash that can be used to map from SQL status codes to @ref JavaJobStatusDescriptions
        @see OMQ.JS_ALL for a list of all valid Job statuses

        @since Qorus 2.6.1
    */
    //@{
    //! Job Status Text Description: \c COMPLETE
    /** The equivalent status code actually stored in the database is @ref OMQ.SQL_JS_Complete */
    public static final String JS_Complete   = "COMPLETE";
    //! Job Status Text Description: \c IN-PROGRESS
    /** The equivalent status code actually stored in the database is @ref OMQ.SQL_JS_InProgress */
    public static final String JS_InProgress = "IN-PROGRESS";
    //! Job Status Text Description: \c ERROR
    /** The equivalent status code actually stored in the database is @ref OMQ.SQL_JS_Error */
    public static final String JS_Error      = "ERROR";
    //! Job Status Text Description: \c CRASH
    /** The equivalent status code actually stored in the database is @ref OMQ.SQL_JS_Crash */
    public static final String JS_Crash      = "CRASH";
    //@}

    /** @defgroup JavaSQLJobStatusCodes Java Job Data Status Codes
        These are the possible values for a job's status; this is the actual value that is stored in the DB
        @see @ref JavaJobStatusDescriptions for the corresponding description for each status code
        @see OMQ.JSMap for a hash that can be used to map from descriptive status codes to @ref JavaSQLJobStatusCodes
        @see OMQ.SQLJSMap for a hash that can be used to map from SQL status codes to @ref JavaJobStatusDescriptions

        @since Qorus 2.6.1
    */
    //@{
    //! Job Status SQL Character Code: \c COMPLETE
    /** The equivalent descriptive status is @ref OMQ.JS_Complete */
    public static final String SQL_JS_Complete   = "C";
    //! Job Status SQL Character Code: \c IN-PROGRESS
    /** The equivalent descriptive status is @ref OMQ.JS_InProgress */
    public static final String SQL_JS_InProgress = "I";
    //! Job Status SQL Character Code: \c ERROR
    /** The equivalent descriptive status is @ref OMQ.JS_Error */
    public static final String SQL_JS_Error      = "E";
    //! Job Status SQL Character Code: \c CRASH
    /** The equivalent descriptive status is @ref OMQ.JS_Crash */
    public static final String SQL_JS_Crash      = "Z";
    //@}

    //! map of Job status descriptions to the character code
    public static final Map<String, String> JSMap = Collections.unmodifiableMap(new HashMap<String, String>() {
        {
            put("COMPLETE", "C");
            put("IN-PROGRESS", "I");
            put("ERROR", "E");
            put("CRASH", "Z");
        }
    });

    //! map of Job status character codes to the description
    public static final Map<String, String> SQLJSMap = Collections.unmodifiableMap(new HashMap<String, String>() {
        {
            put("C", "COMPLETE");
            put("I", "IN-PROGRESS");
            put("E", "ERROR");
            put("Z", "CRASH");
        }
    });

    //! @defgroup JavaAuditEventCodes Java Audit Event Codes
    /** These are the possible audit event codes for system auditing events.
    */
    //@{
    //! user event audit code
    /** this code is used when a user audit event is written to the \c AUDIT_EVENTS table
    */
    public static final int AE_USER_EVENT = 1;

    //! system startup audit code
    /** this code is used when a "system startup" audit event is written to the \c AUDIT_EVENTS table
        @see @ref OMQ.QEC_SYSTEM_STARTUP
    */
    public static final int AE_SYSTEM_STARTUP = 2;

    //! system shutdown audit code
    /** this code is used when a "system shutdown" audit event is written to the \c AUDIT_EVENTS table
        @see @ref OMQ.QEC_SYSTEM_SHUTDOWN
    */
    public static final int AE_SYSTEM_SHUTDOWN = 3;

    //! system recovery start audit code
    /** this code is used when a "system recovery start" audit event is written to the \c AUDIT_EVENTS table
    */
    public static final int AE_SYSTEM_RECOVERY_START = 4;

    //! system recovery complete audit code
    /** this code is used when a "system recovery complete" audit event is written to the \c AUDIT_EVENTS table
    */
    public static final int AE_SYSTEM_RECOVERY_COMPLETE = 5;

    //! workflow status change audit code
    /** this code is used when a "workflow status change" audit event is written to the \c AUDIT_EVENTS table
        @see @ref OMQ.QEC_WORKFLOW_STATUS_CHANGED
    */
    public static final int AE_WORKFLOW_STATUS_CHANGE = 6;

    //! workflow start audit code
    /** this code is used when a "workflow start" audit event is written to the \c AUDIT_EVENTS table
        @see @ref OMQ.QEC_WORKFLOW_START
    */
    public static final int AE_WORKFLOW_START = 7;

    //! workflow stop audit code
    /** this code is used when a "workflow stop" audit event is written to the \c AUDIT_EVENTS table
        @see @ref OMQ.QEC_WORKFLOW_STOP
    */
    public static final int AE_WORKFLOW_STOP = 8;

    //! service start audit code
    /** this code is used when a "service start" audit event is written to the \c AUDIT_EVENTS table
        @see @ref OMQ.QEC_SERVICE_START
    */
    public static final int AE_SERVICE_START = 9;

    //! service stop audit code
    /** this code is used when a "service stop" audit event is written to the \c AUDIT_EVENTS table
        @see @ref OMQ.QEC_SERVICE_STOP
    */
    public static final int AE_SERVICE_STOP = 10;

    //! job start audit code
    /** this code is used when a "job start" audit event is written to the \c AUDIT_EVENTS table
        @see @ref OMQ.QEC_JOB_START
    */
    public static final int AE_JOB_START = 11;

    //! job stop audit code
    /** this code is used when a "job stop" audit event is written to the \c AUDIT_EVENTS table
        @see @ref OMQ.QEC_JOB_STOP
    */
    public static final int AE_JOB_STOP = 12;

    //! job instance start audit code
    /** this code is used when a "job instance start" audit event is written to the \c AUDIT_EVENTS table
        @see @ref OMQ.QEC_JOB_INSTANCE_START
    */
    public static final int AE_JOB_INSTANCE_START = 13;

    //! job instance stop audit code
    /** this code is used when a "job instance stop" audit event is written to the \c AUDIT_EVENTS table
        @see @ref OMQ.QEC_JOB_INSTANCE_STOP
    */
    public static final int AE_JOB_INSTANCE_STOP = 14;

    //! api call audit code
    /** this code is used when a "api call" audit event is written to the \c AUDIT_EVENTS table
    */
    public static final int AE_API_CALL = 15;

    //! job recovery audit code
    /** this code is used when a "job recovery" audit event is written to the \c AUDIT_EVENTS table
    */
    public static final int AE_JOB_RECOVERY = 16;

    //! workflow order data created audit code
    /** this code is used when a workflow order is created and the "order created" audit event is written to the \c AUDIT_EVENTS table
    */
    public static final int AE_WORKFLOW_DATA_CREATED = 17;

    //! ongoing alert raised audit code
    /** this code is used when an ongoing alert is raised and the "alert ongoing raised" audit event is written to the \c AUDIT_EVENTS table

        @since Qorus 3.0.0
    */
    public static final int AE_ALERT_ONGOING_RAISED = 18;

    //! ongoing alert cleared audit code
    /** this code is used when an ongoing alert is cleared and the "alert ongoing cleared" audit event is written to the \c AUDIT_EVENTS table

        @since Qorus 3.0.0
    */
    public static final int AE_ALERT_ONGOING_CLEARED = 19;

    //! transient alert raised audit code
    /** this code is used when a transient alert is raised and the "alert transient raised" audit event is written to the \c AUDIT_EVENTS table

        @since Qorus 3.0.0
    */
    public static final int AE_ALERT_TRANSIENT_RAISED = 20;

    //! source file loaded into the system schema by @ref oload "oload"
    /** this code is used when any source file is loaded into the database by @ref oload "oload" and the "source file loaded" event is written to the \c AUDIT_EVENTS table

        @since Qorus 3.0.0
    */
    public static final int AE_SOURCE_FILE_LOADED = 21;

    //! group status changed audit code
    /** this code is used when an RBAC interface group's status changes and the "group status changed" event is writteo the the \c AUDIT_EVENTS table; corresponds to @ref OMQ.AE_GROUP_STATUS_CHANGED

        @since Qorus 3.0.0
    */
    public static final int AE_GROUP_STATUS_CHANGED = 22;
    //@}

    //! @defgroup JavaAuditEventStrings Java Audit Event Strings
    /** These are the possible audit event strings corresponding to the audit event codes for sytem auditing events
    */
    //@{
    //! user event audit code
    /** this code is used when a user audit event is written to the \c AUDIT_EVENTS table; corresponds to @ref OMQ.AE_USER_EVENT
    */
    public static final String AES_USER_EVENT = "USER-EVENT";

    //! system startup audit code
    /** this code is used when a "system startup" audit event is written to the \c AUDIT_EVENTS table; corresponds to @ref OMQ.AE_SYSTEM_STARTUP
    */
    public static final String AES_SYSTEM_STARTUP = "SYSTEM-STARTUP";

    //! system shutdown audit code
    /** this code is used when a "system shutdown" audit event is written to the \c AUDIT_EVENTS table; corresponds to @ref OMQ.AE_SYSTEM_SHUTDOWN
    */
    public static final String AES_SYSTEM_SHUTDOWN = "SYSTEM-SHUTDOWN";

    //! system recovery start audit code
    /** this code is used when a "system recovery start" audit event is written to the \c AUDIT_EVENTS table; corresponds to @ref OMQ.AE_SYSTEM_RECOVERY_START
    */
    public static final String AES_SYSTEM_RECOVERY_START = "SYSTEM-RECOVERY-START";

    //! system recovery complete audit code
    /** this code is used when a "system recovery complete" audit event is written to the \c AUDIT_EVENTS table; corresponds to @ref OMQ.AE_SYSTEM_RECOVERY_COMPLETE
    */
    public static final String AES_SYSTEM_RECOVERY_COMPLETE = "SYSTEM-RECOVERY-COMPLETE";

    //! workflow status change audit code
    /** this code is used when a "workflow status change" audit event is written to the \c AUDIT_EVENTS table; corresponds to @ref OMQ.AE_WORKFLOW_STATUS_CHANGE
    */
    public static final String AES_WORKFLOW_STATUS_CHANGE = "WORKFLOW-STATUS-CHANGE";

    //! workflow start audit code
    /** this code is used when a "workflow start" audit event is written to the \c AUDIT_EVENTS table; corresponds to @ref OMQ.AE_WORKFLOW_START
    */
    public static final String AES_WORKFLOW_START = "WORKFLOW-START";

    //! workflow stop audit code
    /** this code is used when a "workflow stop" audit event is written to the \c AUDIT_EVENTS table; corresponds to @ref OMQ.AE_WORKFLOW_STOP
    */
    public static final String AES_WORKFLOW_STOP = "WORKFLOW-STOP";

    //! service start audit code
    /** this code is used when a "service start" audit event is written to the \c AUDIT_EVENTS table; corresponds to @ref OMQ.AE_SERVICE_START
    */
    public static final String AES_SERVICE_START = "SERVICE-START";

    //! service stop audit code
    /** this code is used when a "service stop" audit event is written to the \c AUDIT_EVENTS table; corresponds to @ref OMQ.AE_SERVICE_STOP
    */
    public static final String AES_SERVICE_STOP = "SERVICE-STOP";

    //! job start audit code
    /** this code is used when a "job start" audit event is written to the \c AUDIT_EVENTS table; corresponds to @ref OMQ.AE_JOB_START
    */
    public static final String AES_JOB_START = "JOB-START";

    //! job stop audit code
    /** this code is used when a "job stop" audit event is written to the \c AUDIT_EVENTS table; corresponds to @ref OMQ.AE_JOB_STOP
    */
    public static final String AES_JOB_STOP = "JOB-STOP";

    //! job instance start audit code
    /** this code is used when a "job instance start" audit event is written to the \c AUDIT_EVENTS table; corresponds to @ref OMQ.AE_JOB_INSTANCE_START
    */
    public static final String AES_JOB_INSTANCE_START = "JOB-INSTANCE-STOP";

    //! job instance stop audit code
    /** this code is used when a "job instance stop" audit event is written to the \c AUDIT_EVENTS table; corresponds to @ref OMQ.AE_JOB_INSTANCE_STOP
    */
    public static final String AES_JOB_INSTANCE_STOP = "JOB-INSTANCE-START";

    //! api call audit code
    /** this code is used when a "api call" audit event is written to the \c AUDIT_EVENTS table; corresponds to @ref OMQ.AE_API_CALL
    */
    public static final String AES_API_CALL = "API-CALL";

    //! job recovery audit code
    /** this code is used when a "job recovery" audit event is written to the \c AUDIT_EVENTS table; corresponds to @ref OMQ.AE_JOB_RECOVERY
    */
    public static final String AES_JOB_RECOVERY = "JOB-RECOVERY";

    //! workflow order data created audit code
    /** this code is used when a workflow order is created and the "order created" audit event is written to the \c AUDIT_EVENTS table; corresponds to @ref OMQ.AE_WORKFLOW_DATA_CREATED
    */
    public static final String AES_WORKFLOW_DATA_CREATED = "WORKFLOW-DATA-CREATED";

    //! ongoing alert raised audit code
    /** this code is used when an ongoing alert is raised and the "alert ongoing raised" audit event is written to the \c AUDIT_EVENTS table; corresponds to @ref OMQ.AE_ALERT_ONGOING_RAISED

        @since Qorus 3.0.0
    */
    public static final String AES_ALERT_ONGOING_RAISED = "ALERT-ONGOING-RAISED";

    //! ongoing alert cleared audit code
    /** this code is used when an ongoing alert is cleared and the "alert ongoing cleared" audit event is written to the \c AUDIT_EVENTS table; corresponds to @ref OMQ.AE_ALERT_ONGOING_CLEARED

        @since Qorus 3.0.0
    */
    public static final String AES_ALERT_ONGOING_CLEARED = "ALERT-ONGOING-CLEARED";

    //! transient alert raised audit code
    /** this code is used when a transient alert is raised and the "alert transient raised" audit event is written to the \c AUDIT_EVENTS table; corresponds to @ref OMQ.AE_ALERT_TRANSIENT_RAISED

        @since Qorus 3.0.0
    */
    public static final String AES_ALERT_TRANSIENT_RAISED = "ALERT-TRANSIENT-RAISED";


    //! source file loaded into the system schema by oload audit code
    /** this code is used when any source file is loaded into the database by oload and the "source file loaded" event is written to the \c AUDIT_EVENTS table; corresponds to @ref OMQ.AE_SOURCE_FILE_LOADED

        @since Qorus 3.0.0
    */
    public static final String AES_SOURCE_FILE_LOADED = "SOURCE-FILE-LOADED";

    //! group status changed audit code
    /** this code is used when an RBAC interface group's status changes and the "group status changed" event is writteo the the \c AUDIT_EVENTS table; corresponds to @ref OMQ.AE_GROUP_STATUS_CHANGED

        @since Qorus 3.0.0
    */
    public static final String AES_GROUP_STATUS_CHANGED = "GROUP-STATUS-CHANGED";
    //@}

    //! map of audit event codes to descriptions @showinitializer
    public static final Map<Integer, String> AuditEventMap = Collections.unmodifiableMap(new HashMap<Integer, String>() {
        {
            put(AE_USER_EVENT, AES_USER_EVENT);
            put(AE_SYSTEM_STARTUP, AES_SYSTEM_STARTUP);
            put(AE_SYSTEM_SHUTDOWN, AES_SYSTEM_SHUTDOWN);
            put(AE_SYSTEM_RECOVERY_START, AES_SYSTEM_RECOVERY_START);
            put(AE_SYSTEM_RECOVERY_COMPLETE, AES_SYSTEM_RECOVERY_COMPLETE);
            put(AE_WORKFLOW_STATUS_CHANGE, AES_WORKFLOW_STATUS_CHANGE);
            put(AE_WORKFLOW_START, AES_WORKFLOW_START);
            put(AE_WORKFLOW_STOP, AES_WORKFLOW_STOP);
            put(AE_SERVICE_START, AES_SERVICE_START);
            put(AE_SERVICE_STOP, AES_SERVICE_STOP);
            put(AE_JOB_START, AES_JOB_START);
            put(AE_JOB_STOP, AES_JOB_STOP);
            put(AE_JOB_INSTANCE_START, AES_JOB_INSTANCE_START);
            put(AE_JOB_INSTANCE_STOP, AES_JOB_INSTANCE_STOP);
            put(AE_API_CALL, AES_API_CALL);
            put(AE_JOB_RECOVERY, AES_JOB_RECOVERY);
            put(AE_WORKFLOW_DATA_CREATED, AES_WORKFLOW_DATA_CREATED);
            put(AE_ALERT_ONGOING_RAISED, AES_ALERT_ONGOING_RAISED);
            put(AE_ALERT_ONGOING_CLEARED, AES_ALERT_ONGOING_CLEARED);
            put(AE_ALERT_TRANSIENT_RAISED, AES_ALERT_TRANSIENT_RAISED);
            put(AE_SOURCE_FILE_LOADED, AES_SOURCE_FILE_LOADED);
            put(AE_GROUP_STATUS_CHANGED, AES_GROUP_STATUS_CHANGED);
        }
    });

    //! map of audit event descriptions to codes @showinitializer
    public static final Map<String, Integer> AuditEventCodeMap = Collections.unmodifiableMap(new HashMap<String, Integer>() {
        {
            put(AES_USER_EVENT, AE_USER_EVENT);
            put(AES_SYSTEM_STARTUP, AE_SYSTEM_STARTUP);
            put(AES_SYSTEM_SHUTDOWN, AE_SYSTEM_SHUTDOWN);
            put(AES_SYSTEM_RECOVERY_START, AE_SYSTEM_RECOVERY_START);
            put(AES_SYSTEM_RECOVERY_COMPLETE, AE_SYSTEM_RECOVERY_COMPLETE);
            put(AES_WORKFLOW_STATUS_CHANGE, AE_WORKFLOW_STATUS_CHANGE);
            put(AES_WORKFLOW_START, AE_WORKFLOW_START);
            put(AES_WORKFLOW_STOP, AE_WORKFLOW_STOP);
            put(AES_SERVICE_START, AE_SERVICE_START);
            put(AES_SERVICE_STOP, AE_SERVICE_STOP);
            put(AES_JOB_START, AE_JOB_START);
            put(AES_JOB_STOP, AE_JOB_STOP);
            put(AES_JOB_INSTANCE_START, AE_JOB_INSTANCE_START);
            put(AES_JOB_INSTANCE_STOP, AE_JOB_INSTANCE_STOP);
            put(AES_API_CALL, AE_API_CALL);
            put(AES_JOB_RECOVERY, AE_JOB_RECOVERY);
            put(AES_WORKFLOW_DATA_CREATED, AE_WORKFLOW_DATA_CREATED);
            put(AES_ALERT_ONGOING_RAISED, AE_ALERT_ONGOING_RAISED);
            put(AES_ALERT_ONGOING_CLEARED, AE_ALERT_ONGOING_CLEARED);
            put(AES_ALERT_TRANSIENT_RAISED, AE_ALERT_TRANSIENT_RAISED);
            put(AES_SOURCE_FILE_LOADED, AE_SOURCE_FILE_LOADED);
            put(AES_GROUP_STATUS_CHANGED, AE_GROUP_STATUS_CHANGED);
        }
    });

    //! @defgroup JavaAuditOptions Java Audit Options
    /** These are the possible audit option codes for the system option @ref audit
    */
    //@{
    //! Audit option: system events
    /** audits the following events:
    - @ref OMQ.AE_SYSTEM_RECOVERY_START
    - @ref OMQ.AE_SYSTEM_RECOVERY_COMPLETE
    - @ref OMQ.AE_SYSTEM_STARTUP
    - @ref OMQ.AE_SYSTEM_SHUTDOWN
    */
    public static final String AO_SYSTEM = "system";

    //! Audit option: workflow events
    /** audits the following events:
    - @ref OMQ.AE_WORKFLOW_START
    - @ref OMQ.AE_WORKFLOW_STOP
    */
    public static final String AO_WORKFLOWS = "workflows";

    //! Audit option: workflow data events
    /** audits the following events:
    - @ref OMQ.AE_WORKFLOW_STATUS_CHANGE
    */
    public static final String AO_WORKFLOW_DATA = "workflow-data";

    //! Audit option: job events
    /** audits the following events:
    - @ref OMQ.AE_JOB_START
    - @ref OMQ.AE_JOB_STOP
    */
    public static final String AO_JOBS = "jobs";

    //! Audit option: job data events
    /** audits the following events:
    - @ref OMQ.AE_JOB_INSTANCE_START
    - @ref OMQ.AE_JOB_INSTANCE_STOP
    - @ref OMQ.AE_JOB_RECOVERY
    */
    public static final String AO_JOB_DATA = "job-data";

    //! Audit option: service events
    /** audits the following events:
    - @ref OMQ.AE_SERVICE_START
    - @ref OMQ.AE_SERVICE_STOP
    */
    public static final String AO_SERVICES = "services";

    //! Audit option: api write events
    /** audits the following events: @ref OMQ.AE_API_CALL for external network API calls that cause changes to be made
    */
    public static final String AO_API = "api";

    //! Audit option: user events
    /** audits the following events: @ref OMQ.AE_USER_EVENT
    */
    public static final String AO_USER_EVENTS = "user-events";

    //! Audit option: oload events
    /** audits the following event: @ref OMQ.AE_SOURCE_FILE_LOADED

        @since Qorus 3.0.0
    */
    public static final String AO_OLOAD_EVENTS = "oload";

    //! Audit option: alert events
    /** audits the following events: @ref OMQ.AE_ALERT_ONGOING_RAISED, @ref OMQ.AE_ALERT_ONGOING_CLEARED, @ref OMQ.AE_ALERT_TRANSIENT_RAISED

        @since Qorus 3.0.0
    */
    public static final String AO_ALERT_EVENTS = "alerts";

    //! Audit option: RBAC interface group events
    /** audits the following events: @ref OMQ.AE_GROUP_STATUS_CHANGED

        @since Qorus 3.0.0
    */
    public static final String AO_GROUP_EVENTS = "groups";
    //@}

    //! @defgroup JavaAuditOptionCodes Java Audit Option Codes
    /** Internal codes corresponding to each audit option
    */
    //@{
    //! Audit option code: system events
    public static final int AOC_SYSTEM = (1 << 0);

    //! Audit option code: workflow events
    public static final int AOC_WORKFLOWS = (1 << 1);

    //! Audit option code: workflow data events
    public static final int AOC_WORKFLOW_DATA = (1 << 2);

    //! Audit option code: job events
    public static final int AOC_JOBS = (1 << 3);

    //! Audit option code: job data events
    public static final int AOC_JOB_DATA = (1 << 4);

    //! Audit option code: service events
    public static final int AOC_SERVICES = (1 << 5);

    //! Audit option code: api write events
    public static final int AOC_API = (1 << 6);

    //! Audit option code: user events
    public static final int AOC_USER_EVENTS = (1 << 7);

    //! Audit option code: oload events
    /**
        @since Qorus 3.0.0
    */
    public static final int AOC_OLOAD_EVENTS = (1 << 8);

    //! Audit option code: alert events
    /**
        @since Qorus 3.0.0
    */
    public static final int AOC_ALERT_EVENTS = (1 << 9);

    //! Audit option code: RBAC interface group events
    /**
        @since Qorus 3.0.0
    */
    public static final int AOC_GROUP_EVENTS = (1 << 10);
    //@}

    //! mask of all audit options
    public static final int AuditMask = (AOC_SYSTEM|AOC_WORKFLOWS|AOC_WORKFLOW_DATA|AOC_JOBS|AOC_JOB_DATA|AOC_SERVICES|AOC_API|AOC_USER_EVENTS|AOC_OLOAD_EVENTS|AOC_ALERT_EVENTS|AOC_GROUP_EVENTS);

    //! map of audit options to audit codes
    public static final Map<String, Integer> AuditOptionMap = Collections.unmodifiableMap(new HashMap<String, Integer>() {
        {
            put(AO_SYSTEM, AOC_SYSTEM);
            put(AO_WORKFLOWS, AOC_WORKFLOWS);
            put(AO_WORKFLOW_DATA, AOC_WORKFLOW_DATA);
            put(AO_JOBS, AOC_JOBS);
            put(AO_JOB_DATA, AOC_JOB_DATA);
            put(AO_SERVICES, AOC_SERVICES);
            put(AO_API, AOC_API);
            put(AO_USER_EVENTS, AOC_USER_EVENTS);
            put(AO_OLOAD_EVENTS, AOC_OLOAD_EVENTS);
            put(AO_ALERT_EVENTS, AOC_ALERT_EVENTS);
            put(AO_GROUP_EVENTS, AOC_GROUP_EVENTS);
        }
    });

    //! map of audit codes to audit options
    public static final Map<Integer, String> AuditCodeMap = Collections.unmodifiableMap(new HashMap<Integer, String>() {
        {
            put(AOC_SYSTEM, AO_SYSTEM);
            put(AOC_WORKFLOWS, AO_WORKFLOWS);
            put(AOC_WORKFLOW_DATA, AO_WORKFLOW_DATA);
            put(AOC_JOBS, AO_JOBS);
            put(AOC_JOB_DATA, AO_JOB_DATA);
            put(AOC_SERVICES, AO_SERVICES);
            put(AOC_API, AO_API);
            put(AOC_USER_EVENTS, AO_USER_EVENTS);
            put(AOC_OLOAD_EVENTS, AO_OLOAD_EVENTS);
            put(AOC_ALERT_EVENTS, AO_ALERT_EVENTS);
            put(AOC_GROUP_EVENTS, AO_GROUP_EVENTS);
        }
    });
}