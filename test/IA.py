import numpy as np

x_entrer = np.array(([3, 1.5], [2, 1], [4, 1.5], [3, 1], [3.5, 0.5], [2, 0.5], [5.5, 1], [1, 1], [4, 1.5]), dtype=float)
y = np.array(([1], [0], [1], [0], [1], [0],[1], [0]), dtype=float)  # donnée de 1 -> rouge / 0-> bleu

x_entrer / np.amax(x_entrer, axis=0)

X = np.split(x_entrer, [8])[0]
xPrediction = np.split(x_entrer, [8])[1]

class Neural_Network(object):
    def __init__(self):
        self.inputSize = 2
        self.outputSize = 1
        self.hiddenSize = 3

        self.W1 = np.random.randn(self.inputSize, self.hiddenSize)
        self.W2 = np.random.randn(self.hiddenSize, self.outputSize)

    def forward(self, X):

        self.z = np.dot(X, self.W1)
        self.z2 = self.sigmoid(self.z)
        self.z3 = np.dot(self.z2, self.W2)
        o = self.sigmoid(self.z3)
        return o

    def sigmoid(self, s):
        return 1/(1+np.exp(-s))

    def sigmoidPrime(selfself,s):
        return s * (1-s)

    def backward(self,X,Y,o):

        self.o_error = y - o
        self.o_delta = self.o_error * self.sigmoidPrime(o)

        self.z2_error = self.o_delta.dot(self.W2.T)
        self.z2_delta = self.z2_error * self.sigmoidPrime(self.z2)

        self.W1 += X.T.dot(self.z2_delta)
        self.W2 += self.z2.T.dot(self.o_delta)

    def train(self,x,y):
        o = self.forward(X)
        self.backward(X,y,o)

NN = Neural_Network()

for i in range(30):
    print('#' + str(i) + '\n')
    print('Valeurs entrées\n' + str(X))
    print('Sortie Actuelle \n' + str(y))
    print('Sortie prédite \n' + str(np.matrix.round(NN.forward(X),2)))
    NN.train(X,y)

