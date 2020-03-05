// -*- mode: qore; indent-tabs-mode: nil -*-
//! @file QorusAsyncArrayStep.java class definition for Qorus async array steps

// Qorus Integration Engine

/*
  Copyright (C) 2003 - 2018 Qore Technologies, s.r.o., all rights reserved

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

import com.qoretechnologies.qorus.OMQ;
import com.qoretechnologies.qorus.workflow.QorusAsyncStepBase;

//! The abstract class for @ref asyncsteps "async array steps"
/** @par Example
    @code{.java}
// name: MyAsyncArrayStepClass
// version: 1.0
// desc: my async array step class
// lang: java8
import com.qoretechnologies.qorus.OMQ;
import com.qoretechnologies.qorus.UserApi;
import com.qoretechnologies.qorus.workflow.WorkflowApi;
import com.qoretechnologies.qorus.workflow.QorusAsyncArrayStep;

public class MyAsyncArrayStep implements QorusAsyncArrayStep {
    public Object[] array() throws Throwable {
        // .. array logic here
    }

    public void primary(Object array_arg) throws Throwable {
        // .. primary step logic
    }

    public String validation(String key, Object array_arg) throws Throwable {
        # call checkAction() to check in the target DB if the action has completed
        if (checkAction(key)) {
            return OMQ.StatComplete;
        }

        // call checkPending() to see if we retry or still wait
        return checkPending(key) ? OMQ.StatAsyncWaiting : OMQ.StatRetry;
    }

    public void end(Object queue_data, Object array_arg) throws Throwable {
        HashMap hm = (HashMap)queue_data;
        # the error thrown here should be defined by the workflow's errorfunction
        String status = hm.get("status");
        if (status == "ERROR") {
            throw new MyAsyncError();
        } else {
            UserApi.logInfo("data status: %y", status);
        }
    }

    public boolean checkAction(String key) {
        // .. logic here
    }

    public boolean checkPending(String key) {
        // .. logic here
    }
}
// END
    @endcode

    @note Qorus step constructors do not take any arguments; see @ref classstepconstructors for information about
    constructors and static class initialization.

    @see @ref asyncsteps and @ref arraysteps "array steps"
*/
public abstract class QorusAsyncArrayStep extends QorusAsyncStepBase {
    //! The array method returns the list of elements for the step
    /**
        @return The return value of the array function will determine how many times the step will execute, and on what
        data; null or a zero-length array means to skip the step entirely.  Each element in this array indicates an
        array step element; each element will be passed as the argument to primary() and validation()

        @throws Throwable any exceptions are converted to %Qore exceptions and processed as workflow errors

        @note this method must always return the same list in the same order in every call (for example if the step
        must be recovereed); use @ref dynamicdata to save the list to ensure that this method always returns the same
        list in the same order if necessary
     */
    public abstract Object[] array() throws Throwable;

    //! The primary step logic for the async step
    /** @param array_arg the array element for this step index as returned by @ref array() "the array method"

        This code must call either @ref submitAsyncKey() or @ref skipAsyncStep() or an error
        will be raised.

        If the step is not to be skipped, then the step nust start the asynchronous action and save a unique key for
        the action by calling the @ref submitAsyncKey() workflow API function.

        @throws Throwable any exceptions are converted to %Qore exceptions and processed as workflow errors
    */
    public abstract void primary(Object array_arg) throws Throwable;

    //! Validation logic for the step
    /**
        This method must be overridden for steps that can only execute once; by default this method will return
        @ref OMQ.StatRetry, meaning that the primary step logic will be repeated.

        @param async_key the asynchronous key for the step, if bound, if not, this value will be @ref nothing
        @param array_arg the array element for this step index as returned by @ref array() "the array method"

        @return this must be one of the following @ref StatusDescriptions "step status constants":
        - @ref OMQ.StatComplete "": do not run the primary step logic; mark the step as \c "COMPLETE" and continue.
          For asynchronous steps, the @ref asyncbackendfunc "back-end logic" (@ref end()) will not be run in this case
        - @ref OMQ.StatError "": do not run the primary step logic; mark the step as \c "ERROR" and stop running any
          further dependencies of this step
        - @ref OMQ.StatRetry "": run the step function again immediately.  If the step is an asynchronous step with queue
          data with a @ref OMQ.QS_Waiting status, the queue data will be deleted immediately before the step function
          is run again
        - @ref OMQ.StatAsyncWaiting "": for asynchronous steps only, do not run the step function and keep the
          \c "ASYNC-WAITING" status.  For non-asynchronous steps, raises an error and the return value is treated like
          @ref OMQ.StatError

        @note if any other value than the above is returned, an error is raised and the return value is treated like
        @ref OMQ.StatError

        @throws Throwable any exceptions are converted to %Qore exceptions and processed as workflow errors

        @see
        - @ref validationfunc
        - @ref req3 "Non-Repeatable Steps Must Include Validation"
    */
    public String validation(String async_key, Object array_arg) throws Throwable {
        // retry the step by default
        return OMQ.StatRetry;
    }

    //! This method is run when the queue data bound to the asynchronous is updated and receives status @ref OMQ.QS_Received
    /**
        The job of this method is to determine if the asynchronously-received data is correct or not; if it is not
        correct, then the function should raise an error by calling
        @ref WorkflowApi.stepError() or by throwing an appropriate exception.
        If no validation of the data is required, then the function body may be empty.

        @param queue_data any data that was posted when the queue status got status @ref OMQ.QS_Received
        @param array_arg the array element for this step index as returned by @ref array() "the array method"

        @throws Throwable any exceptions are converted to %Qore exceptions and processed as workflow errors

        @note the implementation of the logic in this base class is empty; it must be overridden in child classes to
        react to the async queue data
    */
    public void end(Object queue_data, Object array_arg) throws Throwable {
        // no implementation by default
    }
}
