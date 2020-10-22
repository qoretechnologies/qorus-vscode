import com.qoretechnologies.qorus.*;
import com.qoretechnologies.qorus.workflow.*;
import org.qore.jni.QoreJavaApi;
import org.qore.jni.QoreObject;
import java.util.Map;
import org.qore.jni.Hash;
import java.lang.reflect.Method;

class ErpOrdersToCrmStep extends QorusNormalStep {
    // ==== GENERATED SECTION! DON'T EDIT! ==== //
    ClassConnections_ErpOrdersToCrmStep classConnections;
    // ======== GENERATED SECTION END ========= //

    ErpOrdersToCrmStep() throws Throwable {
        // ==== GENERATED SECTION! DON'T EDIT! ==== //
        classConnections = new ClassConnections_ErpOrdersToCrmStep();
        // ======== GENERATED SECTION END ========= //
    }

    // ==== GENERATED SECTION! DON'T EDIT! ==== //
    public void primary() throws Throwable {
        classConnections.Connection_1(null);
    }

    public String validation() throws Throwable {
        return OMQ.StatRetry;
    }
    // ======== GENERATED SECTION END ========= //
}

// ==== GENERATED SECTION! DON'T EDIT! ==== //
class ClassConnections_ErpOrdersToCrmStep {
    // map of prefixed class names to class instances
    private final Hash classMap;

    ClassConnections_ErpOrdersToCrmStep() throws Throwable {
        UserApi.startCapturingObjects();
        classMap = new Hash();
        classMap.put("BBM_GenericMapper", QoreJavaApi.newObjectSave("BBM_GenericMapper"));
        UserApi.stopCapturingObjects();

    }

    Object callClassWithPrefixMethod(final String prefixedClass, final String methodName,
                                     Object params) throws Throwable {
        UserApi.logInfo("ClassConnections_ErpOrdersToCrmStep: callClassWithPrefixMethod: method: %s, class: %y", methodName, prefixedClass);
        final Object object = classMap.get(prefixedClass);

        if (object instanceof QoreObject) {
            QoreObject qoreObject = (QoreObject)object;
            return qoreObject.callMethod(methodName, params);
        } else {
            final Method method = object.getClass().getMethod(methodName, Object.class);
            return method.invoke(object, params);
        }
    }

    public Object Connection_1(Object params) throws Throwable {
        UserApi.logInfo("Connection_1 called with data: %y", params);

        UserApi.logInfo("calling map: %y", params);
        return callClassWithPrefixMethod("BBM_GenericMapper", "genericMapper", params);
    }
}
// ======== GENERATED SECTION END ========= //
