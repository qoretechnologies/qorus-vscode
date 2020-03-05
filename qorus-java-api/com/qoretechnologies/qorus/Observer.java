/** Qorus Java Observer class
 *
 */
package com.qoretechnologies.qorus;

// java imports
import java.util.Map;

//! This interface represents an observer that will get notified by the subject it observes
public interface Observer {
    public void update(String id, Map<String, Object> data_) throws Throwable;
}
