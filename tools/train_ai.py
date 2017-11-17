import torch
import torch.nn as nn
import torch.optim as optim
import torch.utils.data

from simudyne import ai, config


if __name__ == '__main__':
    D_IN, D_H1 = 11, 32
    LEARNING_RATE = 1e-3
    BATCH_SIZE = 64

    print('Loading datasets...')
    train, valid, _ = ai.get_loaders(BATCH_SIZE, None)

    model = ai.Model(
        nn.Linear(D_IN, D_H1),
        nn.ReLU(),
        nn.Linear(D_H1, 1),
    )

    criterion = nn.BCEWithLogitsLoss()
    optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)

    print('Training model...')
    ai.train(model, train, criterion, optimizer, n_epochs=4)
    #torch.save(model, config.MODEL_PATH)

    print('Validating model...')
    print(ai.test(model, valid, len(valid.sampler)))
