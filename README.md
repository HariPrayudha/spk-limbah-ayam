# EcoPoultry DSS (Frontend)

Mobile Application for **Sustainable Poultry Waste Product Analysis**.
A Decision Support System (DSS) based on Economic Efficiency and Environmental Impact using the **CRITIC-MARCOS** Hybrid Method.

---

## 📱 Description

This mobile application serves as the User Interface (Frontend) for the **EcoPoultry** decision support system. Built with **React Native (Expo)**, it allows researchers and decision-makers to analyze and select the best poultry waste processing products based on complex criteria.

The app communicates with a Python FastAPI Backend to perform calculations using:
1.  **CRITIC**: For objective criteria weighting.
2.  **MARCOS**: For ranking alternatives based on compromise solutions.

## ✨ Key Features

* **Modern UI/UX**: Clean, minimalist, and responsive design using **NativeWind (Tailwind CSS)**.
* **Smart Data Input**: Interactive forms with auto-formatting for currency (IDR) and intuitive Likert scale selectors.
* **Auto-Fill Simulation**: "Auto Fill" feature to instantly load real research data for demonstration purposes.
* **Result Visualization**:
    * **Winner Card**: Highlight card for the top-ranked alternative.
    * **Bar Charts**: Visual comparison of utility scores.
    * **Pie/Bar Charts**: Visualization of objective criteria weights.
* **Sensitivity Analysis**: Interactive line charts to test ranking stability against parameter changes (Alpha).
* **Real-time Validation**: Ensures the decision matrix is complete before sending data to the server.
* **Server Health Check**: Live indicator of backend connection status.

## 🛠️ Tech Stack

* **Framework**: [React Native](https://reactnative.dev/) with [Expo SDK 54](https://expo.dev/)
* **Language**: TypeScript
* **Styling**: [NativeWind](https://www.nativewind.dev/) (Tailwind CSS)
* **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/)
* **Networking**: Axios
* **Visualization**: [react-native-gifted-charts](https://gifted-charts.web.app/)
* **Icons**: Lucide React Native
* **Animation**: React Native Reanimated

---

## 🚀 Installation & Setup Guide

Follow these steps strictly to run the application.

### Prerequisites
* Node.js (LTS Version recommended)
* npm / yarn
* **Expo Go** app on your physical device (Android/iOS) or an Emulator/Simulator.

### Step 1: Setup Backend (REQUIRED)

This app **will not work** without the backend running.

1.  **Clone the Backend Repository:**
    ```bash
    git clone https://github.com/handikatriarlan/spk-critic-marcos-limbah-ayam-api.git
    ```

2.  **Navigate to Backend Folder:**
    ```bash
    cd spk-critic-marcos-limbah-ayam-api
    ```

3.  **Setup Virtual Environment & Install Dependencies:**
    ```bash
    # Create venv
    python -m venv venv

    # Activate venv
    # Windows:
    venv\Scripts\activate
    # Mac/Linux:
    source venv/bin/activate

    # Install requirements
    pip install -r requirements.txt
    ```

4.  **Run the Server:**
    ```bash
    python main.py
    ```
    *Ensure the server is running at `http://localhost:8000`*

### Step 2: Setup Frontend

Open a new terminal window for the frontend.

1.  **Clone this Repository:**
    ```bash
    git clone https://github.com/HariPrayudha/spk-limbah-ayam.git
    cd spk-limbah-ayam
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

### Step 3: Configure API URL

To allow your phone/emulator to talk to the backend on your computer, you must configure the IP Address.

1.  **Find your Computer's Local IP Address:**
    * **Windows**: Run `ipconfig` in CMD. Look for IPv4 Address (e.g., `192.168.1.10`).
    * **Mac/Linux**: Run `ifconfig`.

2.  **Update Configuration:**
    Open `src/services/api.ts` (or your `.env` file) and update the `BASE_URL`:

    ```typescript
    // src/services/api.ts

    // OPTION A: For Physical Device (Phone) via Wi-Fi
    // Replace X with your actual IP digits. Phone and PC must be on the same Wi-Fi.
    const API_URL = "http://192.168.1.X:8000/api/v1"; 

    // OPTION B: For Android Emulator
    // const API_URL = "http://10.0.2.2:8000/api/v1";
    
    // OPTION C: For iOS Simulator
    // const API_URL = "http://localhost:8000/api/v1";
    ```

### Step 4: Run the Application

Start the Expo development server:

```bash
npx expo start
```

* **Physical Device:** Scan the QR Code using the **Expo Go** app (Android) or Camera (iOS).
* **Emulator:** Press `a` for Android or `i` for iOS in the terminal.

---

## 📱 App Navigation Structure

The app uses `Expo Router` with a Tab Bar layout:

1.  🏠 **Home**: Dashboard status, data summary, method explanation.
2.  🗃️ **Data**: Master data view for Criteria & Alternatives (Read-Only from API).
3.  📈 **Analysis**: Main workspace for inputting assessments, running calculations, and viewing results.
4.  👤 **Profile**: Developer profile and references.

---

## 🤝 Contribution

Contributions are welcome!
1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
