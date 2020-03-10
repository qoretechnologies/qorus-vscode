/** Qorus Java SensitiveDataHelper class
 *
 */
package com.qoretechnologies.qorus.workflow;

// java imports
import java.util.HashMap;

// jni module imports
import org.qore.jni.QoreObject;
import org.qore.jni.QoreObjectWrapper;
import org.qore.jni.QoreJavaApi;

//! Java wrapper for the @ref OMQ::UserApi::Workflow::SensitiveDataHelper "SensitiveDataHelper" class in Qorus
/**  This class is a helper class that allows @ref sensitive_data "workflow sensitive data" to be read and updated
     atomically; the write lock for the data is grabbed in the constructor and released in the destructor

     Calls to the following workflow API functions related to @ref sensitive_data "sensitive data" can be made
     normally while this object exists and the write lock is held; the functions are aware of and automatically use
     the write lock held by this object:
    - WorkflowApi.deleteSensitiveDataKey()
    - WorkflowApi.getSensitiveData()
    - WorkflowApi.updateSensitiveData()

    The %Qore-language destructor is run at the end of the Java step execution, after the step returns to Qorus.

    @see @ref sensitive_data
 */
public class SensitiveDataHelper extends QoreObjectWrapper {
    //! creates the object as a wrapper for the Qore object
    public SensitiveDataHelper(QoreObject obj) {
        super(obj);
    }

    //! creates the SensitiveDataHelper object from the Qore class of the same name
    public SensitiveDataHelper() throws Throwable {
        super(QoreJavaApi.newObjectSave("Workflow::SensitiveDataHelper"));
    }

    //! returns the value of multiple keys in the @ref sensitive_data "sensitive data hash" for the given key value
    /** @par Example:
        @code{.java}
SensitiveDataHelper sdh = new SensitiveDataHelper();
try {
    // get the tax number and address for the person
    HashMap<String, Object> hm = sdh.get("personal_id", personal_id, "tax_number", "address_city");
} finally {
    sdh.release();
}
        @endcode

        @param skey the type of value provided in \a svalue
        @param svalue the value of the sensitive data key identified by \a skey
        @param keys multiple string key fields to return

        @return a hash of the requested keys

        @note this method is equivalent to @ref WorkflowApi.getSensitiveData()
    */
    @SuppressWarnings("unchecked")
    public HashMap<String, Object> get(String skey, String svalue, String... keys) throws Throwable {
        return (HashMap<String, Object>)obj.callMethod("get", skey, svalue, (Object)keys);
    }

    //! returns the value of a single key in the @ref sensitive_data "sensitive data hash" for the given key value
    /** @par Example:
        @code{.java}
SensitiveDataHelper sdh = new SensitiveDataHelper();
try {
    // get the tax number for the person
    String tax_number = (String)sdh.get("personal_id", personal_id, "tax_number");
} finally {
    sdh.release();
}
        @endcode

        @param skey the type of value provided in \a svalue
        @param svalue the value of the sensitive data key identified by \a skey
        @param key a string key field to return

        @return the value of the requested key

        @note this method is equivalent to @ref WorkflowApi.getSensitiveData()
    */
    public Object get(String skey, String svalue, String key) throws Throwable {
        return obj.callMethod("get", skey, svalue, key);
    }

    //! returns the value of the entire @ref sensitive_data "sensitive data hash" for the given key value
    /** @par Example:
        @code{.java}
SensitiveDataHelper sdh = new SensitiveDataHelper();
try {
    // get the entire sensitive data hash for the person
    HashMap<String, Object> hm = sdh.get("personal_id", personal_id);
} finally {
    sdh.release();
}
        @endcode

        @param skey the type of value provided in \a svalue
        @param svalue the value of the sensitive data key identified by \a skey

        @return a hash of the requested keys

        @note this method is equivalent to @ref WorkflowApi.getSensitiveData()
    */
    @SuppressWarnings("unchecked")
    public HashMap<String, Object> get(String skey, String svalue) throws Throwable {
        return (HashMap<String, Object>)obj.callMethod("get", skey, svalue);
    }

    //! returns the value of multiple keys in the @ref sensitive_data "sensitive data hash" for the given alias
    /** @par Example:
        @code{.java}
SensitiveDataHelper sdh = new SensitiveDataHelper();
try {
    // get the tax number and address for the person
    HashMap<String, Object> hm = sdh.getFromAlias(alias, "tax_number", "address_city");
} finally {
    sdh.release();
}
        @endcode

        @param alias the alias to lookup; if the alias is unknown, an \c INVALID-ALIAS exception is raised
        @param keys multiple string key fields to return

        @return a hash of the requested keys

        @throw INVALID-ALIAS thrown for invalid aliases

        @note this method is equivalent to @ref WorkflowApi.getSensitiveData()
    */
    @SuppressWarnings("unchecked")
    public HashMap<String, Object> getFromAlias(String alias, String... keys) throws Throwable {
        return (HashMap<String, Object>)obj.callMethod("getFromAlias", alias, (Object)keys);
    }

