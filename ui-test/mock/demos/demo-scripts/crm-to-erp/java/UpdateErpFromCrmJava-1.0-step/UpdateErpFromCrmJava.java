import com.qoretechnologies.qorus.*;
import com.qoretechnologies.qorus.workflow.*;
import org.qore.jni.QoreJavaApi;
import org.qore.jni.QoreObject;
import java.util.Map;
import org.qore.jni.Hash;
import java.lang.reflect.Method;

public class UpdateErpFromCrmJava extends QorusNormalStep {
    // ==== GENERATED SECTION! DON'T EDIT! ==== //
    ClassConnections_UpdateErpFromCrmJava classConnections;
    // ======== GENERATED SECTION END ========= //

    UpdateErpFromCrmJava() throws Throwable {
        // ==== GENERATED SECTION! DON'T EDIT! ==== //
        classConnections = new ClassConnections_UpdateErpFromCrmJava();
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
class ClassConnections_UpdateErpFromCrmJava {
    // map of prefixed class names to class instances
    private final Hash classMap;

    ClassConnections_UpdateErpFromCrmJava() throws Throwable {
        UserApi.startCapturingObjects();
        classMap = new Hash();
        classMap.put("BBM_DataProviderSearch", QoreJavaApi.newObjectSave("BBM_DataProviderSearch"));
        classMap.put("BBM_GenericMapper", QoreJavaApi.newObjectSave("BBM_GenericMapper"));
        UserApi.stopCapturingObjects();
    }

    Object callClassWithPrefixMethod(final String prefixedClass, final String methodName,
                                     Object params) throws Throwable {
        UserApi.logDebug("ClassConnections_UpdateErpFromCrmJava: callClassWithPrefixMethod: method: %s, class: %y", methodName, prefixedClass);
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
        UserApi.logDebug("Connection_1 called with data: %y", params);

        UserApi.logDebug("calling DataProvider Single Record Search: %y", params);
        params = callClassWithPrefixMethod("BBM_DataProviderSearch", "doSingleRecordSearchConnector", params);

        UserApi.logDebug("calling map: %y", params);
        return callClassWithPrefixMethod("BBM_GenericMapper", "genericMapper", params);
    }
}
// ======== GENERATED SECTION END ========= //
