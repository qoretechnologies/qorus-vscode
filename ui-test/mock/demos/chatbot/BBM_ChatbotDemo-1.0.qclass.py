import json
import tensorflow as tf
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
import numpy as np
import random

class BBM_ChatbotDemo:
    def init(self):
        oov_tok = '<OOV>'

        self.intents = json.loads(UserApi.getTextFileFromLocation(UserApi.getConfigItemValue("chatbot-demo-intents")))
        UserApi.logDebug("intents: %y", self.intents)

        intent_list = []
        label_list = []
        for index, intent in enumerate(self.intents):
            intent_list += intent['patterns']
            num_patterns = len(intent['patterns'])
            label_list += [index] * num_patterns

        self.tokenizer = Tokenizer(oov_token = oov_tok)
        self.tokenizer.fit_on_texts(intent_list)
        sequences = self.tokenizer.texts_to_sequences(intent_list)
        padded = pad_sequences(sequences)
        self.padded_length = len(padded[0])

        self.model = tf.keras.models.load_model(UserApi.getConfigItemValue("chatbot-demo-model"))

    def processInput(self, input):
        # first check for hard matches
        hard_map = UserApi.getConfigItemValue("chatbot-demo-hard-actions")
        input_ci = input.lower()
        if input_ci in hard_map:
            action = hard_map[input_ci]
            UserApi.logInfo("input: %y -> hard %y", input, action)
            if (action.startswith("fsm:")):
                action = action[4:]
                return UserApi.executeFsm(action)
            return action

        # analyze input and determine intent
        sequence = self.tokenizer.texts_to_sequences([input])
        padded_sequence = pad_sequences(sequence, maxlen=self.padded_length)
        prediction = self.model.predict(padded_sequence)[0]
        pred_val = prediction[np.argmax(prediction)]
        threshold = UserApi.getConfigItemValue("chatbot-demo-threshold")
        UserApi.logDebug("input: %y pred_val: %y threshold: %y", input, repr(pred_val), threshold)
        if pred_val < threshold:
            return "I'm sorry, I did not understand your request, please rephrase and try again"
        intent = self.intents[np.argmax(prediction)]
        tag = intent['tag']
        UserApi.logDebug("input: %y -> %y (%y)", input, intent, repr(prediction))
        actions = UserApi.getConfigItemValue("chatbot-demo-actions")
        UserApi.logInfo("input: %y -> %y (action %y confidence %s %%)", input, tag, actions[tag] if tag in actions else "n/a", repr(pred_val * 100))

        if tag in actions:
            action = actions[tag]

            if (action.startswith("fsm:")):
                action = action[4:]
                UserApi.executeFsm(action)

        return random.choice(intent['responses'])