    //! returns the value of a single key in the @ref sensitive_data "sensitive data hash" for the given alias
    /** @par Example:
        @code{.java}
SensitiveDataHelper sdh = new SensitiveDataHelper();
try {
    // get the tax number for the person
    String tax_number = (String)sdh.getFromAlias(alias, "tax_number");
} finally {
    sdh.release();
}
        @endcode

        @param alias the alias to lookup; if the alias is unknown, an \c INVALID-ALIAS exception is raised
        @param key a string key field to return

        @return the value of the requested key

        @throw INVALID-ALIAS thrown for invalid aliases

        @note this method is equivalent to @ref WorkflowApi.getSensitiveData()
    */
    public Object getFromAlias(String alias, String key) throws Throwable {
        return obj.callMethod("getFromAlias", alias, key);
    }

    //! returns the value of the entire @ref sensitive_data "sensitive data hash" for the given alias
    /** @par Example:
        @code{.java}
SensitiveDataHelper sdh = new SensitiveDataHelper();
try {
    // get the entire sensitive data hash for the person
    HashMap<String, Object> hm = sdh.getFromAlias(alias);
} finally {
    sdh.release();
}
        @endcode

        @param alias the alias to lookup; if the alias is unknown, an \c INVALID-ALIAS exception is raised

        @return a hash of the requested keys

        @throw INVALID-ALIAS thrown for invalid aliases

        @note this method is equivalent to @ref WorkflowApi.getSensitiveData()
    */
    @SuppressWarnings("unchecked")
    public HashMap<String, Object> getFromAlias(String alias) throws Throwable {
        return (HashMap<String, Object>)obj.callMethod("getFromAlias", alias);
    }

    //! Returns the sensitive metadata hash for the given sensitive data key and value if present, otherwise returns an empty hash
    /** @par Example:
        @code{.java}
SensitiveDataHelper sdh = new SensitiveDataHelper();
try {
    // get the metadata for the person
    HashMap<String, Object> metadata = sdh.getMetadata("personal_id", personal_id);
} finally {
    sdh.release();
}
        @endcode

        @param skey the type of sensitive key provided in \a svalue
        @param svalue the value of the sensitive data key identified by \a skey

        @return the sensitive metadata hash stored according to the sensitive data key and value; if no such sensitive
        key and value exist for the order, or no metadata is present for the given sensitive key and value, then an empty hash is returned

        @note
        - returns sensitive data; take care not to log any of the data returned by this function
        - equivalent to @ref WorkflowApi.getSensitiveMetadata()

        @see
        - @ref SensitiveDataHelper::getMetadataFromAlias()
        - @ref sensitive_data
        - @ref WorkflowApi.getSensitiveMetadata()
        - @ref wf_get_sensitive_metadata()
    */
    @SuppressWarnings("unchecked")
    public HashMap<String, Object> getMetadata(String skey, String svalue) throws Throwable {
        return (HashMap<String, Object>)obj.callMethod("getMetadata", skey, svalue);
    }

    //! Returns the sensitive metadata hash for the given sensitive data alias
    /** @par Example:
        @code{.java}
SensitiveDataHelper sdh = new SensitiveDataHelper();
try {
    // get the metadata for the person
    HashMap<String, Object> metadata = sdh.getMetadata("personal_id", personal_id);
} finally {
    sdh.release();
}
        @endcode

        @param alias the alias to lookup; if the alias is unknown, an \c INVALID-ALIAS exception is raised

        @return the sensitive metadata hash stored according to the sensitive data alias

        @throw INVALID-ALIAS thrown for invalid aliases

        @note
        - returns sensitive data; take care not to log any of the data returned by this function
        - equivalent to @ref WorkflowApi.getSensitiveMetadataFromAlias()

        @see
        - @ref SensitiveDataHelper::getMetadata()
        - @ref sensitive_data
        - @ref WorkflowApi.getSensitiveMetadataFromAlias()
        - @ref wf_get_sensitive_metadata_from_alias()
    */
    @SuppressWarnings("unchecked")
    public HashMap<String, Object> getMetadataFromAlias(String alias) throws Throwable {
        return (HashMap<String, Object>)obj.callMethod("getMetadataFromAlias", alias);
    }

