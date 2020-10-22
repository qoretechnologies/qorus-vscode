#!/usr/bin/env python

import tensorflow as tf
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras import layers
import json
import numpy as np
print(tf.__version__)

oov_tok = '<OOV>'

# Load Intents
with open("./intents.json", "r") as f:
    intents = json.load(f)

intent_list = []
label_list = []
for index, intent in enumerate(intents):
    intent_list += intent['patterns']
    num_patterns = len(intent['patterns'])
    label_list += [index] * num_patterns

tokenizer = Tokenizer(oov_token = oov_tok)
tokenizer.fit_on_texts(intent_list)
sequences = tokenizer.texts_to_sequences(intent_list)
padded = pad_sequences(sequences)
padded_length = len(padded[0])

model = tf.keras.models.load_model('saved_model')

def analyze_sentence(sentence):
    sequence = tokenizer.texts_to_sequences([sentence])
    padded_sequence = pad_sequences(sequence, maxlen=padded_length)
    prediction = model.predict(padded_sequence)[0]
    intent = intents[np.argmax(prediction)]
    tag = intent['tag']
    print(sentence, tag, prediction)

analyze_sentence("how can I get on the bus?")