// name: SeplLib
// version: 1.0
// desc: SEPL Java library class
// author: Qore Technologies, s.r.o.
// lang: java
package com.hutchison.gsi.lib;

import org.qore.jni.QoreJavaApi;

import com.qoretechnologies.qorus.UserApi;

import org.qore.lang.DatasourcePool;

public class SeplLib {
    static public Object getConf(String key, Object value) throws Throwable {
        return QoreJavaApi.callFunction("sepl_getconf", key, value);
    }

    static public String getConf(String key, String value) throws Throwable {
        return (String)QoreJavaApi.callFunction("sepl_getconf", key, value);
    }

    static public boolean getConf(String key, boolean value) throws Throwable {
        Object rv = QoreJavaApi.callFunction("sepl_getconf", key, value);
        return rv instanceof Boolean
            ? (boolean)rv
            : (boolean)QoreJavaApi.callFunction("boolean", rv);
    }

    static public int getConf(String key, int value) throws Throwable {
        Object rv = QoreJavaApi.callFunction("sepl_getconf", key, value);
        if (rv instanceof Integer) {
            return (int)rv;
        }
        return (int)QoreJavaApi.callFunction("int", rv);
    }

    static public DatasourcePool getDsp(String name) throws Throwable {
        return UserApi.getDatasourcePool(getConf(name, name));
    }
}
// END

