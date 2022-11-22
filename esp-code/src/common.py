class CancellationToken:
    def __init__(self):
        self.cancelled = False

    def cancel(self):
        self.cancelled = True