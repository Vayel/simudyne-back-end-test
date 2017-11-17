import torch
from simudyne import ai, config

if __name__ == '__main__':
    BATCH_SIZE = 64

    _, _, test = ai.get_loaders(BATCH_SIZE, None)
    model = ai.Model()
    model = torch.load(config.MODEL_PATH)

    print(ai.test(model, test, len(test.sampler)))
