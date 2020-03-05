// -*- mode: qore; indent-tabs-mode: nil -*-
//! @file QorusStepBase.qc base class definition for class-based Qorus steps

// Qorus Integration Engine

/*
  Copyright (C) 2003 - 2019 Qore Technologies, s.r.o., all rights reserved

  **** NOTICE ****
    All information contained herein is, and remains the property of Qore
    Technologies, s.r.o. and its suppliers, if any.  The intellectual and
    technical concepts contained herein are proprietary to Qore Technologies,
    s.r.o. and its suppliers and may be covered by Czech, European, U.S. and
    Foreign Patents, patents in process, and are protected by trade secret or
    copyright law.  Dissemination of this information or reproduction of this
    material is strictly forbidden unless prior written permission is obtained
    from Qore Technologies, s.r.o.
*/
package com.qoretechnologies.qorus.workflow;

import java.util.Map;
import java.util.HashMap;

import org.qore.jni.QoreJavaApi;

import com.qoretechnologies.qorus.workflow.WorkflowApi;
import com.qoretechnologies.qorus.ConfigItem;

//! Base class for workflow step classes
/** @note Qorus step constructors do not take any arguments; see @ref classstepconstructors for information about
    constructors and static class initialization.
*/
public class QorusStepBase extends WorkflowApi {
    //! Returns the default @ref stepdata "dynamic step data" for the step when the step is first run
    /** @return the default @ref stepdata "dynamic step data" for the step when the step is first run

        The default implementation in the base class returns null

        @since Qorus 4.0.1
    */
    public HashMap<String, Object> getDefaultStepData() {
        return null;
    }

    //! Returns @ref stepusermetadata "step user metadata" for the step when the step is loaded by @ref oload "oload"
    /** @return stepusermetadata "step user metadata" for the step when the step is loaded by @ref oload "oload"

        The default implementation in the base class returns null

        @note This method is executed by @ref oload "oload" when the step is created in the database and therefore
        this method should not use any runtime functionality.

        @since Qorus 4.0.1
    */
    public HashMap<String, Object> getStepMetadata() {
        return null;
    }

    //! Method to return local configuration items
    /** @return a hash of local configuration items keyed by configuration item name

        This is executed by @ref oload "oload" when the object is loaded.  The base class implementation returns null.

        @note
        - If any configuration items have an invalid type, an error is raised
        - Child classes should override getConfigItemsImpl(); this method cannot be overridden
    */
    public final HashMap<String, ConfigItem> getConfigItems() {
        return getConfigItemsImpl();
    }

    //! Method to return local configuration items; this method should be overridden by child classes to provide item configuration
    /** @return a hash of local configuration items keyed by configuration item name

        This is executed by getConfigItems() by @ref oload when the object is loaded into the system.  The base class
        implementation is empty and returns null.

        @note If any configuration items have an invalid type, an error is raised
    */
    protected HashMap<String, ConfigItem> getConfigItemsImpl() {
        return null;
    }

    //! Updates the values of one or more keys in the workflow order data instance’s @ref stepdata "dynamic step data hash"
    /** Dynamic step data is directly linked to the order data the workflow execution instance is processing.

        Changes are committed to the database before the method returns.

        @param new_data the key-value pairs to update in dynamic step data

        @note
        - This call does not replace the step data hash; any keys in the hash parameter are added to the step data
          hash
        - The use of this method causes SQL I/O to be performed in the system schema; to maximize performance, calls
          to this and other similar methods should be minimized if possible

        @see
        - @ref stepdata
        - StepDataHelper

        @since Qorus 4.0.1
    */
    public static void updateStepData(Map<String, Object> new_data) throws Throwable {
        QoreJavaApi.callStaticMethod("Workflow::QorusStepBase", "updateStepData", new_data);
    }

    //! Deletes one or more keys from the workflow order data instance’s @ref stepdata "dynamic step data hash"
    /** Dynamic step data is directly linked to the order data the workflow execution instance is processing.

        Changes are committed to the database before the method returns.

        @param keylist a single key or a list of keys to delete in the workflow order's dynamic step data

        @note The use of this method causes SQL I/O to be performed in the system schema; to maximize performance, calls to this and other similar methods should be minimized if possible

        @see
        - @ref stepdata
        - StepDataHelper

        @since Qorus 4.0.1
    */
    public static void deleteStepDataKey(String... keylist) throws Throwable {
        QoreJavaApi.callStaticMethod("Workflow::QorusStepBase", "deleteStepDataKey", (Object)keylist);
    }

    //! Retrieves the values of a single key from the workflow order data instance’s @ref stepdata "dynamic step data hash"
    /** Dynamic step data is directly linked to the order data the workflow execution instance is processing.

        @return the value of the given key is returned

        @see
        - @ref stepdata
        - getStepDataArgs()
        - StepDataHelper
        - WorkflowDataHelper::get()

        @since Qorus 4.0.1
    */
    public static Object getStepData(String key) throws Throwable {
        return QoreJavaApi.callStaticMethod("Workflow::QorusStepBase", "getStepData", key);
    }

    //! Retrieves the values of multiple keys from the workflow order data instance’s @ref stepdata "dynamic step data hash"
    /** Dynamic step data is directly linked to the order data the workflow execution instance is processing.

        @param arg0 the first key to return
        @param args other keys to return

        @return a hash is returned giving the values of all the keys requested

        @see
        - @ref stepdata
        - getStepDataArgs()
        - StepDataHelper
        - WorkflowDataHelper::get()

        @since Qorus 4.0.1
    */
    @SuppressWarnings("unchecked")
    public static HashMap<String, Object> getStepData(String arg0, String... args) throws Throwable {
        String[] new_args = new String[args.length + 1];
        new_args[0] = arg0;
        System.arraycopy(args, 0, new_args, 1, args.length);
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethodArgs("Workflow::QorusStepBase", "getStepData", new_args);
    }

    //! Retrieves the hash value of the workflow order data instance’s @ref stepdata "dynamic step data hash"
    /** Dynamic step data is directly linked to the order data the workflow execution instance is processing.

        @return a hash with the entire @ref stepdata "dynamic step data hash" for the current step or null if no step
        data is available

        @see
        - @ref stepdata
        - getStepDataArgs()
        - StepDataHelper
        - WorkflowDataHelper::get()

        @since Qorus 4.0.1
    */
    @SuppressWarnings("unchecked")
    public static HashMap<String, Object> getStepData() throws Throwable {
        return (HashMap<String, Object>)QoreJavaApi.callStaticMethod("Workflow::QorusStepBase", "getStepData");
    }

    //! Retrieves the values of one or more keys from the workflow order data instance’s @ref stepdata "dynamic step data hash"
    /** Dynamic step data is directly linked to the order data the workflow execution instance is processing.

        @param keylist for a single string argument, the value of that key is returned, for a list of strings, a hash
        is returned giving the values of all the keys requested

        @see
        - @ref stepdata
        - getStepData()
        - StepDataHelper
        - WorkflowDataHelper::get()

        @since Qorus 4.0.1
    */
    public static Object getStepDataArgs(String... keylist) throws Throwable {
        return QoreJavaApi.callStaticMethodArgs("Workflow::QorusStepBase", "getStepData", keylist);
    }
}
