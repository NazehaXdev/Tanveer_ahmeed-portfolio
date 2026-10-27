/**
 * Tanveer Ahmed - Professional Portfolio Data Store
 * Default data initialized from Official CV
 * Stored in localStorage for instant owner editing without touching code.
 */

const DEFAULT_PORTFOLIO_DATA = {
  personal: {
    name: "Tanveer Ahmed",
    title: "Supply Chain & Merchandising Professional",
    subTitle: "Master's in Apparel Merchandising (CBIFT) | BBA in Supply Chain Management (IIUC)",
    age: 25,
    location: "Dhum Para, Patenga, Chattogram, Bangladesh",
    email: "mdtanveerahmed.@gmail.com",
    phones: ["01726105293", "01898753995"],
    whatsapp: "8801726105293",
    linkedin: "https://www.linkedin.com/in/tanveer-ahmed-27a476207?utm_source=share_via&utm_content=profile&utm_medium=member_android",
    instagram: "https://www.instagram.com/me.tonight_?srtk=MWtmcmI1cjZlbTJ4NA==",
    facebook: "https://www.facebook.com/share/18gxHHB9ip/",
    wechatQr: "assets/images/wechat_qr.png",
    photo: "assets/images/tanveer_portrait_standard.jpg",
    fullPhoto: "assets/images/profile.jpg",
    bio: "I am 25 years old, currently pursuing my Master's degree and seeking an entry-level position where I can begin my professional career. Although I am a fresher with no formal job experience, I am highly motivated, quick to learn, and confident in my abilities. I have strong leadership and organizational skills, which enable me to effectively organize and manage any task or activity with responsibility and dedication. I am eager to contribute my energy and potential to your esteemed organization.",
    careerObjective: "Seeking a dynamic entry-level role in Supply Chain & Apparel Merchandising within a premier RMG manufacturing or buying corporate environment. Eager to leverage hands-on training in Oracle ERP, supplier procurement, garment costing, and international order processing to optimize operational productivity and value."
  },
  metrics: [
    { label: "Masters CGPA", value: "4.00", outOf: "4.00", badge: "CBIFT Ongoing" },
    { label: "BBA CGPA", value: "3.47", outOf: "4.00", badge: "Major: Supply Chain" },
    { label: "Industry Training", value: "9+", outOf: "Months", badge: "NYTA & Merchandising" },
    { label: "Corporate Exposure", value: "Pacific Jeans", outOf: "", badge: "NHT Fashion Intern" }
  ],
  experiences: [
    {
      id: "exp-1",
      role: "Procurement & Supply Chain Intern",
      company: "Pacific Jeans NHT Fashion",
      period: "January 2025 – March 2025",
      location: "Chattogram, Bangladesh",
      department: "Procurement & Sourcing",
      type: "Corporate Internship",
      summary: "Completed rigorous hands-on corporate internship within one of Bangladesh's leading denim and apparel manufacturing exporters, gaining deep practical exposure in factory procurement operations.",
      responsibilities: [
        "Procurement & Supplier Evaluation: Selecting, evaluating, and shortlisting raw materials, trims, and accessory suppliers to ensure factory compliance and on-time delivery.",
        "Purchasing Operations: Executing commercial purchases of industrial products and services adhering to budget limits and production schedules.",
        "Transport & Inbound Logistics: Arranging, tracking, and coordinating the collection and timely dispatch of materials from external vendors to production floors.",
        "Enterprise Resource Planning (ERP): Operating Oracle ERP for material requisition, purchase orders (PO), vendor databases, and inventory tracking."
      ]
    }
  ],
  education: [
    {
      id: "edu-1",
      degree: "Masters In Apparel Merchandising",
      institution: "Chattogram BGMEA University of Fashion & Technology (CBIFT)",
      period: "2025 – Ongoing",
      result: "Current Result: 4.00 Out of 4.00",
      isHighlighted: true,
      department: "Apparel Merchandising",
      details: "Comprehensive postgraduate curriculum focused on global apparel supply chain, merchandising strategies, fabric science, production flow, international buyer negotiations, and export-import compliance."
    },
    {
      id: "edu-2",
      degree: "Bachelor of Business Administration (BBA)",
      institution: "International Islamic University Chittagong (IIUC)",
      period: "Passing Year: 2025",
      result: "CGPA: 3.47 Out of 4.00",
      isHighlighted: false,
      department: "Major: Supply Chain Management",
      details: "Four-year specialized business degree in Supply Chain Management covering logistics optimization, inventory control models, procurement strategies, statistical analysis, and operations management."
    },
    {
      id: "edu-3",
      degree: "Higher Secondary Certificate (HSC)",
      institution: "BAF Shaheen College, Chattogram",
      period: "Passing Year: 2020",
      result: "GPA: 4.17 Out of 5.00",
      isHighlighted: false,
      department: "Business Studies",
      details: "Disciplined academic foundation in business fundamentals, accounting principles, management, and commercial mathematics."
    },
    {
      id: "edu-4",
      degree: "Secondary School Certificate (SSC)",
      institution: "Eastern Refinery Model High School",
      period: "Passing Year: 2018",
      result: "GPA: 4.06 Out of 5.00",
      isHighlighted: false,
      department: "Business Studies",
      details: "Secondary education with high distinction in business and analytical disciplines."
    }
  ],
  training: [
    {
      id: "tr-1",
      title: "Merchandising & Procurement Specialization",
      duration: "6 Months Intensive",
      institution: "Professional Apparel & Merchandising Institute",
      focus: "Apparel Merchandising & Factory Operations",
      modules: [
        "Buyer Communication & Professional Correspondence",
        "Order Processing & Critical Path Management",
        "Trims, Accessories & Fabric Sourcing",
        "Garment Costing & Consumption Calculation",
        "Sample Development & Client Approval Lifecycle",
        "Production Planning & Capacity Allocation",
        "Vendor Management & Price Negotiation",
        "Quality Control & AQL Compliance Standards",
        "Inventory Management & Store Operations",
        "Shipment Coordination & Export Logistics",
        "Purchase Order (PO) Management & Tracking"
      ]
    },
    {
      id: "tr-2",
      title: "Microsoft Office Management",
      duration: "3 Months",
      institution: "National Youth Training Academy (NYTA)",
      focus: "Corporate IT & Information Systems",
      modules: [
        "Advanced Microsoft Word (Corporate Reports, Formal Memos, Documentation)",
        "Advanced Microsoft Excel (Formulas, Pivot Tables, Merchandising Cost Sheets, Data Analysis)",
        "Microsoft Access (Relational Database Management & Inventory Cataloging)",
        "Microsoft PowerPoint (Executive Business Presentations & Visual Decks)",
        "Corporate Mailing, Internet Protocol & Cloud Collaboration"
      ]
    }
  ],
  skills: [
    { name: "Oracle ERP (Procurement)", category: "supply_chain", level: 90 },
    { name: "Supplier Evaluation & Selection", category: "supply_chain", level: 88 },
    { name: "Purchasing & Inbound Transport", category: "supply_chain", level: 85 },
    { name: "Inventory & Store Management", category: "supply_chain", level: 85 },
    { name: "PO Lifecycle Management", category: "supply_chain", level: 90 },
    { name: "Garment Costing & Consumption", category: "merchandising", level: 88 },
    { name: "Sample Development & Approvals", category: "merchandising", level: 86 },
    { name: "Buyer Communication", category: "merchandising", level: 92 },
    { name: "Trims & Accessories Sourcing", category: "merchandising", level: 87 },
    { name: "Production Planning", category: "merchandising", level: 84 },
    { name: "Quality Control (AQL Standards)", category: "merchandising", level: 85 },
    { name: "Microsoft Excel (Advanced)", category: "tech", level: 92 },
    { name: "Microsoft Word & PowerPoint", category: "tech", level: 95 },
    { name: "Microsoft Access", category: "tech", level: 80 },
    { name: "Organizational Leadership", category: "soft", level: 90 },
    { name: "Team Coordination & Quick Learning", category: "soft", level: 95 }
  ],
  showcaseCards: [
    {
      id: "sc-1",
      title: "Academic Distinction",
      subtitle: "CBIFT & IIUC",
      description: "Masters ongoing with a stellar 4.00 out of 4.00 CGPA, combined with a 3.47 CGPA BBA in Supply Chain Management.",
      icon: "graduation-cap",
      tag: "Academics"
    },
    {
      id: "sc-2",
      title: "Industrial Apprenticeship",
      subtitle: "Pacific Jeans NHT Fashion",
      description: "Hands-on experience in one of the premier export leaders of Bangladesh handling Oracle ERP and procurement operations.",
      icon: "building",
      tag: "Experience"
    },
    {
      id: "sc-3",
      title: "RMG Merchandising Mastery",
      subtitle: "6 Months Training",
      description: "Mastered end-to-end garment operations: buyer communication, costing, trims sourcing, and shipment scheduling.",
      icon: "shirt",
      tag: "Specialization"
    },
    {
      id: "sc-4",
      title: "Corporate Technical Skills",
      subtitle: "NYTA Certified",
      description: "Certified Microsoft Office specialist in advanced spreadsheet modeling, database tracking, and formal reporting.",
      icon: "laptop",
      tag: "Certifications"
    }
  ],
  references: [
    {
      id: "ref-1",
      name: "Md. Fazlul Karim",
      title: "Production Manager & Buying Representative",
      company: "Strong Trading Company",
      email: "f.karim.ctg@gmail.com",
      phone: "+880 1751175175",
      relation: "Industry Mentor & Professional Reference",
      address: "Chattogram, Bangladesh"
    },
    {
      id: "ref-2",
      name: "Md. Sarwar Jahan Rifat",
      title: "Associate Manager",
      company: "BRAC Bank (Dhaka)",
      email: "rifatsarwar39@gmail.com",
      phone: "+880 1521486980",
      relation: "Corporate Banking & Professional Reference",
      address: "Dhaka, Bangladesh"
    }
  ]
};

