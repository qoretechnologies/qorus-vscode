/** Qorus Java ConfigItem class
 *
 */
package com.qoretechnologies.qorus;

//! hash of config item info
/**
*/
public class ConfigItem {
    //! the type of the configuration item
    public String type = "string";
    //! the description of the configuration item
    public String description;
    //! the default value of the configuration item
    public Object default_value;
    //! allow the item to be overridden at the next level?
    /** @since Qorus 4.0.3
    */
    public boolean strictly_local = false;
    //! treat the value as sensitive (mask in the UI)?
    /** @since Qorus 4.1
    */
    public boolean sensitive = false;

    public boolean is_default_value_set = false;

    //! the group of the configuration item
    public String config_group = "Default";

    //! the list of allowed value for the configuration item
    public Object allowed_values;

    public boolean has_allowed_values = false;

    //! create the object with the given name and description
    public ConfigItem(String description) {
        this.description = description;
    }

    //! set the type
    public ConfigItem withType(String type) {
        this.type = type;
        return this;
    }

    //! set the default value
    public ConfigItem withDefaultValue(Object default_value) {
        this.default_value = default_value;
        is_default_value_set = true;
        return this;
    }

    //! set the strictly local flag
    /** @since Qorus 4.0.3
    */
    public ConfigItem withStrictlyLocal(boolean strictly_local) {
        this.strictly_local = strictly_local;
        return this;
    }

    //! set the strictly local flag
    /** @since Qorus 4.1
    */
    public ConfigItem withStrictlyLocal() {
        this.strictly_local = true;
        return this;
    }

    //! set the config group
    /** @since Qorus 4.0.3
    */
    public ConfigItem withConfigGroup(String config_group) {
        this.config_group = config_group;
        return this;
    }

    //! set the allowed values
    public ConfigItem withAllowedValues(Object allowed_values) {
        this.allowed_values = allowed_values;
        has_allowed_values = true;
        return this;
    }

    //! set the sensitive flag
    /** @since Qorus 4.1
    */
    public ConfigItem withSensitive(boolean sensitive) {
        this.sensitive = sensitive;
        return this;
    }

    //! set the sensitive flag
    /** @since Qorus 4.1
    */
    public ConfigItem withSensitive() {
        this.sensitive = true;
        return this;
    }
}
