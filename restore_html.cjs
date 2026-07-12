const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Find the broken region — everything from the dropdown style block to the services div
// We'll replace everything between the auth-buttons div closing and the services div
const brokenStart = '<div class="auth-buttons" style="margin-left: 1rem;">';
const goodAnchor = '<!-- Service 1 -->';

const startIdx = html.indexOf(brokenStart);
const endIdx = html.indexOf(goodAnchor);

if (startIdx === -1 || endIdx === -1) {
  console.error('Anchors not found!', { startIdx, endIdx });
  process.exit(1);
}

const before = html.substring(0, startIdx);
const after = html.substring(endIdx);

const restored = `<div class="auth-buttons" style="margin-left: 1rem;">
  <!-- Login & Signup (shown if not logged in) -->
  <a href="login.html" class="btn btn-primary" id="loginBtn">Login</a>
  <a href="signup.html" class="btn btn-outline-primary" id="signupBtn">Signup</a>

  <!-- User menu (shown if logged in) -->
  <div class="user-menu" id="userMenu" style="display:none; position: relative;">
    <button class="user-button" id="userButton" style="
      background: var(--accent); 
      border-radius: 50%; 
      width: 40px; 
      height: 40px; 
      color: #fff; 
      font-weight: bold;
      border: none;
      cursor: pointer;
    "></button>

    <ul class="dropdown" id="dropdown" style="
      display:none;
      position: absolute;
      top: 50px;
      right: 0;
      background: #fff;
      list-style: none;
      padding: 10px;
      border-radius: 8px;
      min-width: 200px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
      color: #000;
    ">
      <li id="userDetails" style="padding: 16px 20px; border-bottom: 1px solid #f0f0f0; background: #fafafa;">
        <strong id="profileName" style="font-size: 1rem; color: #111;">Name</strong><br>
        <span id="profileEmail" style="font-size: 0.85rem; color: #666; word-break: break-all;">Email</span>
      </li>
      <li style="border-bottom: 1px solid #f0f0f0;">
        <a href="profile.html" style="display:flex;align-items:center;padding:14px 20px;color:var(--dark);text-decoration:none;font-size:0.95rem;">
          <i class="fas fa-user-cog" style="margin-right: 12px; color: var(--accent); width: 16px; text-align: center; font-size: 1.1rem;"></i>
          Profile &amp; Enquiries
        </a>
      </li>
      <li>
        <div id="logoutBtn" style="display:flex;align-items:center;padding:14px 20px;cursor:pointer;color:#dc3545;font-size:0.95rem;" onmouseover="this.style.background='#fff5f5'" onmouseout="this.style.background='transparent'">
          <i class="fas fa-sign-out-alt" style="margin-right: 12px; width: 16px; text-align: center; font-size: 1.1rem;"></i>
          Logout
        </div>
      </li>
    </ul>
  </div>
</div>

            </ul>
        </nav>
    </header>

  <section id="home" class="home">
    <canvas id="particle-canvas"></canvas>
    <div class="hero-content">
      <p class="hero-eyebrow">&#x1F680; ENTERPRISE IT SOLUTIONS</p>
      <h1 class="hero-title">Bring your Business<br><span id="typed-text" class="typed-accent"></span><span class="typed-cursor">|</span></h1>
      <h2 class="hero-subtitle">Powering growth with cutting-edge technology &amp; 24/7 IT support.</h2>
      <div class="hero-cta-group">
        <a href="#service" class="hero-btn-primary">Explore Services</a>
        <a href="#contact" class="hero-btn-secondary">Get In Touch</a>
      </div>
    </div>
  </section>

  <section id="about" class="about reveal-section">
  <div class="container">
    <div class="row align-items-center">
      <div class="col-lg-6 col-md-12">
        <img src="./images/about_us.jpeg" alt="About Us" class="about-img">
      </div>
      <div class="col-lg-6 col-md-12 content">
        <h1 class="heading">About Us</h1>
        <h3>Empowering Your Brand with Cutting-Edge IT Solutions</h3>
        <p>We are a dedicated team of IT professionals committed to providing <strong>end-to-end services</strong> for your business. From web development to digital solutions, we ensure your brand thrives in the digital world.</p>
        <p>With our expertise combined, you gain a team capable of transforming ideas into impactful solutions that elevate your business.</p>
      </div>
    </div>
  </div>
</section>

  <div class="pt-5 pb-5 reveal-section" style="background-color: var(--bg-light);">
    <div class="container">
      <div class="row">
        <div class="section-head col-sm-12" id="service">
          <h1>Our Services</h1>
          <p>We help you to build high-quality digital solutions and products as well as deliver a wide range of related professional services. We are providing world-class service to our clients.</p>
        </div>
        <div class="row">
        `;

fs.writeFileSync('index.html', before + restored + after);
console.log('HTML restored successfully!');
