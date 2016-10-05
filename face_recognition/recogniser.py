import sys, os, cv2, base64, cStringIO
import numpy as np
from PIL import Image

class FaceRecogniser(object):

    def __init__(self):

        self.cascadePath = os.path.join(sys.prefix,
            'face_recognition/cascades/haarcascade_frontalface_default.xml')
        self.recogniser_path = os.path.join(sys.prefix, 'data/lbph.yml')

        self.face_cascade = cv2.CascadeClassifier(self.cascadePath)
        self.face_recogniser = cv2.createLBPHFaceRecognizer()
        self.face_recogniser.setDouble('threshold', 50.0)

        self.data_loaded = False
        if os.path.exists(self.recogniser_path):
            self.face_recogniser.load(self.recogniser_path)
            self.data_loaded = True

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

    def clear(self, clear=False):
        """
        Initialise training object file with a blank image
        """
        if os.path.exists(self.recogniser_path):
            os.remove(self.recogniser_path)
        self.data_loaded = False

    def save(self):
        self.face_recogniser.save(self.recogniser_path)

    def recognise(self, image_data, train_as=None):
        """
        image_data is a base64 encoded image string
        """
        predict_image = self.base64_to_np_array(image_data)
        faces = self.face_cascade.detectMultiScale(predict_image)
        subjects = []

        for (x, y, w, h) in faces:
            predict_face = predict_image[y: y + h, x: x + w]

            if self.data_loaded:
                nbr_predicted, conf = self.face_recogniser.predict(predict_face)
                subjects.append([nbr_predicted, conf])

                if train_as and not nbr_predicted == train_as:
                    self.face_recogniser.update([predict_face], np.array([train_as]))
            else:
                if train_as:
                    self.face_recogniser.train([predict_face], np.array([train_as]))
                    self.data_loaded = True

        return faces, subjects
