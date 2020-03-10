/** Java wrapper for the Qorus CheckDbTableRows Action class
 *
 */
package com.qoretechnologies.qorus.test;

// Java imports
import java.util.Map;
import java.util.HashMap;

// Qore jni imports
import org.qore.jni.QoreJavaApi;

// Qorus imports
import com.qoretechnologies.qorus.test.*;

//! abstract class representing an action in a test case
public class CheckDbTableRows extends Action {
    //! creates the object from the arguments supplied
    /** @param dsname name of the datasource
        @param tablename table name
        @param selectHash a select hash specifying the rows added by the current interface and any other relevant parameters (orderby, etc)
        @param expectedValues list of hashes of expected values that should be in selected rows
    */
    public CheckDbTableRows(String dsname, String tablename, Map<String, Object> selectHash,
        Map<String, Object>[] expectedValues) throws Throwable {
        super(QoreJavaApi.newObjectSave("CheckDbTableRows", dsname, tablename, selectHash, expectedValues));
    }

    //! runs the test action: verifies the table content as provided in the constructor
    /** @param t QorusInterfaceTest test object

        check for db content
    */
    public Object run(QorusInterfaceTest t) throws Throwable {
        return obj.callMethod("run", t);
    }

    //! returns the table to be inspected
    /**
        @return table to be inspected
    */
    public String getTable() throws Throwable {
        return (String)obj.callMethod("getTable");
    }

    /**
        @return select hash
    */
    @SuppressWarnings("unchecked")
    public HashMap<String, Object> getSelectHash() throws Throwable {
        return (HashMap<String, Object>)obj.callMethod("getSelectHash");
    }

    //! returns the expected values
    /**
        @return expected values
    */
    @SuppressWarnings("unchecked")
    public HashMap<String, Object>[] getData() throws Throwable {
        return (HashMap<String, Object>[])obj.callMethod("getData");
    }

    //! returns the rows actually selected in the last execution of the action
    @SuppressWarnings("unchecked")
    public HashMap<String, Object>[] getRowData() throws Throwable {
        return (HashMap<String, Object>[])obj.callMethod("getRowData");
    }
}