    //! returns a hash of all sensitive data aliases for the current order or an empty hash if there are none
    /** @par Example:
        @code{.java}
SensitiveDataHelper sdh = new SensitiveDataHelper();
try {
    // get the aliases for sensitive data for this order
    HashMap<String, Object> ah = sdh.getAliases();
} finally {
    sdh.release();
}
        @endcode

        @return a hash of all sensitive data aliases for the current order or an empty hash if there are none,
        otherwise keys are alias names and values are hashes with the following keys:
        - \c skey: (@ref string_type "string") the sensitive data key type
        - \c svalue: (@ref string_type "string") the sensitive data value (considered sensitive itself)

        @note
        - returns sensitive data; take care not to log any of the sensitive data returned by this function
        - this method is equivalent to @ref WorkflowApi.getSensitiveDataAliases()
    */
    @SuppressWarnings("unchecked")
    public HashMap<String, Object> getAliases() throws Throwable {
        return (HashMap<String, Object>)obj.callMethod("getAliases");
    }

    //! Returns a hash of sensitive data keys and values saved against the order; the sensitive data hashes themselves are not returned, just the information used to index sensitive data against the order
    /** @par Example:
        @code{.py}
SensitiveDataHelper sdh = new SensitiveDataHelper();
try {
    HashMap<String, Object> h = sdh.getKeyValues();
} finally {
    sdh.release();
}
        @endcode

        @return a hash of sensitive data keys and values saved against the order; the sensitive data hashes
        themselves are not returned, just the information used to index sensitive data against the order; if
        no sensitive data is stored against the order, an empty hash is returned

        @note returns sensitive data; sensitive data values should not be logged

        @see
        - @ref sensitive_data
        - @ref WorkflowApi.getSensitiveDataKeyValues()
    */
    @SuppressWarnings("unchecked")
    public HashMap<String, Object> getKeyValues() throws Throwable {
        return (HashMap<String, Object>)obj.callMethod("getKeyValues");
    }

    //! replaces @ref sensitive_data "sensitive data" for the sensitive key value given; the data has already been committed to the database when the method returns
    /** @par Example:
        @code{.java}
SensitiveDataHelper sdh = new SensitiveDataHelper();
try {
    // replace sensitive data for the person
    sdh.replace("personal_id", h.personal_id, replacement_hash);
} finally {
    sdh.release();
}
        @endcode

        @param skey the type of value provided in \a svalue; must not be longer than 100 bytes long or a
        \c SENSITIVE-DATA-ERROR exception is raised
        @param svalue the value of the sensitive data key identified by \a skey; if this string is empty
        or longer than 100 bytes, a \c SENSITIVE-DATA-ERROR exception is raised
        @param new_data the data to use to replace the sensitive data hash for the given sensitive data
        key and value
        @param aliases zero or more aliases for the sensitive key value given
        @param meta optional sensitve data metadata with the following recommended keys:
        - \c PURPOSE: free-form information about the purpose of the sensitive data
        - \c CATEGORIES: free-form information about the categories of sensitive data
        - \c RECIPIENTS: free-form information about the recipients or recipient catories of sensitive data
        - \c STORAGE: free-form information about the storage time or rules for sensitive data

        @throw SENSITIVE-DATA-ERROR no sensitive key value was provided; sensitive key or alias value too
        long (100 bytes maximum length in the encoding used by the system schema)

        @note
        - there is currently no function equivalent to this method for
          @ref sensitive_data "sensitive dynamic data"; this method replaces all the sensitive data for the
          given sensitive key and value
        - the metadata keys listed above are recommended for consistency's sake but are not checked; a hash
          with any keys can be stored with this API
        - the use of this method causes SQL I/O to be performed in the system schema; to maximize performance,
          calls to this and other similar methods should be minimized if possible
        - this method only replaces sensitive data for a single sensitive data key and value, for a method
          that replaces sensitive data for multiple sensitive data keys and values in a single transaction,
          see @ref replaceMulti()
        - use @ref replaceMulti() when replacing sensitive data for more than one key and value at a time
          as it is more efficient from a database transaction I/O point of view
    */
    public void replace(String skey, String svalue, HashMap<String, Object> new_data, String[] aliases, HashMap<String, Object> meta) throws Throwable {
        obj.callMethod("replace", skey, svalue, new_data, aliases, meta);
    }

