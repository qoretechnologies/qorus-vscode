/** Java wrapper for the Qorus WaitForWfiid Action class
 *
 */
package com.qoretechnologies.qorus.test;

// Java imports
import java.util.Map;

// Qore jni imports
import org.qore.jni.QoreJavaApi;

// Qore lang imports
import org.qore.lang.qunit.*;

// Qorus imports
import com.qoretechnologies.qorus.test.*;

//! This class will wait for a workflow order to reach a final status (COMPLETE, ERROR, or CANCELED)
public class WaitForWfiid extends Action {
    //! create the object according to the arguments
    /** @param wfiid the workflow order instance ID to wait for
        @param expectedResult an @ref QUnit::AbstractTestResult "AbstractTestResult" object; the default value is @ref QUnit::TestResultSuccess "TestResultSuccess" which means that the test succeeds when the order status is \c COMPLETE
        @param timeout_ms the timeout in milliseconds; if the order does not get a final status in this time period, then the test will fail

        To pass if the order status is \c COMPLETE in the timeout given, then use @ref QUnit::TestResultSuccess "TestResultSuccess" (the default value) for the \a expectedResult parameter.
        To pass if the order status is \c ERROR in the timeout given, then use @ref QUnit::TestResultExceptionType "TestResultExceptionType" for the \a expectedResult parameter to match the \c "WORKFLOW-ERROR" exception, which is thrown when the order gets an \c ERROR status within the timeout period
        To pass if the order status is \c CANCELED in the timeout given, then use @ref QUnit::TestResultExceptionType "TestResultExceptionType" for the \a expectedResult parameter to match the \c "QORUS-WORKFLOW-TEST-EXCEPTION" exception, which is thrown when the order gets a \c CANCELED status within the timeout period
    */
    public WaitForWfiid(int wfiid, AbstractTestResult expectedResult, int timeout_ms) throws Throwable {
        super(QoreJavaApi.newObjectSave("WaitForWfiid", wfiid, expectedResult, timeout_ms));
    }

    //! create the object according to the arguments
    /** @param wfiid the workflow order instance ID to wait for
        @param expectedResult an @ref QUnit::AbstractTestResult "AbstractTestResult" object; the default value is @ref QUnit::TestResultSuccess "TestResultSuccess" which means that the test succeeds when the order status is \c COMPLETE

        To pass if the order status is \c COMPLETE in the timeout given, then use @ref QUnit::TestResultSuccess "TestResultSuccess" (the default value) for the \a expectedResult parameter.
        To pass if the order status is \c ERROR in the timeout given, then use @ref QUnit::TestResultExceptionType "TestResultExceptionType" for the \a expectedResult parameter to match the \c "WORKFLOW-ERROR" exception, which is thrown when the order gets an \c ERROR status within the timeout period
        To pass if the order status is \c CANCELED in the timeout given, then use @ref QUnit::TestResultExceptionType "TestResultExceptionType" for the \a expectedResult parameter to match the \c "QORUS-WORKFLOW-TEST-EXCEPTION" exception, which is thrown when the order gets a \c CANCELED status within the timeout period
    */
    public WaitForWfiid(int wfiid, AbstractTestResult expectedResult) throws Throwable {
        super(QoreJavaApi.newObjectSave("WaitForWfiid", wfiid, expectedResult));
    }

    //! create the object according to the arguments
    /** @param wfiid the workflow order instance ID to wait for
    */
    public WaitForWfiid(int wfiid) throws Throwable {
        super(QoreJavaApi.newObjectSave("WaitForWfiid", wfiid));
    }

    //! Waits until the given WFIID gets A final status
    /** @param t QorusInterfaceTest test object
    */
    public Object run(QorusInterfaceTest t) throws Throwable {
        return obj.callMethod("run", t);
    }
}
