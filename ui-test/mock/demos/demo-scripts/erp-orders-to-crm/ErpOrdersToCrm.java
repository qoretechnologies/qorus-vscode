import com.qoretechnologies.qorus.*;
import com.qoretechnologies.qorus.job.*;
import org.qore.jni.QoreJavaApi;
import org.qore.jni.QoreObject;
import java.util.Map;
import org.qore.jni.Hash;
import java.lang.reflect.Method;
import org.qore.lang.mapper.Mapper;

class ErpOrdersToCrm extends QorusJob {
    // ==== GENERATED SECTION! DON'T EDIT! ==== //
    ClassConnections_ErpOrdersToCrm classConnections;
    // ======== GENERATED SECTION END ========= //

    ErpOrdersToCrm() throws Throwable {
        // ==== GENERATED SECTION! DON'T EDIT! ==== //
        classConnections = new ClassConnections_ErpOrdersToCrm();
        // ======== GENERATED SECTION END ========= //
    }

    // ==== GENERATED SECTION! DON'T EDIT! ==== //
    public void run() throws Throwable {
        classConnections.Connection_1(null);
    }
    // ======== GENERATED SECTION END ========= //
}

// ==== GENERATED SECTION! DON'T EDIT! ==== //
class ClassConnections_ErpOrdersToCrm {
    // map of prefixed class names to class instances
    private final Hash classMap;

    ClassConnections_ErpOrdersToCrm() throws Throwable {
        UserApi.startCapturingObjects();
        classMap = new Hash();
        classMap.put("BBM_DataProviderRequest", QoreJavaApi.newObjectSave("BBM_DataProviderRequest"));
        classMap.put("BBM_InternalIterator", QoreJavaApi.newObjectSave("BBM_InternalIterator"));
        classMap.put("BBM_CreateOrder", QoreJavaApi.newObjectSave("BBM_CreateOrder"));
        classMap.put("BBM_OutputData", QoreJavaApi.newObjectSave("BBM_OutputData"));
        UserApi.stopCapturingObjects();

    }

    Object callClassWithPrefixMethod(final String prefixedClass, final String methodName,
                                     Object params) throws Throwable {
        UserApi.logDebug("ClassConnections_ErpOrdersToCrm: callClassWithPrefixMethod: method: %s, class: %y", methodName, prefixedClass);
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
        Mapper mapper;
        UserApi.logDebug("Connection_1 called with data: %y", params);

        UserApi.logDebug("calling DataProvider Request: %y", params);
        params = callClassWithPrefixMethod("BBM_DataProviderRequest", "makeDataProviderRequestConnector", params);

        UserApi.logDebug("calling internalIterator: %y", params);
        params = callClassWithPrefixMethod("BBM_InternalIterator", "internalIterator", params);

        mapper = UserApi.getMapper("erp-orders-to-crm-job-mapper");
        params = mapper.mapAuto(params);

        UserApi.logDebug("calling createOrder: %y", params);
        params = callClassWithPrefixMethod("BBM_CreateOrder", "createWorkflowOrderConnector", params);

        UserApi.logDebug("calling writeOutputData: %y", params);
        return callClassWithPrefixMethod("BBM_OutputData", "writeOutputData", params);
    }
}
// ======== GENERATED SECTION END ========= //