    //! replaces @ref sensitive_data "sensitive data" for the sensitive key value given; the data has already been committed to the database when the method returns
    /** @par Example:
        @code{.java}
SensitiveDataHelper sdh = new SensitiveDataHelper();
try {
    // replace sensitive data for the person
    sdh.replace("personal_id", h.personal_id, replacement_hash);
} finally {
    sdh.release();
}
        @endcode

        @param skey the type of value provided in \a svalue; must not be longer than 100 bytes long or a
        \c SENSITIVE-DATA-ERROR exception is raised
        @param svalue the value of the sensitive data key identified by \a skey; if this string is empty
        or longer than 100 bytes, a \c SENSITIVE-DATA-ERROR exception is raised
        @param new_data the data to use to replace the sensitive data hash for the given sensitive data
        key and value
        @param aliases zero or more aliases for the sensitive key value given

        @throw SENSITIVE-DATA-ERROR no sensitive key value was provided; sensitive key or alias value too
        long (100 bytes maximum length in the encoding used by the system schema)

        @note
        - there is currently no function equivalent to this method for
          @ref sensitive_data "sensitive dynamic data"; this method replaces all the sensitive data for the
          given sensitive key and value
        - the metadata keys listed above are recommended for consistency's sake but are not checked; a hash
          with any keys can be stored with this API
        - the use of this method causes SQL I/O to be performed in the system schema; to maximize performance,
          calls to this and other similar methods should be minimized if possible
        - this method only replaces sensitive data for a single sensitive data key and value, for a method
          that replaces sensitive data for multiple sensitive data keys and values in a single transaction,
          see @ref replaceMulti()
        - use @ref replaceMulti() when replacing sensitive data for more than one key and value at a time
          as it is more efficient from a database transaction I/O point of view
    */
    public void replace(String skey, String svalue, HashMap<String, Object> new_data, String[] aliases) throws Throwable {
        obj.callMethod("replace", skey, svalue, new_data, aliases);
    }

    //! replaces @ref sensitive_data "sensitive data" for the sensitive key value given; the data has already been committed to the database when the method returns
    /** @par Example:
        @code{.java}
SensitiveDataHelper sdh = new SensitiveDataHelper();
try {
    // replace sensitive data for the person
    sdh.replace("personal_id", h.personal_id, replacement_hash);
} finally {
    sdh.release();
}
        @endcode

        @param skey the type of value provided in \a svalue; must not be longer than 100 bytes long or a
        \c SENSITIVE-DATA-ERROR exception is raised
        @param svalue the value of the sensitive data key identified by \a skey; if this string is empty
        or longer than 100 bytes, a \c SENSITIVE-DATA-ERROR exception is raised
        @param new_data the data to use to replace the sensitive data hash for the given sensitive data
        key and value

        @throw SENSITIVE-DATA-ERROR no sensitive key value was provided; sensitive key or alias value too
        long (100 bytes maximum length in the encoding used by the system schema)

        @note
        - there is currently no function equivalent to this method for
          @ref sensitive_data "sensitive dynamic data"; this method replaces all the sensitive data for the
          given sensitive key and value
        - the metadata keys listed above are recommended for consistency's sake but are not checked; a hash
          with any keys can be stored with this API
        - the use of this method causes SQL I/O to be performed in the system schema; to maximize performance,
          calls to this and other similar methods should be minimized if possible
        - this method only replaces sensitive data for a single sensitive data key and value, for a method
          that replaces sensitive data for multiple sensitive data keys and values in a single transaction,
          see @ref replaceMulti()
        - use @ref replaceMulti() when replacing sensitive data for more than one key and value at a time
          as it is more efficient from a database transaction I/O point of view
    */
    public void replace(String skey, String svalue, HashMap<String, Object> new_data) throws Throwable {
        obj.callMethod("replace", skey, svalue, new_data);
    }

    //! replaces @ref sensitive_data "sensitive data" for one more more sensitive key values given; the data has already been committed to the database when the method returns
    /** @par Example:
        @code{.java}
SensitiveDataHelper sdh = new SensitiveDataHelper();
try {
    // replace sensitive data for a single person
    HashMap<String, Object><String, Object> pinfo = new HashMap<String, Object><String, Object>() {
        {
            put("data", new_sensitive_data_hash);
        }
    };
    // set up a hash keyed by sensitive data value
    HashMap<String, Object><String, Object> sdinfo = new HashMap<String, Object><String, Object>() {
        {
            put(personal_id, pinfo);
        }
    };
    // set up a hash keyed by the sensitive data key name
    HashMap<String, Object><String, Object> sinfo = new HashMap<String, Object><String, Object> () {
        {
            put("personal_id", sdinfo);
        }
    };
    sdh.replaceMulti(sinfo);
} finally {
    sdh.release();
}
        @endcode


        @param sinfo a hash keyed by sensitive data key, where each value is a hash keyed by sensitive data value,
        where each value of that hash is a @ref OMQ::SensitiveDataInfo "SensitiveDataInfo" hash giving the sensitive
        information for the given sensitive data key and value

        @throw SENSITIVE-DATA-ERROR no sensitive key value was provided; sensitive key or alias value too long
        (100 bytes maximum length in the encoding used by the system schema)

        @note
        - there is currently no function equivalent to this method for @ref sensitive_data "sensitive dynamic data";
          this method replaces all the sensitive data for the given sensitive keys and values
        - metadata keys are not checked; a hash with any metadata keys can be stored with this API
        - the use of this method causes SQL I/O to be performed in the system schema; to maximize performance, calls
          io this and other similar methods should be minimized if possible
        - this method replaces sensitive data for multiple sensitive data keys and values in a single transaction and
          therefore is preferred when updating multiple sensitive data elements over @ref replace()

        @since Qorus 3.1.1.p1
    */
    public void replaceMulti(HashMap<String, Object> sinfo) throws Throwable {
        obj.callMethod("replaceMulti", sinfo);
    }