class PortfolioStore {
  static STORAGE_KEY = "tanveer_portfolio_cms_v2";

  static getData() {
    try {
      const stored = localStorage.getItem(PortfolioStore.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const { auth, ...publicData } = parsed;
        // Ensure structure completeness & deep merge personal
        return {
          ...DEFAULT_PORTFOLIO_DATA,
          ...publicData,
          personal: {
            ...DEFAULT_PORTFOLIO_DATA.personal,
            ...(publicData.personal || {})
          }
        };
      }
    } catch (e) {
      console.warn("Error reading localStorage, using defaults", e);
    }
    return DEFAULT_PORTFOLIO_DATA;
  }

  static async syncFromSource() {
    try {
      const res = await fetch("/api/portfolio", { cache: "no-store" });
      if (res.ok) {
        const cloudData = await res.json();
        if (cloudData && cloudData.personal) {
          PortfolioStore.saveData(cloudData);
          window.dispatchEvent(new CustomEvent("portfolioDataUpdated", { detail: cloudData }));
          return cloudData;
        }
      }
    } catch (e) {
      // Static-only previews can still load the checked-in portfolio data.
    }

    try {
      const res = await fetch("assets/data/portfolio_data.json?t=" + Date.now());
      if (res.ok) {
        const staticData = await res.json();
        if (staticData && staticData.personal) {
          PortfolioStore.saveData(staticData);
          return staticData;
        }
      }
    } catch (e) {
      // Offline previews use the bundled defaults.
    }
    return PortfolioStore.getData();
  }

  static async saveGlobalData(data) {
    const publicData = { ...data };
    delete publicData.auth;
    const response = await fetch("/api/portfolio", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(publicData)
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(result.error || "The portfolio could not be saved.");
    }
    PortfolioStore.saveData(publicData);
    return result;
  }

  static saveData(data) {
    try {
      const publicData = { ...data };
      delete publicData.auth;
      localStorage.setItem(PortfolioStore.STORAGE_KEY, JSON.stringify(publicData));
      window.dispatchEvent(new CustomEvent("portfolioDataUpdated", { detail: publicData }));
      return true;
    } catch (e) {
      console.error("Error saving data", e);
      return false;
    }
  }

  static async verifyAuth(email, password) {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    if (response.status === 401) return false;
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      throw new Error(result.error || "The admin service is unavailable.");
    }
    return true;
  }

  static async logout() {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "same-origin"
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      throw new Error(result.error || "Could not end the admin session.");
    }
  }
}

// Attach globally for accessibility across scripts
window.DEFAULT_PORTFOLIO_DATA = DEFAULT_PORTFOLIO_DATA;
window.PortfolioStore = PortfolioStore;
