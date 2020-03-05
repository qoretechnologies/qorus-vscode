/** Qorus Java API
 *
 */

package com.qoretechnologies.qorus;

import org.qore.jni.QoreClosureMarker;

//! This class is used for callbacks for config item updates
/** @ref com.qoretechnologies.qorus.service.ServiceApi.setConfigItemChangeCallback() "ServiceApi.setConfigItemChangeCallback()"
 */
public interface ConfigItemValueCallback extends QoreClosureMarker {
    //! This method is called when a config item is updated
    /**
     * @param config_item_name the config item changed
     * @throws Throwable any exception thrown by the callback; such exceptions will be logged but will otherwise have
     * no effect on processing
     *
     * @see @ref com.qoretechnologies.qorus.service.ServiceApi.setConfigItemChangeCallback() "ServiceApi.setConfigItemChangeCallback()"
     */
    void call(String config_item_name) throws Throwable;
}
