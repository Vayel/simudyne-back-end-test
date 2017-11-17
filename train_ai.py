import torch
import torch.nn as nn
import torch.optim as optim
import torch.utils.data

import simudyne


if __name__ == '__main__':
    D_IN, D_H1 = 9, 32
    LEARNING_RATE = 1e-4
    BATCH_SIZE = 128

    print('Loading datasets...')
    train, valid, test = simudyne.ai.get_datasets(BATCH_SIZE, None)

    model = simudyne.ai.Model(
        nn.Linear(D_IN, D_H1),
        nn.ReLU(),
        nn.Linear(D_H1, 1),
        nn.Sigmoid()
    )

    criterion = nn.BCELoss()
    optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)

    print('Training model...')
    simudyne.ai.train(model, train, criterion, optimizer)
    # torch.save(model.state_dict(), simudyne.config.MODEL_PATH)

    print('Validating model...')
    print(simudyne.ai.test(model, valid, len(valid.sampler)))
