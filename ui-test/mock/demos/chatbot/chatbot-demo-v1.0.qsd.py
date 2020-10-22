from svc import QorusService

class ChatbotDemo(QorusService):
    def __init__(self):
        ####### GENERATED SECTION! DON'T EDIT! ########
        self.class_connections = ClassConnections_ChatbotDemo()
        ############ GENERATED SECTION END ############

    ####### GENERATED SECTION! DON'T EDIT! ########
    def init(self):
        self.class_connections.Init()

    def categorize_input(self, *params):
        return self.class_connections.Input(*params)
    ############ GENERATED SECTION END ############

####### GENERATED SECTION! DON'T EDIT! ########
class ClassConnections_ChatbotDemo:
    def __init__(self):
        # map of prefixed class names to class instances
        self.class_map = {
            'BBM_ChatbotDemo': BBM_ChatbotDemo(),
        }

    def callClassWithPrefixMethod(self, prefixed_class, method, *argv):
        UserApi.logDebug("ClassConnections_ChatbotDemo: callClassWithPrefixMethod: method: %s, class: %y", method, prefixed_class)
        return getattr(self.class_map[prefixed_class], method)(*argv)

    def Init(self, *params):
        UserApi.logDebug("Init called with data: %y", *params)

        UserApi.logDebug("calling init: %y", *params)
        return self.callClassWithPrefixMethod("BBM_ChatbotDemo", "init", *params)

    def Input(self, *params):
        UserApi.logDebug("Input called with data: %y", *params)

        UserApi.logDebug("calling processInput: %y", *params)
        return self.callClassWithPrefixMethod("BBM_ChatbotDemo", "processInput", *params)
############ GENERATED SECTION END ############
