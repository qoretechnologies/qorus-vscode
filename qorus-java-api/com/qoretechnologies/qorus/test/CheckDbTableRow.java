/** Java wrapper for the Qorus CheckDbTableRow Action class
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
public class CheckDbTableRow extends Action {
    //! creates the object from the arguments supplied
    /** @param dsname name of the datasource
        @param tablename table name
        @param selectHash a select hash specifying the rows added by the current interface and any other relevant parameters (orderby, etc)
        @param expectedValue the expected row value as a hash
    */
    public CheckDbTableRow(String dsname, String tablename, Map<String, Object> selectHash,
        Map<String, Object> expectedValue) throws Throwable {
        super(QoreJavaApi.newObjectSave("CheckDbTableRow", dsname, tablename, selectHash, expectedValue));
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

    //! returns the expected row value
    /**
        @return the expected row value
    */
    @SuppressWarnings("unchecked")
    public HashMap<String, Object> getData() throws Throwable {
        return (HashMap<String, Object>)obj.callMethod("getData");
    }

    //! returns the row actually selected in the last execution of the action
    @SuppressWarnings("unchecked")
    public HashMap<String, Object> getRowData() throws Throwable {
        return (HashMap<String, Object>)obj.callMethod("getRowData");
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object>[] getRows(Map<String, Object> row) {
        Object[] rows = new Object[1];
        rows[0] = row;
        return (Map<String, Object>[])rows;
    }
}
