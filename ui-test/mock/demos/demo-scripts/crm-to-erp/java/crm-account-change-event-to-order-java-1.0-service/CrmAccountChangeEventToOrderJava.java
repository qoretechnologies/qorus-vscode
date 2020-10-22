import com.qoretechnologies.qorus.*;
import com.qoretechnologies.qorus.service.*;
import org.qore.jni.QoreJavaApi;
import org.qore.jni.QoreObject;
import java.util.Map;
import org.qore.jni.Hash;
import java.lang.reflect.Method;
import org.qore.lang.mapper.Mapper;

class CrmAccountChangeEventToOrderJava extends QorusService {
    // ==== GENERATED SECTION! DON'T EDIT! ==== //
    ClassConnections_CrmAccountChangeEventToOrderJava classConnections;
    // ======== GENERATED SECTION END ========= //

    CrmAccountChangeEventToOrderJava() throws Throwable {
        // ==== GENERATED SECTION! DON'T EDIT! ==== //
        classConnections = new ClassConnections_CrmAccountChangeEventToOrderJava();
        // ======== GENERATED SECTION END ========= //
    }

    public void init() throws Throwable {
    }
}

// ==== GENERATED SECTION! DON'T EDIT! ==== //
class ClassConnections_CrmAccountChangeEventToOrderJava implements Observer { // has to inherit Observer because there is an event-based connector
    // map of prefixed class names to class instances
    private final Hash classMap;

    ClassConnections_CrmAccountChangeEventToOrderJava() throws Throwable {
        UserApi.startCapturingObjects();
        classMap = new Hash();
        classMap.put("BBM_SalesforceStreamBase", QoreJavaApi.newObjectSave("BBM_SalesforceStreamBase"));
        classMap.put("BBM_CreateOrder", QoreJavaApi.newObjectSave("BBM_CreateOrder"));
        UserApi.stopCapturingObjects();

        // register observers
        callClassWithPrefixMethod("BBM_SalesforceStreamBase", "registerObserver", this);
    }

    Object callClassWithPrefixMethod(final String prefixedClass, final String methodName,
                                     Object params) throws Throwable {
        UserApi.logDebug("ClassConnections_CrmAccountChangeEventToOrderJava: callClassWithPrefixMethod: method: %s, class: %y", methodName, prefixedClass);
        final Object object = classMap.get(prefixedClass);

        if (object instanceof QoreObject) {
            QoreObject qoreObject = (QoreObject)object;
            return qoreObject.callMethod(methodName, params);
        } else {
            final Method method = object.getClass().getMethod(methodName, Object.class);
            return method.invoke(object, params);
        }
    }

    // override Observer's update()
    public void update(String id, Map<String, Object> params) throws Throwable {
        if (id.equals("BBM_SalesforceStreamBase::messageCallbackImpl")) {
            Connection_1(params);
        }
    }

    public Object Connection_1(Object params) throws Throwable {
        Mapper mapper;
        UserApi.logDebug("Connection_1 called with data: %y", params);

        mapper = UserApi.getMapper("crm-account-change-event-to-order-mapper");
        params = mapper.mapAuto(params);

        UserApi.logDebug("calling createOrder: %y", params);
        return callClassWithPrefixMethod("BBM_CreateOrder", "createWorkflowOrderConnector", params);
    }
}
// ======== GENERATED SECTION END ========= //