    //! replaces @ref sensitive_data "sensitive data" for the sensitive alias given; the data has already been committed to the database when the method returns
    /** @par Example:
        @code{.java}
SensitiveDataHelper sdh = new SensitiveDataHelper();
try {
    sdh.replaceWithAlias(alias, new_sensitive_data);
} finally {
    sdh.release();
}
        @endcode

        @param alias the sensitive data alias; must be an existing alias or an \c INVALID-ALIAS exception is raised
        @param new_data the data to use to replace the sensitive data hash for the given sensitive data alias
        @param meta optional sensitve data metadata with the following recommended keys:
        - \c PURPOSE: free-form information about the purpose of the sensitive data
        - \c CATEGORIES: free-form information about the categories of sensitive data
        - \c RECIPIENTS: free-form information about the recipients or recipient catories of sensitive data
        - \c STORAGE: free-form information about the storage time or rules for sensitive data

        @throw INVALID-ALIAS the given alias is unknown

        @note
        - there is currently no function equivalent to this method for @ref sensitive_data "sensitive dynamic data";
          this method replaces all the sensitive data for the given sensitive key and value
        - the metadata keys listed above are recommended for consistency's sake but are not checked; a hash with any
          keys can be stored with this API
        - the use of this method causes SQL I/O to be performed in the system schema; to maximize performance, calls
          to this and other similar methods should be minimized if possible
    */
    public void replaceFromAlias(String alias, HashMap<String, Object> new_data, HashMap<String, Object> meta) throws Throwable {
        obj.callMethod("replaceFromAlias", alias, new_data, meta);
    }

    //! replaces @ref sensitive_data "sensitive data" for the sensitive alias given; the data has already been committed to the database when the method returns
    /** @par Example:
        @code{.java}
SensitiveDataHelper sdh = new SensitiveDataHelper();
try {
    sdh.replaceWithAlias(alias, new_sensitive_data);
} finally {
    sdh.release();
}
        @endcode

        @param alias the sensitive data alias; must be an existing alias or an \c INVALID-ALIAS exception is raised
        @param new_data the data to use to replace the sensitive data hash for the given sensitive data alias

        @throw INVALID-ALIAS the given alias is unknown

        @note
        - there is currently no function equivalent to this method for @ref sensitive_data "sensitive dynamic data";
          this method replaces all the sensitive data for the given sensitive key and value
        - the metadata keys listed above are recommended for consistency's sake but are not checked; a hash with any
          keys can be stored with this API
        - the use of this method causes SQL I/O to be performed in the system schema; to maximize performance, calls
          to this and other similar methods should be minimized if possible
    */
    public void replaceFromAlias(String alias, HashMap<String, Object> new_data) throws Throwable {
        obj.callMethod("replaceFromAlias", alias, new_data);
    }

    //! clears @ref sensitive_data "sensitive data" for the sensitive alias given; the data has already been committed to the database when the method returns
    /** @par Example:
        @code{.java}
SensitiveDataHelper sdh = new SensitiveDataHelper();
try {
    sdh.replaceWithAlias(alias);
} finally {
    sdh.release();
}
        @endcode

        @param alias the sensitive data alias; must be an existing alias or an \c INVALID-ALIAS exception is raised

        @throw INVALID-ALIAS the given alias is unknown

        @note
        - there is currently no function equivalent to this method for @ref sensitive_data "sensitive dynamic data";
          this method replaces all the sensitive data for the given sensitive key and value
        - the metadata keys listed above are recommended for consistency's sake but are not checked; a hash with any
          keys can be stored with this API
        - the use of this method causes SQL I/O to be performed in the system schema; to maximize performance, calls
          to this and other similar methods should be minimized if possible
    */
    public void replaceFromAlias(String alias) throws Throwable {
        obj.callMethod("replaceFromAlias", alias);
    }

