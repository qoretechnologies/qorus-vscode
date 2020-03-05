// -*- mode: qore; indent-tabs-mode: nil -*-
//! @file QorusWorkflow.qc base class definition for class-based Qorus steps

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

//! Base class for workflow classes
/** @since Qorus 4.0.3
*/
public class QorusWorkflow extends WorkflowApi {
    //! This method is called when Qorus starts working on a workflow order data instance; it in turn calls @ref attachImpl() which can be overridden in subclasses
    /** If any error is raised in the attach method (by calling
        @ref OMQ::UserApi::Workflow::WorkflowApi::stepError() "WorkflowApi::stepError()" in %Qore code or
        @ref com.qoretechnologies.qorus.workflow.WorkflowApi.stepError() "WorkflowApi.stepError()" in Java code) or by
        throwing an appropriate exception), the workflow order data instance will receive an @ref OMQ::StatError
        status and the attach operation will fail.

        @note @ref tempdata "TempData" can only be reliably set in the attach method, because a workflow can be
        restarted from any step after an error.  Therefore you cannot ensure that @ref tempdata "TempData" set in
        other step code will be available when executing the following step, in case an error occurs.
    */
    public final void attach() throws Throwable {
        attachImpl();
    }

    //! This method is called when the workflow order data instance status is committed to the database; it in turn calls @ref detachImpl() which can be overridden in subclasses
    /** @param status The status being set for the workflow order data instance, see @ref StatusDescriptions
        @param external_order_instanceid The external key for the workflow data being processed, if any exists, otherwise null

        The first argument passed to the method is the workflow order data instance's status
        (@ref StatusDescriptions "status descriptions") that will be written to the database.  The second argument
        passed is the external order instance ID, if any exists.
    */
    public final void detach(String status, String external_order_instanceid) throws Throwable {
        detachImpl(status, external_order_instanceid);
    }

    //! This method is executed once when the workflow execution instance starts or is reset; it in turn calls @ref oneTimeInitImpl() which can be overridden in subclasses
    /** @note Persistent objects with a high acquisition cost should be acquired in the oneTimeInit() method.  Use the
        @ref OMQ::UserApi::Workflow::WorkflowApi::updateInstanceData() "WorkflowApi::updateInstanceData()"
        method (in %Qore) or the
        @ref com.qoretechnologies.qorus.workflow.WorkflowApi.updateInstanceData() "WorkflowApi.updateInstanceData()"
        method (in Java) to save resources acquired, and
        @ref OMQ::UserApi::Workflow::WorkflowApi::getInstanceData() "WorkflowApi::getInstanceData()" (in %Qore) or
        the
        @ref com.qoretechnologies.qorus.workflow.WorkflowApi.getInstanceData() "WorkflowApi.getInstanceData()" method (in
        Java) to retrieve the resources during the workflow's execution.
    */
    public final void oneTimeInit() throws Throwable {
        oneTimeInitImpl();
    }

    //! This method is called when errors are raised; it in turn calls @ref errorHandlerImpl() which can be overridden in subclasses
    /** @param errcode the error code string (ex: \c "QORE-EXCEPTION")
        @param errinfo this parameter will only be present if the error has been defined by as a workflow error;
        if so, the hash should have at least the following keys (key names in square brackets (i.e. <i>[name]</i>) are optional):
        - \c desc: description of the error
        - \c severity: @ref ErrorSeverityCodes
        - \c status: either @ref OMQ::StatRetry (meaning that the step should be retried) or @ref OMQ::StatError
        - <i>[retry-delay]</i>: the delay in seconds before the error should be retried (only valid when \c status is
            @ref OMQ::StatRetry)
        - <i>[business]</i>: if \c True, this error represents a business error (rather than a technical error); usually
            implying that there is a problem with the consistency of the order data
        @param opt an optional parameter that can be supplied by the workflow when an error is raised, normally a
        string providing additional information about the error

        This method allows the workflow to do external logging or to take custom actions when errors are raised.

        The default implementation in the base class is empty.
    */
    public final void errorHandler(String errcode, Map<String, Object> errinfo, Object opt) throws Throwable {
        errorHandlerImpl(errcode, errinfo, opt);
    }

    //! This method is called when Qorus starts working on a workflow order data instance; this method may be overridden in subclasses
    /** If any error is raised in the attach method (by calling
        @ref OMQ::UserApi::Workflow::WorkflowApi::stepError() "WorkflowApi::stepError()" in %Qore code or
        @ref com.qoretechnologies.qorus.workflow.WorkflowApi.stepError() "WorkflowApi.stepError()" in Java code) or by
        throwing an appropriate exception), the workflow order data instance will receive an @ref OMQ::StatError
        status and the attach operation will fail.

        @note @ref tempdata "TempData" can only be reliably set in the attach method, because a workflow can be
        restarted from any step after an error.  Therefore you cannot ensure that @ref tempdata "TempData" set in
        other step code will be available when executing the following step, in case an error occurs.
    */
    protected void attachImpl() throws Throwable {
    }

    //! This method is called when the workflow order data instance status is committed to the database; this method may be overridden in subclasses
    /** @param status The status being set for the workflow order data instance, see @ref StatusDescriptions
        @param external_order_instanceid The external key for the workflow data being processed, if any exists,
        otherwise null

        The first argument passed to the method is the workflow order data instance's status
        (@ref StatusDescriptions "status descriptions") that will be written to the database.  The second argument
        passed is the external order instance ID, if any exists.
    */
    protected void detachImpl(String status, String external_order_instanceid) throws Throwable {
    }

    //! This method is executed once when the workflow execution instance starts or is reset; this method may be overridden in subclasses
    /** @note Persistent objects with a high acquisition cost should be acquired in the oneTimeInit() method.  Use the
        @ref OMQ::UserApi::Workflow::WorkflowApi::updateInstanceData() "WorkflowApi::updateInstanceData()"
        method (in %Qore) or the
        @ref com.qoretechnologies.qorus.workflow.WorkflowApi.updateInstanceData() "WorkflowApi.updateInstanceData()"
        method (in Java) to save resources acquired, and
        @ref OMQ::UserApi::Workflow::WorkflowApi::getInstanceData() "WorkflowApi::getInstanceData()" (in %Qore) or
        the
        @ref com.qoretechnologies.qorus.workflow.WorkflowApi.getInstanceData() "WorkflowApi.getInstanceData()" method (in
        Java) to retrieve the resources during the workflow's execution.
    */
    protected void oneTimeInitImpl() throws Throwable {
    }

    //! This method is called when errors are raised and may be overridden in subclasses
    /** @param errcode the error code string (ex: \c "QORE-EXCEPTION")
        @param errinfo this parameter will only be present if the error has been defined as a workflow error;
        if so, the hash should have at least the following keys (key names in square brackets (i.e. <i>[name]</i>) are optional):
        - \c desc: description of the error
        - \c severity: @ref ErrorSeverityCodes
        - \c status: either @ref OMQ::StatRetry (meaning that the step should be retried) or @ref OMQ::StatError
        - <i>[retry-delay]</i>: the delay in seconds before the error should be retried (only valid when \c status is
            @ref OMQ::StatRetry)
        - <i>[business]</i>: if \c True, this error represents a business error (rather than a technical error); usually
            implying that there is a problem with the consistency of the order data
        @param opt an optional parameter that can be supplied by the workflow when an error is raised, normally a
        string providing additional information about the error

        This method allows the workflow to do external logging or to take custom actions when errors are raised.

        The default implementation in the base class is empty.
    */
    protected void errorHandlerImpl(String errcode, Map<String, Object> errinfo, Object opt) throws Throwable {
    }
}
