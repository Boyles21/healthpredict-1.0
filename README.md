# 🩺 HealthPredict

HealthPredict is an AI-powered web application that assists users in assessing their risk of **Polycystic Ovary Syndrome (PCOS)** and **Uterine Fibroids** using Machine Learning. The application provides personalized risk predictions, stores prediction history securely, and allows users to monitor their health over time.

The system combines a modern React frontend, a Node.js/Express backend, Firebase Authentication, Cloud Firestore, and Random Forest machine learning models to deliver fast, secure, and reliable health assessments.

---

## ✨ Features

* 🔐 Secure user authentication with Firebase Authentication
* 👤 User profile management
* 🩺 PCOS risk prediction using a Random Forest model
* 🩺 Uterine Fibroid risk prediction using a dedicated Random Forest model
* 📊 Personalized prediction results with confidence scores
* 📈 Prediction history stored securely in Cloud Firestore
* 📱 Responsive design for desktop and mobile devices
* ☁️ Cloud-based data storage with Firebase
* 🔒 Role-based architecture ready for future admin dashboard integration

---

## 🛠️ Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router

### Backend

* Node.js
* Express.js
* TypeScript

### Machine Learning

* Random Forest Classifier
* Separate prediction pipelines for:

  * PCOS
  * Uterine Fibroids

### Database & Authentication

* Firebase Authentication
* Cloud Firestore

---

## 📂 Project Structure

```text
HealthPredict/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── services/
│   ├── lib/
│   └── assets/
│
├── server/
│
├── datasets/
│   ├── pcos_dataset.csv
│   └── fibroid_dataset.csv
│
├── public/
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

* Node.js (v18 or later)
* npm
* Firebase Project
* Gemini API Key (if applicable)

---

### Installation

Clone the repository:

```bash
git clone https://github.com/your-username/healthpredict.git
```

Navigate into the project directory:

```bash
cd healthpredict
```

Install dependencies:

```bash
npm install
```

---

### Environment Variables

Create a `.env.local` file in the project root and configure the required environment variables.

Example:

```env
GEMINI_API_KEY=YOUR_API_KEY

VITE_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
```

---

### Run the Development Server

```bash
npm run dev
```

The application will be available at:

```
http://localhost:5173
```

---

## 🤖 Machine Learning Models

### PCOS Prediction Model

* Algorithm: Random Forest Classifier
* Dataset: PCOS Dataset
* Features: 12 clinical and lifestyle variables
* Prediction Endpoint:

```
POST /api/predict
```

---

### Fibroid Prediction Model

* Algorithm: Random Forest Classifier
* Dataset: Fibroid Dataset
* Features: 15 diagnostic variables
* Prediction Endpoint:

```
POST /api/predict-fibroid
```

---

## 📊 Model Performance

### PCOS Model

| Metric    | Score  |
| --------- | ------ |
| Accuracy  | 89.91% |
| Precision | 86.84% |
| Recall    | 84.62% |
| F1 Score  | 85.71% |

---

### Fibroid Model

| Metric    | Score  |
| --------- | ------ |
| Accuracy  | 94.16% |
| Precision | 93.55% |
| Recall    | 94.31% |
| F1 Score  | 93.93% |

---

## 🔒 Security

HealthPredict implements several security measures:

* Firebase Authentication
* Firestore Security Rules
* Protected Routes
* Secure Cloud Data Storage
* User-based access control
* Separate machine learning pipelines for each prediction model

---

## 📈 Future Improvements

* Admin Dashboard
* Email Notifications
* Doctor Portal
* Appointment Booking
* Medical Report Export (PDF)
* Additional Disease Prediction Models
* Mobile Application
* Explainable AI (XAI) for prediction interpretation

---

## 🤝 Contributing

Contributions are welcome.

If you would like to improve HealthPredict:

1. Fork the repository
2. Create a new feature branch
3. Commit your changes
4. Push to your branch
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Ajisebutu Boluwatife**

Public Health Student | Frontend Developer | Machine Learning Enthusiast

---

## 🙏 Acknowledgements

Special thanks to:

* Firebase
* React
* Vite
* Node.js
* Express.js
* Tailwind CSS
* The Machine Learning community
* Everyone who contributed to the datasets and development of this project