    //! Updates or creates the values of one or more keys in the workflow order's sensitive data hash for the given sensitive data key and value; the data has already been committed to the database when the method returns
    /** @par Example:
        @code{.java}
SensitiveDataHelper sdh = new SensitiveDataHelper();
try {
    sdh.update("personal_id", h.person.personal_id, h);
} finally {
    sdh.release();
}
        @endcode

        @param skey the type of value provided in \a svalue; must not be longer than 100 bytes long or a
        \c SENSITIVE-DATA-ERROR exception is raised
        @param svalue the value of the sensitive data key identified by \a skey; if this string is empty or longer than
        100 bytes, a \c SENSITIVE-DATA-ERROR exception is raised
        @param new_data the data to create or update against \a skey; existing keys will be replaced; new keys will be
        added; if the new hash does not refer to existing keys, then those existing keys remain untouched
        @param aliases zero or more string aliases for the sensitive key and value given
        @param meta optional sensitve data metadata with the following recommended keys:
        - \c PURPOSE: free-form information about the purpose of the sensitive data
        - \c CATEGORIES: free-form information about the categories of sensitive data
        - \c RECIPIENTS: free-form information about the recipients or recipient categories of sensitive data
        - \c STORAGE: free-form information about the storage time or rules for sensitive data

        @throw SENSITIVE-DATA-ERROR no sensitive key value was provided; sensitive key or alias value too long (100 bytes
        maximum length in the encoding used by the system schema)

        @note
        - do not use sensitive data for the sensitive key names itself (\a skey) or alias(es) (\a aliases); key names and
        aliases may be logged to provide an audit trail of changes to sensitive data
        - metadata keys listed above for the \a meta argument are recommended for consistency's sake but are not checked;
        a hash with any keys can be stored with this API
        - the use of this method causes SQL I/O to be performed in the system schema; to maximize performance, calls to
        this and other similar methods should be minimized if possible

        @see
            - @ref sensitive_data
            - @ref WorkflowApi.updateSensitiveData()
    */
    public void update(String skey, String svalue, HashMap<String, Object> new_data, String[] aliases, HashMap<String, Object> meta) throws Throwable {
        obj.callMethod("update", skey, svalue, new_data, aliases, meta);
    }

    //! Updates or creates the values of one or more keys in the workflow order's sensitive data hash for the given sensitive data key and value; the data has already been committed to the database when the method returns
    /** @par Example:
        @code{.java}
SensitiveDataHelper sdh = new SensitiveDataHelper();
try {
    sdh.update("personal_id", h.person.personal_id, h);
} finally {
    sdh.release();
}
        @endcode

        @param skey the type of value provided in \a svalue; must not be longer than 100 bytes long or a
        \c SENSITIVE-DATA-ERROR exception is raised
        @param svalue the value of the sensitive data key identified by \a skey; if this string is empty or longer than
        100 bytes, a \c SENSITIVE-DATA-ERROR exception is raised
        @param new_data the data to create or update against \a skey; existing keys will be replaced; new keys will be
        added; if the new hash does not refer to existing keys, then those existing keys remain untouched
        @param aliases zero or more string aliases for the sensitive key and value given

        @throw SENSITIVE-DATA-ERROR no sensitive key value was provided; sensitive key or alias value too long (100 bytes
        maximum length in the encoding used by the system schema)

        @note
        - do not use sensitive data for the sensitive key names itself (\a skey) or alias(es) (\a aliases); key names and
        aliases may be logged to provide an audit trail of changes to sensitive data
        - metadata keys listed above for the \a meta argument are recommended for consistency's sake but are not checked;
        a hash with any keys can be stored with this API
        - the use of this method causes SQL I/O to be performed in the system schema; to maximize performance, calls to
        this and other similar methods should be minimized if possible

        @see
            - @ref sensitive_data
            - @ref WorkflowApi.updateSensitiveData()
    */
    public void update(String skey, String svalue, HashMap<String, Object> new_data, String[] aliases) throws Throwable {
        obj.callMethod("update", skey, svalue, new_data, aliases);
    }

