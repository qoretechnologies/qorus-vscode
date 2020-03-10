/** Java wrapper for the Qorus QorusWorkflowTest class
 *
 */
package com.qoretechnologies.qorus.test;

// jni module imports
import org.qore.jni.QoreJavaApi;
import org.qore.jni.QoreObject;

// qore lang imports
import org.qore.lang.qunit.Test;

// java imports
import java.time.ZonedDateTime;
import java.util.Map;
import java.util.HashMap;

// Qorus imports
import com.qoretechnologies.qorus.test.*;

//! base class for testing Qorus workflows
public class QorusWorkflowTest extends QorusInterfaceTest {
    //! creates the object from the arguments
    /** @param name the workflow name
        @param version the version of the workflow
    */
    public QorusWorkflowTest(String name, String version) throws Throwable {
        super(QoreJavaApi.newObjectSave("QorusInterfaceTest::QorusWorkflowTest", name, version));
    }

    //! returns the log file name for the current object
    public String getLogFileName() throws Throwable {
        return (String)obj.callMethod("getLogFileName");
    }

    //! tests whether the current interface is running in the current Qorus instance
    /** @par Example:
        @code{.java}
        boolean b = t.isInterfaceRunning();
        @endcode
    */
    public boolean isInterfaceRunning() throws Throwable {
        return (boolean)obj.callMethod("isInterfaceRunning");
    }

    //! checks if the interface can run
    public boolean canRun() throws Throwable {
        return (boolean)obj.callMethod("canRun");
    }

    //! finds the last workflow order instance created for this workflow
    public int getLastOrderId() throws Throwable {
        return (int)obj.callMethod("getLastOrderId");
    }

    //! creates an order instance and returns the workflow_instanceid
    /** @param staticdata the static data hash for the order
        @param create_opts other options to add to the order hash for the create order REST API, corresponding to the @ref OMQ::UserApi::create_order() API \a params parameter (ex: \a orderkeys for order keys, etc)

        @return the workflow_instanceid created
    */
    public int createOrder(Map<String, Object> staticdata, Map<String, Object> create_opts) throws Throwable {
        return (int)obj.callMethod("createOrder", staticdata, create_opts);
    }

    //! creates an order instance and returns the workflow_instanceid
    /** @param staticdata the static data hash for the order

        @return the workflow_instanceid created
    */
    public int createOrder(Map<String, Object> staticdata) throws Throwable {
        return (int)obj.callMethod("createOrder", staticdata);
    }

    //! creates and executes a synchronous workflow order and returns the hash data result
    /** @param orderdata a hash with the following keys:
        - \c staticdata: (hash) the static workflow order data (required)
        - \c dynamicdata: (hash) the initial dynamic data for the workflow (optional)
        - \c options: (hash) a hash of option names and values; if any options are not valid for the workflow, then an exception is raised and the workflow execution instance is not started (optional)
        - \c priority: the order priority (default @ref OMQ::DefaultOrderPriority), ignored while the order is processed synchronously; from 0 - 999; priority 0 is the highest; 999 is the
lowest
        - \c orderkeys: order keys for the order
        - \c external_order_instanceid: the optional external order instanceid for the order
        - \c parent_workflow_instanceid: a loosely-coupled workflow that will be marked as the parent of this workflow order

        @return a hash with the following keys:
        - \c workflow_instanceid: the workflow instance ID for the order created
        - \c status: the status of the workflow; see @ref StatusDescriptions for possible values
        - \c dynamicdata: the dynamic data of the workflow order instance
    */
    @SuppressWarnings("unchecked")
    public HashMap<String, Object> execSynchronous(Map<String, Object> orderdata) throws Throwable {
        return (HashMap<String, Object>)obj.callMethod("execSynchronous", orderdata);
    }

    //! returns a hash of workflow order instance information keyed by workflow_instanceid for all workflow orders in the hierarchy
    /** @param wfiid the workflow_instanceid of the workflow order to query
     */
    @SuppressWarnings("unchecked")
    public static HashMap<String, Object> hierarchyInfo(int wfiid) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("QorusWorkflowTest", "hierarchyInfo", wfiid);
    }

    //! returns the static data hash of the given workflow order
    /** @param wfiid the workflow_instanceid of the workflow order to query
     */
    @SuppressWarnings("unchecked")
    public static HashMap<String, Object> staticData(int wfiid) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("QorusWorkflowTest", "staticData", wfiid);
    }

    //! returns the dynamic data hash of the given workflow order or @ref nothing if no dynamic data exists for the workflow order
    /** @param wfiid the workflow_instanceid of the workflow order to query
     */
    @SuppressWarnings("unchecked")
    public static HashMap<String, Object> dynamicData(int wfiid) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("QorusWorkflowTest", "dynamicData", wfiid);
    }

    //! returns the order key hash for the given workflow order or @ref nothing if no order keys have been set for the workflow order
    /** @param wfiid the workflow_instanceid of the workflow order to query
     */
    @SuppressWarnings("unchecked")
    public static HashMap<String, Object> orderKeys(int wfiid) throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("QorusWorkflowTest", "orderKeys", wfiid);
    }
}
