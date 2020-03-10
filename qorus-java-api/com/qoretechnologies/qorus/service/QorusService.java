// -*- mode: qore; indent-tabs-mode: nil -*-
//! @file QorusService.java class definition for Qorus services

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

package com.qoretechnologies.qorus.service;

import java.util.HashMap;

// qorus imports
import com.qoretechnologies.qorus.service.ServiceApi;
import com.qoretechnologies.qorus.OMQ;
import com.qoretechnologies.qorus.ConfigItem;

//! The base class for Qorus services
/** @par Example:
    @code{.java}
// service: java-example-service
// serviceversion: 1.0
// patch: p1
// lang: java8
// class-name: MyJavaService
// remote: true
// servicedesc: example service
// define-group: EXAMPLES: example interface objects
// groups: EXAMPLES
// TAG: example-code: true
// TAG: classpath: $OMQ_DIR/user/jar/my-jar.jar
// ENDSERVICE

package com.qoretechnologies.qorus.example;

import com.qoretechnologies.qorus.UserApi;
import com.qoretechnologies.qorus.service.*;

import java.time.ZonedDateTime;

class MyJavaService extends QorusService {
    public static final ZonedDateTime systemStarted;

    static {
        try {
            systemStarted = (ZonedDateTime)callRestApi("GET", "system/starttime");
        } catch (Throwable e) {
            throw new RuntimeException(e);
        }
    }

    @QorusMethod(
        desc = "initializes the service"
    )
    public void init() {
    }

    @QorusMethod(
        desc = "an example static service method"
    )
    public static void other() {
    }
}
    @endcode

    @note Qorus service constructors do not take any arguments; see @ref classserviceconstructors for information about
    constructors and static class initialization.
 */
public abstract class QorusService extends ServiceApi {
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
