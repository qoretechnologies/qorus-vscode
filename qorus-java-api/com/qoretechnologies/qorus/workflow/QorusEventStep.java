// -*- mode: qore; indent-tabs-mode: nil -*-
//! @file QorusEventStep.java class definition for Qorus event steps

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

import com.qoretechnologies.qorus.workflow.QorusEventStepBase;

//! The Java interface class for @ref eventsteps "workflow synchronization event steps"
/** Workflow synchronization event steps allow many workflow orders to synchronize their processing based on a single
    event.

    Event steps may not have validation logic.

    @par Example
    @code{.java}
// name: MyEventStepClass
// version: 1.0
// desc: my event step class
// lang: java8
import com.qoretechnologies.qorus.OMQ;
import com.qoretechnologies.qorus.UserApi;
import com.qoretechnologies.qorus.workflow.WorkflowApi;
import com.qoretechnologies.qorus.workflow.QorusEventStep;

public class MyEventStepClass implements QorusEventStep {
    public void primary() throws Throwable {
        // .. primary step logic; must call one of:
        // * bindEvent()
        // * bindEventUnposted()
        // * skipEvent()
    }
}
// END
    @endcode

    @note Qorus step constructors do not take any arguments; see @ref classstepconstructors for information about
    constructors and static class initialization.

    @see @ref eventsteps
*/
public abstract class QorusEventStep extends QorusEventStepBase {
    //! The primary step logic for the event step
    /** This code must call either @ref bindEvent(), @ref bindEventUnposted(),
        or @ref skipEvent() or an error will be raised.

        @throws Throwable any exceptions are converted to %Qore exceptions and processed as workflow errors
    */
    public abstract void primary() throws Throwable;
}
