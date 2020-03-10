/** Qorus Java Service API
 *
 */

package com.qoretechnologies.qorus.service;

import java.lang.annotation.*;

//! This annotation interface defines annotations for @ref servicemethods "service methods"
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD})
@Inherited
public @interface QorusMethod {
    //! The value for the @ref methodreadwritelock
    public enum LockType { None, Read, Write }

    //! The service method description; this is the only required value for a service method
    String desc();

    //! The service method author, if different than the service author; an empty string means no author tag
    String author() default "";

    //! The value for the @ref methodreadwritelock
    LockType lock() default LockType.None;

    //! The value of the @ref methodinternalflag
    /** if true it means that the method will not be automatically exported via network interfaces
     */
    boolean intern() default false;

    //! The value of the method "write" flag
    /** If this boolean flag is set to true, then the method will be marked as a "write" method, meaning that
        external callers will have to have the @ref OMQ.QR_CALL_USER_SERVICES_RW "CALL-USER-SERVICES-RW" role to call
        the method if @ref RBAC "RBAC security" is enabled
     */
    boolean write() default false;
}
