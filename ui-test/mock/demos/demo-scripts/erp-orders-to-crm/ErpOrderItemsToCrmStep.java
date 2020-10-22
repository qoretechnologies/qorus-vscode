import com.qoretechnologies.qorus.*;
import com.qoretechnologies.qorus.workflow.*;
import org.qore.jni.QoreJavaApi;
import org.qore.jni.QoreObject;
import java.util.Map;
import org.qore.jni.Hash;
import java.lang.reflect.Method;

class ErpOrderItemsToCrmStep extends QorusNormalArrayStep {
    // ==== GENERATED SECTION! DON'T EDIT! ==== //
    ClassConnections_ErpOrderItemsToCrmStep classConnections;
    // ======== GENERATED SECTION END ========= //

    ErpOrderItemsToCrmStep() throws Throwable {
        // ==== GENERATED SECTION! DON'T EDIT! ==== //
        classConnections = new ClassConnections_ErpOrderItemsToCrmStep();
        // ======== GENERATED SECTION END ========= //
    }

    // ==== GENERATED SECTION! DON'T EDIT! ==== //
    public void primary(Object array_arg) throws Throwable {
        Hash params = new Hash();
        params.put("array_arg", array_arg);
        classConnections.primary(params);
    }

    public String validation(Object array_arg) throws Throwable {
        return OMQ.StatRetry;
    }

    public Object[] array() throws Throwable {
        return (Object[])classConnections.array(null);
    }
    // ======== GENERATED SECTION END ========= //
}

// ==== GENERATED SECTION! DON'T EDIT! ==== //
class ClassConnections_ErpOrderItemsToCrmStep {
    // map of prefixed class names to class instances
    private final Hash classMap;

    ClassConnections_ErpOrderItemsToCrmStep() throws Throwable {
        UserApi.startCapturingObjects();
        classMap = new Hash();
        classMap.put("BBM_GetArray", QoreJavaApi.newObjectSave("BBM_GetArray"));
        classMap.put("BBM_GetData", QoreJavaApi.newObjectSave("BBM_GetData"));
        classMap.put("BBM_GenericMapper", QoreJavaApi.newObjectSave("BBM_GenericMapper"));
        UserApi.stopCapturingObjects();
    }

    Object callClassWithPrefixMethod(final String prefixedClass, final String methodName,
                                     Object params) throws Throwable {
        UserApi.logDebug("ClassConnections_ErpOrderItemsToCrmStep: callClassWithPrefixMethod: method: %s, class: %y", methodName, prefixedClass);
        final Object object = classMap.get(prefixedClass);

        if (object instanceof QoreObject) {
            QoreObject qoreObject = (QoreObject)object;
            return qoreObject.callMethod(methodName, params);
        } else {
            final Method method = object.getClass().getMethod(methodName, Object.class);
            return method.invoke(object, params);
        }
    }

    public Object array(Object params) throws Throwable {
        UserApi.logDebug("array called with data: %y", params);

        UserApi.logDebug("calling getArray: %y", params);
        return callClassWithPrefixMethod("BBM_GetArray", "getArray", params);
    }

    public Object primary(Object params) throws Throwable {
        UserApi.logDebug("primary called with data: %y", params);

        UserApi.logDebug("calling getData: %y", params);
        params = callClassWithPrefixMethod("BBM_GetData", "getData", params);

        UserApi.logDebug("calling map: %y", params);
        return callClassWithPrefixMethod("BBM_GenericMapper", "genericMapper", params);
    }
}
// ======== GENERATED SECTION END ========= //
