/** Java wrapper for the Qorus ExecSynchronousOrder Action class
 *
 */
package com.qoretechnologies.qorus.test;

// Java imports
import java.util.Map;
import java.util.HashMap;

// Qore jni imports
import org.qore.jni.QoreJavaApi;

// Qore lang imports
import org.qore.lang.qunit.*;

// Qorus imports
import com.qoretechnologies.qorus.test.*;

//! This class will create and execute a synchronous workflow order
public class ExecSynchronousOrder extends Action {
    //! creates the action with the order details
    /** @param orderdata order details with the following keys:
        - \c "name": (required) the name of the workflow order to create and execute synchronously
        - \c "staticdata": (optional hash) the static data for the order; either this key or \c "external_order_instanceid" is required
        - \c "external_order_instanceid: (optional string) the external order instance ID for the workflow data; either this key or \c "staticdata" is required
        - \c "dynamicdata": (optional hash) the initial dynamic data for the order
        - \c "orderkeys": (optional hash) a hash of order keys for the order
        - \c "priority": (optional int) the order priority (default @ref OMQ::DefaultOrderPriority) from 0 - 999; priority 0 is the highest; 999 is the lowest
        - \c "parent_workflow_instanceid": (optional int) a loosely-coupled workflow that will be marked as the parent of this workflow
        - \c "options": (hash) an optional hash of option names and values; if any options are not valid for the workflow, then an exception is raised and the synchronous workflow execution instance is not started
        @param expected_status the expected workflow order status after execution (see @ref StatusDescriptions for possible values)
        @param expected_dd the expected dynamic data after execution; only keys given in the hash will be compared
    */
    public ExecSynchronousOrder(Map<String, Object> orderdata, String expected_status, Map<String, Object> expected_dd)
        throws Throwable {
        super(QoreJavaApi.newObjectSave("ExecSynchronousOrder", orderdata, expected_status, expected_dd));
    }

    //! creates the action with the order details
    /** @param orderdata order details with the following keys:
        - \c "name": (required) the name of the workflow order to create and execute synchronously
        - \c "staticdata": (optional hash) the static data for the order; either this key or \c "external_order_instanceid" is required
        - \c "external_order_instanceid: (optional string) the external order instance ID for the workflow data; either this key or \c "staticdata" is required
        - \c "dynamicdata": (optional hash) the initial dynamic data for the order
        - \c "orderkeys": (optional hash) a hash of order keys for the order
        - \c "priority": (optional int) the order priority (default @ref OMQ::DefaultOrderPriority) from 0 - 999; priority 0 is the highest; 999 is the lowest
        - \c "parent_workflow_instanceid": (optional int) a loosely-coupled workflow that will be marked as the parent of this workflow
        - \c "options": (hash) an optional hash of option names and values; if any options are not valid for the workflow, then an exception is raised and the synchronous workflow execution instance is not started
        @param expected_status the expected workflow order status after execution (see @ref StatusDescriptions for possible values)
    */
    public ExecSynchronousOrder(Map<String, Object> orderdata, String expected_status) throws Throwable {
        super(QoreJavaApi.newObjectSave("ExecSynchronousOrder", orderdata, expected_status));
    }

    //! creates the action with the order details
    /** @param orderdata order details with the following keys:
        - \c "name": (required) the name of the workflow order to create and execute synchronously
        - \c "staticdata": (optional hash) the static data for the order; either this key or \c "external_order_instanceid" is required
        - \c "external_order_instanceid: (optional string) the external order instance ID for the workflow data; either this key or \c "staticdata" is required
        - \c "dynamicdata": (optional hash) the initial dynamic data for the order
        - \c "orderkeys": (optional hash) a hash of order keys for the order
        - \c "priority": (optional int) the order priority (default @ref OMQ::DefaultOrderPriority) from 0 - 999; priority 0 is the highest; 999 is the lowest
        - \c "parent_workflow_instanceid": (optional int) a loosely-coupled workflow that will be marked as the parent of this workflow
        - \c "options": (hash) an optional hash of option names and values; if any options are not valid for the workflow, then an exception is raised and the synchronous workflow execution instance is not started
    */
    public ExecSynchronousOrder(Map<String, Object> orderdata) throws Throwable {
        super(QoreJavaApi.newObjectSave("ExecSynchronousOrder", orderdata));
    }

    //! executes the workflow order synchronously
    /** @param t QorusInterfaceTest test object
    */
    public Object run(QorusInterfaceTest t) throws Throwable {
        return obj.callMethod("run", t);
    }

    //! returns the result of synchronous workflow execution
    @SuppressWarnings("unchecked")
    public HashMap<String, Object> result() throws Throwable {
        return (HashMap<String, Object>)obj.callMethod("result");
    }
}
