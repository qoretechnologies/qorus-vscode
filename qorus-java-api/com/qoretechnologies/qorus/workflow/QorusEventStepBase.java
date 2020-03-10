// -*- mode: qore; indent-tabs-mode: nil -*-
//! @file QorusEventStepBase.java interface definition for Qorus event steps

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

// qore imports
import org.qore.jni.QoreJavaApi;

//! The Java base interface class for @ref eventsteps "event steps"
/** @note Qorus step constructors do not take any arguments; see @ref classstepconstructors for information about
    constructors and static class initialization.

    @see @ref eventsteps
*/
public abstract class QorusEventStepBase extends QorusStepBase {
    //! binds a workflow synchronization event based on the event key to a workflow synchronization event step (type @ref OMQ.ExecEvent)
    /** If this method is called twice for the same step,  or if called after skipEvent(), then an exception is
        raised.  The @ref wfsyncevents "event type" is defined when the step is defined in the workflow definition
        (see @ref eventtypetag); this information does not need to be supplied here; only the event key, and the event
        will be automatically created (if it does not exist) or found in the queue as defined by its
        @ref wfsyncevents "event type".

        @param eventkey the event key to bind the step to; if the event key does not already exist, then it is created
        in the table \c WORKFLOW_EVENTS and automatically tagged with its @ref wfsyncevents "event type".  A record
        for this step is also created in \c STEP_INSTANCE_EVENTS

        @throw WORKFLOW-EVENT-ERROR invalid method call (multiple call, etc)

        @see
        - @ref wf_bind_event()
        - @ref eventsteps
        - @ref bindEventUnposted()
        - @ref skipEvent()

        @note either bindEvent(), bindEventUnposted(), or skipEvent() must be called in a workflow synchronization
        event step
    */
    public void bindEvent(String eventkey) throws Throwable {
        QoreJavaApi.callFunction("wf_bind_event", eventkey);
    }

    //! binds a workflow synchronization event based on the event key to a workflow synchronization event step (type @ref OMQ.ExecEvent) only if the event has not yet been posted; if the event has already been posted, then an ALREADY-POSTED exception is raised
    /** If this method is called twice for the same step, or if called after skipEvent(), then an exception is raised.
        The @ref wfsyncevents "event type" is defined when the step is defined in the workflow definition (see
        @ref eventtypetag); this information does not need to be supplied here; only the event key, and the event will
        be automatically created (if it does not exist) or found in the queue as defined by its
        @ref wfsyncevents "event type".

        @param eventkey the event key to bind the step to; if the event key does not already exist, then it is created
        in the table \c WORKFLOW_EVENTS and automatically tagged with its @ref wfsyncevents "event type".  A record for
        this step is also created in \c STEP_INSTANCE_EVENTS

        @throw ALREADY-POSTED the given event has already been posted
        @throw WORKFLOW-EVENT-ERROR invalid method call (multiple call, etc)

        @see
        - @ref wf_bind_event_unposted()
        - @ref eventsteps
        - @ref bindEvent()
        - @ref skipEvent()

        @note either bindEvent(), bindEventUnposted(), or skipEvent() must be called in a workflow synchronization
        event step
    */
    public void bindEventUnposted(String eventkey) throws Throwable {
        QoreJavaApi.callFunction("wf_bind_event_unposted", eventkey);
    }

    //! skips a workflow synchronization event step
    /** If this method is called from any other step type, or if called after bindEvent(), then an exception is
        raised.  If called twice for the same step a message is logged, but no exception is raised.

        @throw WORKFLOW-EVENT-ERROR invalid method call (multiple call, etc)

        @see
        - @ref wf_skip_event()
        - @ref eventsteps
        - @ref bindEvent()
        - @ref bindEventUnposted()

        @note either bindEvent(), bindEventUnposted(), or skipEvent() must be called in a workflow synchronization
        event step
    */
    public void skipEvent() throws Throwable {
        QoreJavaApi.callFunction("wf_skip_event");
    }
}
