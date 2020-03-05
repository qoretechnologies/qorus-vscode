/** Qorus Java Observer class
 *
 */
package com.qoretechnologies.qorus;

// java imports
import java.util.Map;
import java.util.ArrayList;

// Qorus imports
import com.qoretechnologies.qorus.Observer;

//! This class represents an observable subject that will notify all of its registered observers
public class Observable {
    private ArrayList<Observer> observers = new ArrayList<Observer>();

    // ! The method registers the given observer
    /**
     * @param Observer observer to be registered
     */
    public boolean registerObserver(final Observer observer) {
        return observers.add(observer);
    }

    // ! The method unregisters the given observer
    /**
     * @param Observer observer to be unregistered
     */
    public boolean unregisterObserver(final Observer observer) {
        return observers.remove(observer);
    }

    // ! The method notifies all subscribed observers
    /**
     * @param id    unique ID identifying an event
     * @param data_ hash representing new data to be passed to observers' update
     *              method
     */
    public void notifyObservers(final String id, final Map<String, Object> data_) throws Throwable {
        for (Observer observer : observers) {
            observer.update(id, data_);
        }
    }
}
