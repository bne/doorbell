import sys, os, cv2, base64, cStringIO
import numpy as np
from PIL import Image

CASCADES_PATH = os.path.join(sys.prefix, 'face_recognition/cascades')
TRAINING_PATH = os.path.join(sys.prefix, 'face_recognition/trainers')

class FaceRecogniser(object):

    def __init__(self):

        self.cascadePath = os.path.join(CASCADES_PATH, 'haarcascade_frontalface_default.xml')
        self.faceCascade = cv2.CascadeClassifier(self.cascadePath)

    def base64_to_np_array(self, data):
        """
        Takes a base64 encoded image string,
        converts to a greyscale PIL image object
        then finally into a numpy array
        """
        return np.array(
            Image.open(
                cStringIO.StringIO(
                    base64.b64decode(data))
                ).convert('L'),
            'uint8')

    def detect(self, image_data):
        """
        image_data is a base64 encoded image string
        """
        image = self.base64_to_np_array(image_data)
        faces = self.faceCascade.detectMultiScale(image)

        return faces

    def train(self):
        """
        """

