// -*- mode: qore; indent-tabs-mode: nil -*-
//! @file QorusSubworkflowStep.java class definition for Qorus subworkflow steps

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
import com.qoretechnologies.qorus.workflow.QorusSubworkflowStepBase;

//! The abstract class for @ref subworkflowsteps "subworkflow steps"
/** A subworkflow step binds a child workflow (called a subworkflow) to a step and should be used to
    implement support for complex logical branching in Qorus.

    Subworkflow steps may not have validation logic.

    @par Example
    @code{.java}
// name: MySubworkflowStepClass
// version: 1.0
// desc: my subbworkflow step class
// lang: java8
import com.qoretechnologies.qorus.OMQ;
import com.qoretechnologies.qorus.UserApi;
import com.qoretechnologies.qorus.workflow.WorkflowApi;
import com.qoretechnologies.qorus.workflow.QorusSubworkflowStep;

public class MySubworkflowStepClass implements QorusSubworkflowStep {
    public void primary() throws Throwable {
        // .. primary step logic; must call one of:
        // * bindSubworkflow()
        // * skipSubworkflow()
    }
}
// END
    @endcode

    @note Qorus step constructors do not take any arguments; see @ref classstepconstructors for information about
    constructors and static class initialization.

    @see @ref subworkflowsteps
*/
public abstract class QorusSubworkflowStep extends QorusSubworkflowStepBase {
    //! The primary step logic for the subworkflow step
    /**
        This code must call either @ref bindSubworkflow() or @ref skipSubworkflow()
        or an error will be raised.

        If the step is not to be skipped, then the step nust bind a subworkflow order to the step by
        calling the @ref bindSubworkflow() workflow API method.

        @throws Throwable any exceptions are converted to %Qore exceptions and processed as workflow errors
    */
    public abstract void primary() throws Throwable;
}
