// -*- mode: qore; indent-tabs-mode: nil -*-
//! @file QorusJob.java class definition for Qorus jobs

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

package com.qoretechnologies.qorus.job;

import java.util.HashMap;

// qorus imports
import com.qoretechnologies.qorus.job.JobApi;
import com.qoretechnologies.qorus.OMQ;
import com.qoretechnologies.qorus.ConfigItem;

//! The abstract class for Qorus jobs
/** @par Example:
    @code{.java}
// -*- mode: java; indent-tabs-mode: nil -*-

// name: JavaClassTest
// version: 1.0
// desc: test job, run every 10 minutes every hour, every weekday
// author: Qore Technologies, s.r.o.
// active: true
// run-skipped: true
// schedule: *<--!-->/10 * * * mon-fri
// define-group: EXAMPLES: example interface objects
// groups: EXAMPLES
// class-based: true
// lang: java8
// class-based: true
import com.qoretechnologies.qorus.OMQ;
import com.qoretechnologies.qorus.UserApi;
import com.qoretechnologies.qorus.job.JobApi;
import com.qoretechnologies.qorus.job.QorusJob;

class JavaClassTest extends QorusJob {
    # the run method implments the job's logic
    public void run() throws Throwable {
        logInfo("test job info: %y", getInfo());
    }
}
// END
    @endcode

    @note Qorus job constructors do not take any arguments; see @ref classjobconstructors for information about
    constructors and static class initialization.
*/
public abstract class QorusJob extends JobApi {
    //! The logic for the job
    /**
    */
    public abstract void run() throws Throwable;

    //! Method to return configuration items
    /** @return a hash of configuration items keyed by configuration item name

        This is executed by @ref oload "oload" when the object is loaded.  The base class implementation returns no
        value.

        @note
        - If any configuration items have duplicate names or invalid type, an error is raised
        - Child classes should override getConfigItemsImpl(); this method cannot be overridden
    */
    public final HashMap<String, ConfigItem> getConfigItems() {
        return getConfigItemsImpl();
    }

    //! Method to return configuration items; this method should be overridden by child classes to provide item configuration
    /** @return a hash of configuration items keyed by configuration item name

        This is executed by getConfigItems() by @ref oload when the object is loaded into the system.  The base class
        implementation is empty and returns no value.

        @note If any configuration items have duplicate names or invalid type, an error is raised
    */
    protected HashMap<String, ConfigItem> getConfigItemsImpl() {
        return null;
    }
}
