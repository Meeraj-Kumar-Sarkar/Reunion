# Alumni Payment Portal

A modern, lightweight alumni contribution and payment portal built with React, Vite, Tailwind CSS (v4), Express, and MongoDB. It features a streamlined UI to collect payments via static UPI QR Codes without transaction fees.

## What Needs to Be Done Next (Action Required)

To get this project running on your local machine and prepare it for deployment, follow these exact steps:

### 1. Configure Environment Variables
You need to provide your actual credentials for the database, email service, and UPI.

**Frontend (`client/.env`)**
- Open `client/.env`.
- Set `VITE_UPI_ID` to your actual UPI ID (e.g., `yourname@sbi` or `yourbusiness@okaxis`). This is where the funds will be transferred when users scan the QR code.
- Ensure `VITE_API_URL` points to your backend (default is `http://localhost:5000` for local development).

**Backend (`server/.env`)**
- Open `server/.env`.
- Set `MONGODB_URI` to your MongoDB Atlas connection string. This is required to save contribution records.
- Set `EMAIL_USER` to your Gmail address (e.g., `youremail@gmail.com`).
- Set `EMAIL_PASS` to your Gmail **App Password**. (You must generate an App Password in your Google Account settings; your standard password will not work for Nodemailer).

### 2. Install Dependencies
Open two separate terminal windows.

**Terminal 1 (Frontend):**
```bash
cd client
pnpm install
```

**Terminal 2 (Backend):**
```bash
cd server
pnpm install
```

### 3. Run the Development Servers
Once dependencies are installed and `.env` files are configured, start the servers.

**Terminal 1 (Frontend):**
```bash
# Inside the /client directory
pnpm run dev
```

**Terminal 2 (Backend):**
```bash
# Inside the /server directory
pnpm run dev
```

Your frontend will usually be accessible at `http://localhost:5173` and your backend API at `http://localhost:5000`.

### 4. Test the Payment Flow
1. Go to `http://localhost:5173`.
2. Fill out the contribution form with a test name, email, and amount.
3. Click **Generate QR Code**.
4. Scan the QR code using your phone's UPI app (GPay, PhonePe, Paytm, etc.) and complete the payment.
5. Enter the **12-digit UTR (Transaction ID)** provided by your UPI app into the website.
6. Click **Submit Payment**. 
7. Verify that you receive a "Thank You" email and that the contribution was saved to your MongoDB database with a `pending` status.

### 5. Deployment
When you are ready to make this temporary portal live:
- **Frontend**: Deploy the `client/` folder to **Vercel** or **Netlify**. Ensure you set `VITE_API_URL` to your production backend URL and `VITE_UPI_ID` in their environment variable settings.
- **Backend**: Deploy the `server/` folder to **Render**, **Railway**, or **Heroku**. Set all the backend `.env` variables (`MONGODB_URI`, `EMAIL_USER`, `EMAIL_PASS`, and `CLIENT_URL`) in their deployment dashboard.

---
*Built with ❤️ for AlumniFund.*
