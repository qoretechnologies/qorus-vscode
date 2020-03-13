/** Qorus Java DynamicDataHelper class
 *
 */
package com.qoretechnologies.qorus.workflow;

// java imports
import java.util.HashMap;
import java.util.UUID;

// jni module imports
import org.qore.jni.QoreObject;
import org.qore.jni.QoreJavaApi;

// qorus imports
import com.qoretechnologies.qorus.workflow.WorkflowDataHelper;

//! Java wrapper for the @ref OMQ::UserApi::Workflow::DynamicDataHelper "DynamicDataHelper" class in Qorus
/** This class is a helper class that allows @ref dynamicdata "workflow dynamic data" to be read and updated
    atomically; the write lock for the data is grabbed in the constructor and released in the destructor

    Calls to the following workflow API functions related to @ref dynamicdata "workflow dynamic data" can be
    made normally while this object exists and the write lock is held; the functions are aware of and automatically
    use the write lock held by this object:
    - WorkflowApi.deleteDynamicDataKey()
    - WorkflowApi.getDynamicData()
    - WorkflowApi.updateDynamicData()

    The %Qore-language destructor is run at the end of the Java step execution, after the step returns to Qorus.
 */
public class DynamicDataHelper extends WorkflowDataHelper {
    //! creates the object as a wrapper for the Qore object
    public DynamicDataHelper(QoreObject obj) {
        super(obj);
    }

    //! creates the DynamicDataHelper object from the Qore class of the same name
    public DynamicDataHelper() throws Throwable {
        super(QoreJavaApi.newObjectSave("Workflow::DynamicDataHelper"));
    }

    //! replaces @ref dynamicdata "dynamic data"; the data has already been committed to the database when the method returns
    /** @note
        - there is currently no function equivalent to this method for @ref dynamicdata "workflow dynamic data";
          this method replaces all the data with \a new_data
        - the use of this method causes SQL I/O to be performed in the system schema; to maximize performance,
          calls to this and other similar methods should be minimized if possible
    */
    public void replace(HashMap<String, Object> new_data) throws Throwable {
        obj.callMethod("replace", new_data);
    }

    //! clears @ref dynamicdata "dynamic data"; the change has already been committed to the database when the method returns
    /** @note
        - there is currently no function equivalent to this method for @ref dynamicdata "workflow dynamic data";
          this method clears all the data
        - the use of this method causes SQL I/O to be performed in the system schema; to maximize performance,
          calls to this and other similar methods should be minimized if possible
    */
    public void replace() throws Throwable {
        obj.callMethod("replace");
    }

    //! adds data to @ref dynamicdata "dynamic data"; the data has already been committed to the database when the method returns
    /** this method is equivalent to @ref WorkflowApi.updateDynamicData()

        @note the use of this method causes SQL I/O to be performed in the system schema; to maximize performance,
        calls to this and other similar methods should be minimized if possible
    */
    public void update(HashMap<String, Object> new_data) throws Throwable {
        obj.callMethod("update", new_data);
    }

    //! deletes one or more keys from @ref dynamicdata "dynamic data"; the changes have already been committed to the database when the method returns
    /** this method is equivalent to @ref WorkflowApi.deleteDynamicDataKey()

        @param keys the keys to delete

        @note the use of this method causes SQL I/O to be performed in the system schema; to maximize performance, calls to this and other similar methods should be minimized if possible
    */
    public void deleteKey(String... keys) throws Throwable {
        obj.callMethod("deleteKey", (Object)keys);
    }
}