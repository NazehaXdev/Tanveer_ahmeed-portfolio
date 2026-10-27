# Tanveer Ahmed — Professional Executive Portfolio & CMS
### Supply Chain & Apparel Merchandising Professional
**Live-Editable Portfolio with Built-in Zero-Code Admin CMS**

---

## 🌟 Overview (সংক্ষিপ্ত বিবরণ)

এই ওয়েবসাইটটি **তানভীর আহমেদ (Tanveer Ahmed)** এর জন্য তৈরি করা একটি কর্পোরেট ও প্রফেশনাল পোর্টফোলিও ওয়েবসাইট। এটি সম্পূর্ণভাবে চাকরির আবেদন, ইন্টারভিউ এবং মাল্টিন্যাশনাল আরএমজি (RMG)/সাপ্লাই চেইন কোম্পানির বস ও রিক্রুটারদের সামনে তুলে ধরার উপযোগী করে সাজানো।

- **কোনো হাস্যকর বা অতিরিক্ত 3D ছাড়া**: অত্যন্ত মার্জিত (Corporate Royal Navy, Crisp Slate, Executive Gold) থিম।
- **জাভাস্ক্রিপ্ট স্ক্রল অ্যানিমেশন**: স্ক্রল করার সাথে সাথে একটার পর একটা কার্ড, মাইলস্টোন ও ছবি ভেসে ওঠার স্ট্যাগার্ড অ্যানিমেশন, স্মুথ রিডিং স্ক্রলবার এবং ইন্টারঅ্যাক্টিভ ক্যারোজেল।
- **সিভির পূর্ণ বিবরণ**: প্যাসিফিক জিন্স (Pacific Jeans NHT Fashion) ইন্টার্নশিপ, ওরাকল ইআরপি (Oracle ERP), সিবিআইএফটি (CBIFT) মাস্টার্স ৪.০০ সিজিপিএ, আইআইইউসি (IIUC) বিবিএ ৩.৪৭ সিজিপিএ, ৬ মাসের মার্চেন্ডাইজিং ও ৩ মাসের এনওয়াইটিএ (NYTA) আইটি ট্রেনিং।
- **জিরো-কোড ওনার সিএমএস (Owner Admin CMS)**: তানভীর কোডিং না জেনেও নিজে যেকোনো সময় ব্রাউজার থেকে ছবি, ডিগ্রি, কাজের অভিজ্ঞতা, ফোন নম্বর ও তথ্য পরিবর্তন করতে পারবেন।

---

## 🔐 নিরাপদ CMS লগইন (Secure CMS Login)

CMS authentication runs on the server. No password, password hash, or GitHub token is stored in the public source or browser. Configure these as private Vercel Environment Variables before using the admin dashboard:

| Variable | Purpose |
|---|---|
| `CMS_EMAIL` | The single email address allowed to sign in |
| `CMS_PASSWORD` | A unique password with at least 16 characters |
| `CMS_SESSION_SECRET` | A random secret with at least 32 characters used to sign secure session cookies |
| `GITHUB_TOKEN` | A fine-grained GitHub token restricted to this repository with Contents read/write permission |

Use the Vercel project’s **Settings → Environment Variables** page. Do not put secret values in Git, this README, or browser storage. After changing a variable, redeploy the production project.

---

## 🚀 তানভীরের জন্য সহজে আপডেট করার নিয়মাবলী

১. **ছবি পরিবর্তন (Change Photo)**:
   - `admin.html`-এ যান অথবা `index.html`-এর লক আইকনে ক্লিক করে ইমেইল ও পাসওয়ার্ড দিয়ে লগইন করুন।
   - "Photo Manager" ট্যাবে গিয়ে **"Choose Photo from Device"** বাটনে ক্লিক করে মোবাইল বা কম্পিউটার থেকে যেকোনো ছবি সিলেক্ট করুন।
   - নিচে **"Save All Changes"** বাটনে চাপ দিলে পরিবর্তন GitHub-এ সেভ হবে এবং Vercel deploy শেষ হলে মূল ওয়েবসাইটে দেখা যাবে।

২. **তথ্য / ডিগ্রি / সিজিপিএ পরিবর্তন**:
   - "Profile & Contacts", "Education & CGPA", বা "Work Experience" ট্যাবে যান।
   - বক্সে নতুন তথ্য লিখে নিচে **"Save All Changes"** বাটনে ক্লিক করুন। GitHub commit ও Vercel redeploy শেষ হলে লাইভ পেজে আপডেট হবে।

৩. **ব্যাকআপ ফাইল সেভ করে রাখা (Backup)**:
   - "Backups & Security" ট্যাবে গিয়ে **"Download Full Backup (.json)"** বাটনে ক্লিক করলে সমস্ত তথ্যের একটি ব্যাকআপ ফাইল ডাউনলোড হবে। অন্য যেকোনো ডিভাইসে ফাইলটি আপলোড করে সেভ করলে ডাটা রিস্টোর হবে; লাইভ আপডেটের জন্য Vercel redeploy শেষ হওয়া পর্যন্ত অপেক্ষা করুন।

---

## 🌐 Vercel deployment

The portfolio is served as static files while the authenticated CMS API runs as Python serverless functions under `api/`. Add all four private environment variables above to the Vercel production project. Create a GitHub fine-grained personal access token limited to this repository with **Contents: Read and write** permission, then save it as `GITHUB_TOKEN` in Vercel. Do not paste the token into chat or source files.

The public portfolio API reads the latest JSON directly from GitHub after each successful CMS update, so content changes appear on the website without waiting for a Vercel rebuild. Saving from the CMS commits the edited public portfolio data to the repository's `main` branch. Connect the repository to Vercel separately if you also want code changes to auto-deploy.

For local development, set the same environment variables in the shell before running `python server.py`.

---

## 📁 ফাইল স্ট্রাকচার

```
tanveer-ahmed-portfolio/
├── index.html              # মূল প্রফেশনাল পোর্টফোলিও ওয়েবসাইট
├── admin.html              # তানভীরের জিরো-কোড এডমিন সিএমএস ড্যাশবোর্ড
├── README.md               # গাইডলাইন ও নির্দেশনা
├── server.py               # লোকাল প্রিভিউ সার্ভার
├── cms_backend.py          # Server-side auth ও GitHub update logic
├── api/                    # Vercel serverless CMS API
├── tests/                  # Backend security tests
└── assets/
    ├── css/
    │   ├── styles.css      # কর্পোরেট স্টাইলিং, রেসপনসিভ ডিজাইন ও প্রিন্ট সিভি সিএসএস
    │   └── admin.css       # এডমিন ড্যাশবোর্ড স্টাইলিং
    ├── js/
    │   ├── data.js         # ডাটা স্টোর, অথেন্টিকেশন গার্ড ও লোকাল স্টোরেজ ইঞ্জিন
    │   ├── app.js          # স্ক্রল প্রগ্রেস, স্ট্যাগার্ড অ্যানিমেশন, কাউন্টার ও ইন্টারঅ্যাক্টিভ ক্যারোজেল
    │   └── admin.js        # ফর্ম এডিটর, ফটো বেস৬৪ কনভার্টার, ব্যাকআপ ও রিসেট ম্যানেজার
    └── images/
        ├── tanveer_avatar.jpg   # এক্সিকিউটিভ হেডশট প্রোফাইল ছবি
        ├── tanveer_headshot.jpg # ক্লোজআপ পোর্ট্রেট ছবি
        └── profile.jpg          # মূল সম্পূর্ণ ছবি
```
