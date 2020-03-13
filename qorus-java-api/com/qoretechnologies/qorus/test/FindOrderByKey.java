/** Java wrapper for the Qorus FindOrderByKey Action class
 *
 */
package com.qoretechnologies.qorus.test;

// Java imports
import java.util.HashMap;

// Qore jni imports
import org.qore.jni.QoreJavaApi;

// Qore lang imports
import org.qore.lang.qunit.*;

// Qorus imports
import com.qoretechnologies.qorus.test.*;

//! Finds a workflow order using a key and value. Fails the test if there is more or less than 1 order.
/** @par Example:
    @code{.java}
Object order = exec(new FindOrderByKey("wf name", "1.0", "my_key", "value"));
// use order.getStaticData(), order.getInstanceId() etc.
    @endcode

    @par For finding orders on a remote Qorus instance:
    @code{.java}
Object order = exec(new FindOrderByKey("wf name", "1.0", "my_key", "value").on("qorus connection name"));
// use order.getStaticData(), order.getInstanceId() etc.
    @endcode
*/
public class FindOrderByKey extends Action {
    //! Creates the action from the arguments
    /**
        @param workflowName the name of the workflow
        @param workflowVersion the version of the workflow
        @param keyName the name of the key
        @param value the value of the key to find
    */
    public FindOrderByKey(String workflowName, String workflowVersion, String keyName, String value) throws Throwable {
        super(QoreJavaApi.newObjectSave("FindOrderByKey", workflowName, workflowVersion, keyName, value));
    }

    //! Changes the REST helper to be used to find the workflow order
    /**
        @param connectionName the name of a remote Qorus connection

        @return this for chaining
    */
    public FindOrderByKey on(String connectionName) throws Throwable {
        return (FindOrderByKey)obj.callMethod("on", connectionName);
    }

    //! Executes the action by calling info.getOrderInfoFromKey()
    /** @param t QorusInterfaceTest test object
    */
    public Object run(QorusInterfaceTest t) throws Throwable {
        return obj.callMethod("run", t);
    }

    //! Returns the workflow instance id
    /** @return the workflow instance id, if any was found, otherwise \c null
    */
    Integer getInstanceId() throws Throwable {
        return (Integer)obj.callMethod("getInstanceId");
    }

    //! Returns static data
    /** @return the static data, if any was found, otherwise \c null
    */
    @SuppressWarnings("unchecked")
    HashMap<String, Object> getStaticData() throws Throwable {
        return (HashMap<String, Object>)obj.callMethod("getStaticData");
    }
}
