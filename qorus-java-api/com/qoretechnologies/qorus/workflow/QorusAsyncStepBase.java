// -*- mode: qore; indent-tabs-mode: nil -*-
//! @file QorusAsyncStepBase.java interface definition for Qorus async steps

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

//! The Java base interface class for @ref asyncsteps "asynchronous steps"
/** @note Qorus step constructors do not take any arguments; see @ref classstepconstructors for information about
    constructors and static class initialization.

    @see @ref asyncsteps
*/
public abstract class QorusAsyncStepBase extends QorusStepBase {
    //! Binds the given key to the asynchronous step
    /**
        If this method is called more than once from an asynchronous step, an exception will be thrown.

        If the key already exists in the queue, an exception will be thrown.

        The queue name and ID is taken from the step definition; queue entries are created in the table \c QUEUE_DATA.

        @param key the key for the queue entry; must be unique in the queue

        @throw INVALID-FUNCTION-CALL invalid method call (double call, etc)
        @throw INVALID-KEY empty string passed for key

        @note Asynchronous steps must call either this method or skipAsyncStep() or an error will be raised.

        @see @ref wf_submit_async_key()
    */
    public void submitAsyncKey(String key) throws Throwable {
        QoreJavaApi.callFunction("wf_submit_async_key", key);
    }

    //! This method will skip the execution of an asynchronous step
    /** Calling this method or submitAsyncKey() more than once from an asynchronous step will result in an exception.

        @throw INVALID-FUNCTION-CALL invalid method call (double call, etc)

        @note Asynchronous steps must call either this method or submitAsyncKey() or an error will be raised.

        @see @ref wf_submit_async_key()
    */
    public void skipAsyncStep() throws Throwable {
        QoreJavaApi.callFunction("wf_skip_async_step");
    }
}
