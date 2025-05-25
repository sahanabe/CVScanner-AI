document.addEventListener("DOMContentLoaded", () => {
  // Dropdown menu hover
  document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("mouseenter", () => {
      const dropdown = link.querySelector(".dropdown");
      if (dropdown) dropdown.style.display = "block";
    });
    link.addEventListener("mouseleave", () => {
      const dropdown = link.querySelector(".dropdown");
      if (dropdown) dropdown.style.display = "none";
    });
  });

  // Highlight clicked feature box
  document.querySelectorAll('.feature-box').forEach(box => {
    box.addEventListener('click', () => {
      document.querySelectorAll('.feature-box').forEach(b => b.classList.remove('active'));
      box.classList.add('active');
    });
  });

  // Logo hover scale effect
  document.querySelectorAll(".logo").forEach(logo => {
    logo.addEventListener("mouseenter", () => {
      logo.style.transform = "scale(1.1)";
    });
    logo.addEventListener("mouseleave", () => {
      logo.style.transform = "scale(1)";
    });
  });

  // Scroll to top button
  const scrollBtn = document.getElementById("back-to-top");
  if (scrollBtn) {
    scrollBtn.style.display = "none";
    window.addEventListener("scroll", () => {
      scrollBtn.style.display = window.scrollY > 300 ? "block" : "none";
    });
    scrollBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Chatbot toggle
  const chatbotToggle = document.getElementById("chatbotToggle");
  const chatbotBox = document.getElementById("chatbotBox");
  const chatbotClose = document.getElementById("chatbotClose");
  const chatForm = document.getElementById("chatForm");
  const chatInput = document.getElementById("chatInput");
  const chatBody = document.getElementById("chatbotBody");

  if (chatbotToggle && chatbotBox && chatbotClose && chatForm && chatInput && chatBody) {
    chatbotToggle.addEventListener("click", () => {
      chatbotBox.style.display = "flex";
      chatbotBox.setAttribute("aria-hidden", "false");
      chatInput.focus();
    });

    chatbotClose.addEventListener("click", () => {
      chatbotBox.style.display = "none";
      chatbotBox.setAttribute("aria-hidden", "true");
      chatbotToggle.focus();
    });

    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const message = chatInput.value.trim();
      if (!message) return;

      const userMsg = document.createElement("p");
      userMsg.textContent = message;
      userMsg.classList.add("user-msg");
      chatBody.appendChild(userMsg);

      chatInput.value = "";
      chatBody.scrollTop = chatBody.scrollHeight;

      setTimeout(() => {
        const botMsg = document.createElement("p");
        botMsg.textContent = "Thank you! We'll get back to you soon.";
        botMsg.classList.add("bot-msg");
        chatBody.appendChild(botMsg);
        chatBody.scrollTop = chatBody.scrollHeight;
      }, 1000);
    });
  }

  console.log("Resume scanner page loaded");
});

// --- AI Network Canvas Animation (Background Nodes) ---
const canvas = document.getElementById('ai-network');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let width, height;
  let nodes = [];
  const NODE_COUNT = 40;
  const MAX_DISTANCE = 120;

  function resize() {
    width = canvas.width = canvas.clientWidth;
    height = canvas.height = canvas.clientHeight;
  }

  function init() {
    resize();
    nodes = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: 3 + Math.random() * 2,
      });
    }
    animate();
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < NODE_COUNT; i++) {
      for (let j = i + 1; j < NODE_COUNT; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DISTANCE) {
          ctx.strokeStyle = `rgba(13, 155, 255, ${1 - dist / MAX_DISTANCE})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    nodes.forEach(node => {
      ctx.beginPath();
      const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.radius);
      gradient.addColorStop(0, '#00bfff');
      gradient.addColorStop(1, 'rgba(0,191,255,0)');
      ctx.fillStyle = gradient;
      ctx.shadowColor = '#00bfff';
      ctx.shadowBlur = 8;
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fill();

      node.x += node.vx;
      node.y += node.vy;

      if (node.x < 0 || node.x > width) node.vx *= -1;
      if (node.y < 0 || node.y > height) node.vy *= -1;
    });

    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', () => {
    resize();
  });

  init();
}

// --- AI Network for Text Background (Optional Second Canvas) ---
const textCanvas = document.getElementById('ai-network-text');
if (textCanvas) {
  const ctx = textCanvas.getContext('2d');
  let width, height;
  let points = [];
  const totalPoints = 35;
  const maxDistance = 120;

  function resizeCanvas() {
    width = textCanvas.clientWidth;
    height = textCanvas.clientHeight;
    textCanvas.width = width;
    textCanvas.height = height;
  }

  function createPoints() {
    points = [];
    for (let i = 0; i < totalPoints; i++) {
      points.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
      });
    }
  }

  function drawNetwork() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < points.length; i++) {
      const p1 = points[i];
      p1.x += p1.vx;
      p1.y += p1.vy;

      if (p1.x < 0 || p1.x > width) p1.vx *= -1;
      if (p1.y < 0 || p1.y > height) p1.vy *= -1;

      ctx.beginPath();
      ctx.arc(p1.x, p1.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = '#00bfff';
      ctx.shadowColor = '#00bfff';
      ctx.shadowBlur = 10;
      ctx.fill();

      for (let j = i + 1; j < points.length; j++) {
        const p2 = points[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDistance) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(0, 191, 255, ${(maxDistance - dist) / maxDistance})`;
          ctx.lineWidth = 1;
          ctx.shadowBlur = 5;
          ctx.shadowColor = '#00bfff';
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(drawNetwork);
  }

  resizeCanvas();
  createPoints();
  drawNetwork();
  window.addEventListener('resize', () => {
    resizeCanvas();
    createPoints();
  });
}

// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    const dropdown = link.querySelector('.dropdown');

    if (dropdown) {
      // Show dropdown on hover
      link.addEventListener('mouseenter', () => {
        dropdown.style.display = 'block';
      });

      // Hide dropdown when mouse leaves nav-link or dropdown
      link.addEventListener('mouseleave', (e) => {
        // Timeout added to allow moving to dropdown
        setTimeout(() => {
          // Check if the mouse is NOT hovering over the dropdown
          if (!dropdown.matches(':hover') && !link.matches(':hover')) {
            dropdown.style.display = 'none';
          }
        }, 100);
      });

      // Also handle leaving dropdown itself
      dropdown.addEventListener('mouseleave', () => {
        dropdown.style.display = 'none';
      });
    }
  });

  // Optional: Add keyboard accessibility
  // e.g., Toggle dropdown on Enter key (for accessibility)
});

document.querySelectorAll('.cvscanner-feature h4').forEach(h4 => {
  h4.addEventListener('click', () => {
    // Toggle active class on the parent .cvscanner-feature
    const feature = h4.parentElement;

    // Optionally, close other active features so only one open at a time
    document.querySelectorAll('.cvscanner-feature.active').forEach(activeFeature => {
      if (activeFeature !== feature) {
        activeFeature.classList.remove('active');
      }
    });

    // Toggle active state of clicked feature
    feature.classList.toggle('active');
  });
});


// Company list with domains (instead of direct image URLs)
const companies = [
  // USA
  {name: "General Electric", domain: "ge.com"},
  {name: "Meta (Facebook)", domain: "fb.com"},
  {name: "Amazon", domain: "amazon.com"},
  {name: "IBM", domain: "ibm.com"},
  {name: "Apple", domain: "apple.com"},

  // Japan
  {name: "Toyota", domain: "toyota.co.jp"},
  {name: "Sony", domain: "sony.com"},
  {name: "Nintendo", domain: "nintendo.co.jp"},
  {name: "Hitachi", domain: "hitachi.com"},

  // China
  {name: "Alibaba", domain: "alibaba.com"},
  {name: "Tencent", domain: "tencent.com"},
  {name: "Baidu", domain: "baidu.com"},
  {name: "Huawei", domain: "huawei.com"}
];

function getRandomCompanies(arr, count) {
  const shuffled = arr.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

const logosWrapper = document.querySelector('.logos-wrapper');
const selectedCompanies = getRandomCompanies(companies, 10); // <-- Changed from 5 to 10

selectedCompanies.forEach(company => {
  const img = document.createElement('img');
  img.src = `https://logo.clearbit.com/${company.domain}`;
  img.alt = company.name;
  img.className = 'logo-item';
  logosWrapper.appendChild(img);
});

window.addEventListener("load", function () {
    if (!localStorage.getItem("policyDecision")) {
      document.getElementById("policy-popup").style.display = "block";
    }

    document.getElementById("accept-policy").addEventListener("click", function () {
      localStorage.setItem("policyDecision", "accepted");
      document.getElementById("policy-popup").style.display = "none";
    });

    document.getElementById("decline-policy").addEventListener("click", function () {
      localStorage.setItem("policyDecision", "declined");
      document.getElementById("policy-popup").style.display = "none";
      // Optional: redirect, limit site features, or show a message
      alert("You have declined the policies. Some features may be limited.");
    });
  });

  
  const toggleBtn = document.getElementById('chatbotToggle');
  const closeBtn = document.getElementById('chatbotClose');
  const chatBox = document.getElementById('chatbotBox');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chatBody = document.getElementById('chatbotBody');

  toggleBtn.addEventListener('click', () => {
    chatBox.style.display = 'flex';
  });

  closeBtn.addEventListener('click', () => {
    chatBox.style.display = 'none';
  });

  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const userMessage = chatInput.value.trim();
    if (userMessage === '') return;

    chatBody.innerHTML += `<p class="user-msg">${userMessage}</p>`;
    chatInput.value = '';

    setTimeout(() => {
      const botReply = getAutoReply(userMessage);
      chatBody.innerHTML += `<p class="bot-msg">${botReply}</p>`;
      chatBody.scrollTop = chatBody.scrollHeight;
    }, 600);
  });

  function getAutoReply(msg) {
    const lowerMsg = msg.toLowerCase();
    if (lowerMsg.includes("hello") || lowerMsg.includes("hi")) return "Hi there! 😊 How can I help you today?";
    if (lowerMsg.includes("visa")) return "Sure! I can help you with visa details. Are you looking for Student, SSW, or Work visa info?";
    if (lowerMsg.includes("classes")) return "We offer Japanese classes for JLPT, NAT, and SSW. Do you want a full course list?";
    return "Great question! Let me connect you with a real person for more help. 🚀";
  }