    //! Updates or creates the values of one or more keys in the workflow order's sensitive data hash for the given sensitive data key and value; the data has already been committed to the database when the method returns
    /** @par Example:
        @code{.java}
SensitiveDataHelper sdh = new SensitiveDataHelper();
try {
    sdh.update("personal_id", h.person.personal_id, h);
} finally {
    sdh.release();
}
        @endcode

        @param skey the type of value provided in \a svalue; must not be longer than 100 bytes long or a
        \c SENSITIVE-DATA-ERROR exception is raised
        @param svalue the value of the sensitive data key identified by \a skey; if this string is empty or longer than
        100 bytes, a \c SENSITIVE-DATA-ERROR exception is raised
        @param new_data the data to create or update against \a skey; existing keys will be replaced; new keys will be
        added; if the new hash does not refer to existing keys, then those existing keys remain untouched

        @throw SENSITIVE-DATA-ERROR no sensitive key value was provided; sensitive key or alias value too long (100 bytes
        maximum length in the encoding used by the system schema)

        @note
        - do not use sensitive data for the sensitive key names itself (\a skey) or alias(es) (\a aliases); key names and
        aliases may be logged to provide an audit trail of changes to sensitive data
        - metadata keys listed above for the \a meta argument are recommended for consistency's sake but are not checked;
        a hash with any keys can be stored with this API
        - the use of this method causes SQL I/O to be performed in the system schema; to maximize performance, calls to
        this and other similar methods should be minimized if possible

        @see
            - @ref sensitive_data
            - @ref WorkflowApi.updateSensitiveData()
    */
    public void update(String skey, String svalue, HashMap<String, Object> new_data) throws Throwable {
        obj.callMethod("update", skey, svalue, new_data);
    }

    //! Clears the values of one or more keys in the workflow order's sensitive data hash for the given sensitive data key and value; the data has already been committed to the database when the method returns
    /** @par Example:
        @code{.java}
SensitiveDataHelper sdh = new SensitiveDataHelper();
try {
    sdh.update("personal_id", h.person.personal_id);
} finally {
    sdh.release();
}
        @endcode

        @param skey the type of value provided in \a svalue; must not be longer than 100 bytes long or a
        \c SENSITIVE-DATA-ERROR exception is raised
        @param svalue the value of the sensitive data key identified by \a skey; if this string is empty or longer than
        100 bytes, a \c SENSITIVE-DATA-ERROR exception is raised

        @throw SENSITIVE-DATA-ERROR no sensitive key value was provided; sensitive key or alias value too long (100 bytes
        maximum length in the encoding used by the system schema)

        @note
        - do not use sensitive data for the sensitive key names itself (\a skey) or alias(es) (\a aliases); key names and
        aliases may be logged to provide an audit trail of changes to sensitive data
        - metadata keys listed above for the \a meta argument are recommended for consistency's sake but are not checked;
        a hash with any keys can be stored with this API
        - the use of this method causes SQL I/O to be performed in the system schema; to maximize performance, calls to
        this and other similar methods should be minimized if possible

        @see
            - @ref sensitive_data
            - @ref WorkflowApi.updateSensitiveData()
    */
    public void update(String skey, String svalue) throws Throwable {
        obj.callMethod("update", skey, svalue);
    }

    //! Updates or creates the values of one or more keys in the workflow order's sensitive data hash for the given sensitive data alias; the data has already been committed to the database when the method returns
    /** @par Example:
        @code{.java}
SensitiveDataHelper sdh = new SensitiveDataHelper();
try {
    sdh.updateFromAlias(alias, h);
} finally {
    sdh.release();
}
        @endcode

        @param alias the sensitive data alias; must be an existing alias or an \c INVALID-ALIAS exception is raised
        @param new_data the data to create or update against \a skey; existing keys will be replaced; new keys will
        be added; if the new hash does not refer to existing keys, then those existing keys remain untouched
        @param meta optional sensitve data metadata with the following recommended keys:
        - \c PURPOSE: free-form information about the purpose of the sensitive data
        - \c CATEGORIES: free-form information about the categories of sensitive data
        - \c RECIPIENTS: free-form information about the recipients or recipient categories of sensitive data
        - \c STORAGE: free-form information about the storage time or rules for sensitive data

        @throw INVALID-ALIAS the given alias is unknown

        @note
        - do not use sensitive data for the sensitive data alias value; alias values can be logged to provide an audit
          trail of changes to sensitive data
        - metadata keys listed above for the \a meta argument are recommended for consistency's sake but are not
          checked; a hash with any keys can be stored with this API
        - the use of this method causes SQL I/O to be performed in the system schema; to maximize performance, calls
          to this and other similar methods should be minimized if possible

        @see
        - @ref sensitive_data
        - @ref WorkflowApi.updateSensitiveData()
    */
    public void updateFromAlias(String alias, HashMap<String, Object> new_data, HashMap<String, Object> meta) throws Throwable {
        obj.callMethod("updateFromAlias", alias, new_data, meta);
    }

