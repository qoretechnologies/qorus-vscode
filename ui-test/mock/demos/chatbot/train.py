#!/usr/bin/env python

import tensorflow as tf
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras import layers
import json
import numpy as np
print(tf.__version__)

oov_tok = '<OOV>'
num_epochs = 300

with open('./intents.json', 'r') as f:
    intents = json.load(f)

intent_list = []
label_list = []
for index, intent in enumerate(intents):
    intent_list += intent['patterns']
    num_patterns = len(intent['patterns'])
    label_list += [index] * num_patterns

tokenizer = Tokenizer(oov_token = oov_tok)
tokenizer.fit_on_texts(intent_list)
word_index = tokenizer.word_index
sequences = tokenizer.texts_to_sequences(intent_list)
max_length = len(max(sequences, key=len))
vocab_size = len(word_index)
padded = pad_sequences(sequences)
padded_length = len(padded[0])
labels = tf.keras.utils.to_categorical(label_list)
num_categories = len(labels[0])

model = tf.keras.Sequential([
    layers.Embedding(vocab_size+1, 16, input_length=padded_length),
    layers.Flatten(),
    layers.Dense(128, activation='relu'),
    layers.Dropout(0.5),
    layers.Dense(64, activation='relu'),
    layers.Dropout(0.5),
    layers.Dense(num_categories, activation='softmax')
])
model.compile(
    loss='categorical_crossentropy',
    optimizer='adam',
    metrics=['acc'])
model.summary()

history = model.fit(padded, labels, epochs=num_epochs, verbose=2)

def analyze_sentence(sentence):
    sequence = tokenizer.texts_to_sequences([sentence])
    padded_sequence = pad_sequences(sequence, maxlen=padded_length)
    prediction = model.predict(padded_sequence)[0]
    intent = intents[np.argmax(prediction)]
    tag = intent['tag']
    print(sentence, tag, prediction)

analyze_sentence('I would like to pay')
analyze_sentence('Can I pay you later?')

model_json = model.to_json()
with open('./model.json', 'w') as json_file:
     json_file.write(model_json)
model.save_weights('./model.h5')
json_file.close()

model.save('./saved_model')

with open('./wordIndex.json', 'w') as json_file:
    json.dump(word_index, json_file)
json_file.close()
