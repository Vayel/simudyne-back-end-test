import torch
import simudyne

if __name__ == '__main__':
    BATCH_SIZE = 64

    _, _, test = simudyne.ai.get_loaders(BATCH_SIZE, None)
    model = simudyne.ai.Model()
    model = torch.load(simudyne.config.MODEL_PATH)

    print(simudyne.ai.test(model, test, len(test.sampler)))
