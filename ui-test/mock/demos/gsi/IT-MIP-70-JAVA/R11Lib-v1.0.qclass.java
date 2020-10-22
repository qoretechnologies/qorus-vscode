// name: R11Lib
// version: 1.0
// desc: SEPL Java library class for MIP 70
// author: Qore Technologies, s.r.o.
// lang: java
// requires: SeplLib
package com.hutchison.gsi.lib;

import org.qore.jni.QoreJavaApi;

import com.hutchison.gsi.lib.SeplLib;

public class R11Lib extends SeplLib {
    static public String getTableName(String name) throws Throwable {
        if (getConf("r11_no_schema_prefix", false)) {
            return name;
        }
        return "h3g." + name;
    }
}
// END