    //! Updates or creates the values of one or more keys in the workflow order's sensitive data hash for the given sensitive data alias; the data has already been committed to the database when the method returns
    /** @par Example:
        @code{.java}
SensitiveDataHelper sdh = new SensitiveDataHelper();
try {
    sdh.updateFromAlias(alias, h);
} finally {
    sdh.release();
}
        @endcode

        @param alias the sensitive data alias; must be an existing alias or an \c INVALID-ALIAS exception is raised
        @param new_data the data to create or update against \a skey; existing keys will be replaced; new keys will
        be added; if the new hash does not refer to existing keys, then those existing keys remain untouched

        @throw INVALID-ALIAS the given alias is unknown

        @note
        - do not use sensitive data for the sensitive data alias value; alias values can be logged to provide an audit
          trail of changes to sensitive data
        - metadata keys listed above for the \a meta argument are recommended for consistency's sake but are not
          checked; a hash with any keys can be stored with this API
        - the use of this method causes SQL I/O to be performed in the system schema; to maximize performance, calls
          to this and other similar methods should be minimized if possible

        @see
        - @ref sensitive_data
        - @ref WorkflowApi.updateSensitiveData()
    */
    public void updateFromAlias(String alias, HashMap<String, Object> new_data) throws Throwable {
        obj.callMethod("updateFromAlias", alias, new_data);
    }

    //! Clears the values of one or more keys in the workflow order's sensitive data hash for the given sensitive data alias; the data has already been committed to the database when the method returns
    /** @par Example:
        @code{.java}
SensitiveDataHelper sdh = new SensitiveDataHelper();
try {
    sdh.updateFromAlias(alias);
} finally {
    sdh.release();
}
        @endcode

        @param alias the sensitive data alias; must be an existing alias or an \c INVALID-ALIAS exception is raised

        @throw INVALID-ALIAS the given alias is unknown

        @note
        - do not use sensitive data for the sensitive data alias value; alias values can be logged to provide an audit
          trail of changes to sensitive data
        - metadata keys listed above for the \a meta argument are recommended for consistency's sake but are not
          checked; a hash with any keys can be stored with this API
        - the use of this method causes SQL I/O to be performed in the system schema; to maximize performance, calls
          to this and other similar methods should be minimized if possible

        @see
        - @ref sensitive_data
        - @ref WorkflowApi.updateSensitiveData()
    */
    public void updateFromAlias(String alias) throws Throwable {
        obj.callMethod("updateFromAlias", alias);
    }

    //! Deletes one or more keys from the workflow order data instance’s sensitive data hash for the given sensitive data key and value; the changes have already been committed to the database when the method returns
    /** @par Example:
        @code{.java}
SensitiveDataHelper sdh = new SensitiveDataHelper();
try {
    // delete the "tax_number" and "insurance_number" keys from the sensitive data hash for the given person
    sdh.deleteKey("personal_id", personal_id, "tax_number", "insurance_number");
} finally {
    sdh.release();
}
        @endcode

        @param skey the type of sensitive key provided in \a svalue
        @param svalue the value of the sensitive data key identified by \a skey
        @param keys a single key or a list of keys to delete in the workflow order's sensitive data hash for the given
        sensitive key-value pair

        @return true if the data existed and was deleted, false if no data was
        deleted

        @note
        - equivalent to @ref WorkflowApi.deleteSensitiveDataKey()
        - the use of this method causes SQL I/O to be performed in the system schema; to maximize performance, calls
          to this and other similar methods should be minimized if possible

        @see
        - @ref sensitive_data
        - @ref WorkflowApi.deleteSensitiveDataKey()
    */
    public void deleteKey(String skey, String svalue, String... keys) throws Throwable {
        obj.callMethod("deleteKey", skey, svalue, (Object)keys);
    }

    //! Deletes the sensitive data hash for the given sensitive data key and value; the changes have already been committed to the database when the method returns
    /** @par Example:
        @code{.java}
SensitiveDataHelper sdh = new SensitiveDataHelper();
try {
    sdh.del("personal_id", personal_id);
} finally {
    sdh.release();
}
        @endcode

        @param skey the type of sensitive key provided in \a svalue
        @param svalue the value of the sensitive data key identified by \a skey

        @return true if the data existed and was deleted, false if no such
        sensitive data key and value were present in the order

        @note
        - equivalent to @ref WorkflowApi.deleteSensitiveData()
        - the use of this method causes SQL I/O to be performed in the system schema; to maximize performance, calls
          to this and other similar methods should be minimized if possible

        @see
        - @ref sensitive_data
        - @ref WorkflowApi.deleteSensitiveData()
    */
    public boolean del(String skey, String svalue) throws Throwable {
        return (boolean)obj.callMethod("del", skey, svalue);
    }
}