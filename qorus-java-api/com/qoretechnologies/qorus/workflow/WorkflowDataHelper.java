/** Qorus Java WorkflowDataHelper class
 *
 */
package com.qoretechnologies.qorus.workflow;

// java imports
import java.util.HashMap;

// jni module imports
import org.qore.jni.QoreObject;
import org.qore.jni.QoreObjectWrapper;

//! Java wrapper for the @ref OMQ::UserApi::Workflow::WorkflowDataHelper "WorkflowDataHelper" class in Qorus
/** This class is a helper class that allows @ref dynamicdata "workflow dynamic data" (DynamicDataHelper) and
    @ref tempdata "workflow temp data" (TempDataHelper) to be read and updated atomically; the write lock for
    the data is grabbed in the constructor and released in the destructor.

    The %Qore-language destructor is run at the end of the Java step execution, after the step returns to Qorus.
 */
public class WorkflowDataHelper extends QoreObjectWrapper {
    //! creates the object as a wrapper for the Qore object
    public WorkflowDataHelper(QoreObject obj) {
        super(obj);
    }

    //! returns the value of multiple keys in the data or the entire data structure depending on the argument
    /** depending on the concrete subclasss, this method is equivalent to one of the following function calls:
        - TempDataHelper: @ref WorkflowApi.getTempData()
        - DynamicDataHelper: @ref WorkflowApi.getDynamicData()
    */
    @SuppressWarnings("unchecked")
    public HashMap<String, Object> get(String... keys) throws Throwable {
        return (HashMap<String, Object>)obj.callMethod("get", (Object)keys);
    }

    //! returns the value of one key in the data or the entire data structure depending on the argument
    /** depending on the concrete subclasss, this method is equivalent to one of the following function calls:
        - TempDataHelper: @ref WorkflowApi.getTempData()
        - DynamicDataHelper: @ref WorkflowApi.getDynamicData()
    */
    public Object get(String key) throws Throwable {
        return obj.callMethod("get", key);
    }

    //! returns the entire data structure
    /** depending on the concrete subclasss, this method is equivalent to one of the following function calls:
        - TempDataHelper: @ref WorkflowApi.getTempData()
        - DynamicDataHelper: @ref WorkflowApi.getDynamicData()
    */
    @SuppressWarnings("unchecked")
    public HashMap<String, Object> get() throws Throwable {
        return (HashMap<String, Object>)obj.callMethod("get");
    }
}
