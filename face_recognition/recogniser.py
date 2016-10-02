import sys, os, cv2, base64, cStringIO
import numpy as np
from PIL import Image

class FaceRecogniser(object):

    def __init__(self):

        self.cascadePath = os.path.join(sys.prefix,
            'face_recognition/cascades/haarcascade_frontalface_default.xml')
        self.training_path = os.path.join(sys.prefix, 'face_recognition/trainers')
        self.recogniser_path = os.path.join(sys.prefix, 'data/lbph.yml')

        self.face_cascade = cv2.CascadeClassifier(self.cascadePath)
        self.face_recogniser = cv2.createLBPHFaceRecognizer()
        if not os.path.exists(self.recogniser_path):
            self.init_train()

        self.face_recogniser.load(self.recogniser_path)


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
        return self.face_cascade.detectMultiScale(image)

    def train(self):
        """
        Expects to find a trainers folder containing subfolders of images
        the name of each subfolder acts as the label for each trained image
        """
        images = []
        labels = []

        for subject in os.listdir(self.training_path):
            subject_path = os.path.join(self.training_path, subject)
            if os.path.isdir(subject_path):
                for image_file in os.listdir(subject_path):

                    image_pil = Image.open(
                        os.path.join(subject_path, image_file)).convert('L')
                    image = np.array(image_pil, 'uint8')
                    faces = self.face_cascade.detectMultiScale(image)
                    for (x, y, w, h) in faces:
                        images.append(image[y: y + h, x: x + w])
                        labels.append(int(subject))

        self.face_recogniser.train(images, np.array(labels))
        self.face_recogniser.save(self.recogniser_path)

        return self.face_recogniser

    def init_train(self):
        self.train()

    def recognise(self, image_data, train_as=None):
        """
        image_data is a base64 encoded image string
        """
        predict_image = self.base64_to_np_array(image_data)
        faces = self.face_cascade.detectMultiScale(predict_image)
        subjects = []

        for (x, y, w, h) in faces:
            predict_face = predict_image[y: y + h, x: x + w]
            nbr_predicted, conf = self.face_recogniser.predict(
                predict_face)
            subjects.append([nbr_predicted, conf])

            if train_as and not nbr_predicted == train_as:
                pass


        return faces, subjects
