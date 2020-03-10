// -*- mode: qore; indent-tabs-mode: nil -*-
//! @file QorusNormalStep.java class definition for Qorus normal steps

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

// qorus imports
import com.qoretechnologies.qorus.workflow.QorusStepBase;
import com.qoretechnologies.qorus.OMQ;

//! The abstract class for @ref normalsteps "normal steps"
/** @par Example
    @code{.java}
// name: MyNormalStepClass
// version: 1.0
// desc: my normal step class
// lang: java8
import com.qoretechnologies.qorus.OMQ;
import com.qoretechnologies.qorus.workflow.QorusNormalStep;

public class MyNormalStepClass implements QorusNormalStep {
    public void primary() throws Throwable {
        // ... primary step logic
    }

    public String validation() throws Throwable {
        # call checkAction() to check in the target DB if the action has completed
        if (checkAction()) {
            return OMQ.StatComplete;
        }

        // call checkPending() to see if we retry or still wait
        return checkPending() ? OMQ.StatAsyncWaiting : OMQ.StatRetry;
    }

    public boolean checkAction() {
        // .. logic here
    }

    public boolean checkPending() {
        // .. logic here
    }
}
// END
    @endcode

    @note Qorus step constructors do not take any arguments; see @ref classstepconstructors for information about
    constructors and static class initialization.

    @see @ref normalsteps
*/
public abstract class QorusNormalStep extends QorusStepBase {
    //! The primary step logic for the normal step
    /**
    */
    public abstract void primary() throws Throwable;

    //! Validation logic for the step
    /**
        This method must be overridden for steps that can only execute once; by default this method will return
        @ref OMQ.StatRetry, meaning that the primary step logic will be repeated.

        @return this must be one of the following @ref StatusDescriptions "step status constants":
        - @ref OMQ.StatComplete "StatComplete": do not run the primary step logic; mark the step as \c "COMPLETE" and continue
        - @ref OMQ.StatError "StatError": do not run the primary step logic; mark the step as \c "ERROR" and stop running any
          further dependencies of this step
        - @ref OMQ.StatRetry "StatRetry": run the step function again immediately

        @note if any other value than the above is returned, an error is raised and the return value is treated like
        @ref OMQ.StatError

        @throws Throwable any exceptions are converted to %Qore exceptions and processed as workflow errors

        @see
        - @ref validationfunc
        - @ref req3 "Non-Repeatable Steps Must Include Validation"
    */
    public String validation() throws Throwable {
        return OMQ.StatRetry;
    }
}
