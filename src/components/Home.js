import React, { useState, useEffect, useRef } from "react";
import "./Home.css";

function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef(null);
  const missionRef = useRef(null);
  const futureRef = useRef(null);
  const insightsRef = useRef(null);

  useEffect(() => {
    // Apply theme to body
    document.body.className = isDarkMode ? 'dark-theme' : 'light-theme';
  }, [isDarkMode]);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={isDarkMode ? 'dark-theme' : 'light-theme'}>
      {/* Hero Section */}
      <section ref={heroRef} className="hero-section" id="hero">
        <div className="hero-content">
          <h1 className="styled-title">
            MULTI-PROPERTY AI PLATFORM FOR <span>MATERIALS DISCOVERY</span>
          </h1>
          <p className="hero-subtitle">
            Accelerating innovation through intelligent material design and discovery
          </p>
        </div>
        <div className="scroll-indicator">
          <div className="scroll-arrow"></div>
        </div>
      </section>

      {/* Mission Section */}
      <section ref={missionRef} className="mission-section" id="mission">
        <div className="mission-wrapper">
          <div className={`vertical-line ${scrollY > 200 ? 'animate' : ''}`}></div>
          <div className="mission-content">
            <h2>Our Mission</h2>
            <p className="section-subtitle">Accelerating discovery with multi-property AI for real-world impact</p>
            <p>
              Our mission is to accelerate innovation in materials science using advanced
              AI technologies. We aim to unlock new materials with breakthrough performance
              across industries such as energy, aerospace, electronics, and sustainability.
            </p>
          </div>
        </div>
      </section>

      {/* Future of Materials Section */}
      <section ref={futureRef} className="future-section" id="future">
        <div className="future-wrapper">
          <div className={`split-line ${scrollY > 600 ? 'animate' : ''}`}>
            <div className="line-thin"></div>
            <div className="line-bold"></div>
          </div>

          <div className="future-content">
            <h2>The Future of Materials</h2>
            <p>Discover the next generation of intelligent materials that will transform industries and shape tomorrow's innovations</p>

            <div className="future-block">
              <h3>Sustainability</h3>
              <p>
                Sustainable materials play a critical role in reducing environmental impact 
                while enabling innovation across industries. The future relies on smarter, 
                cleaner, and more efficient material design.
              </p>
            </div>

            <div className="materials-list">
              <div className="material-item">
                <div className="material-icon">⚗️</div>
                <h4>Alloys</h4>
                <p>High-performance mixtures engineered for strength, flexibility, and durability.</p>
              </div>
              <div className="material-item">
                <div className="material-icon">🔬</div>
                <h4>Polymers</h4>
                <p>Advanced plastics and composites tailored for lightweight applications.</p>
              </div>
              <div className="material-item">
                <div className="material-icon">⚡</div>
                <h4>Metals</h4>
                <p>Core industrial materials evolving through AI-driven discovery and design.</p>
              </div>
              <div className="material-item">
                <div className="material-icon">🌱</div>
                <h4>Biologics</h4>
                <p>Bio-based materials inspired by nature for medical and ecological applications.</p>
              </div>
              <div className="material-item">
                <div className="material-icon">🚀</div>
                <h4>Smart Materials</h4>
                <p>Expanding possibilities in smart, hybrid, and multi-functional materials.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Image Row at Bottom */}
        <div className="future-images">
          <img src={require("../assets/brass.jpg")} alt="Material 1" />
          <img src={require("../assets/chem elem.jpeg")} alt="Material 2" />
          <img src={require("../assets/metal-alloys.webp")} alt="Material 3" />
          <img src={require("../assets/copper.jpeg")} alt="Material 4" />
        </div>
      </section>

      {/* Project Features Section */}
      <section ref={insightsRef} className="insights-section" id="features">
        <div className="insights-wrapper">
          <div className="section-header">
            <h2>Project Features</h2>
            <p>Experience an interactive platform, AI recommendations, and multi-property trade-offs</p>
          </div>

          {/* Project Feature 1 – Interactive Web App */}
          <div className="insight-item">
            <div className="insight-image">
              <img src={require("../assets/chem elem.jpeg")} alt="Interactive Web App" />
            </div>
            <div className="insight-text">
              <h3>Interactive Web Application</h3>
              <p>
                Our cutting-edge interactive web application provides an intuitive platform for materials 
                scientists and engineers to explore, analyze, and discover new materials. The application 
                features real-time visualization tools, interactive property charts, and dynamic material 
                databases that allow users to filter, compare, and analyze materials based on multiple 
                criteria. With responsive design and advanced user interface components, researchers can 
                seamlessly navigate through complex material data, perform virtual experiments, and 
                collaborate with teams worldwide. The platform integrates machine learning algorithms 
                to provide instant insights and recommendations, making materials discovery more 
                accessible and efficient than ever before.
              </p>
            </div>
          </div>

          {/* Project Feature 2 – AI Recommendation System */}
          <div className="insight-item reverse">
            <div className="insight-image">
              <img src={require("../assets/brass.jpg")} alt="AI Recommendation System" />
            </div>
            <div className="insight-text">
              <h3>AI-Powered Recommendation System</h3>
              <p>
                Our advanced AI recommendation system leverages deep learning algorithms and neural 
                networks to predict optimal material compositions and properties. The system analyzes 
                vast datasets of material properties, processing conditions, and performance metrics 
                to suggest the best materials for specific applications. It considers multiple factors 
                including mechanical properties, thermal behavior, chemical resistance, and cost 
                optimization. The AI continuously learns from new experimental data and user feedback, 
                improving its accuracy and expanding its knowledge base. This intelligent system 
                dramatically reduces the time and resources required for materials discovery, enabling 
                researchers to focus on innovation rather than trial-and-error experimentation.
              </p>
            </div>
          </div>

          {/* Project Feature 3 – Multi-Property Trade-off Analysis */}
          <div className="insight-item">
            <div className="insight-image">
              <img src={require("../assets/copper.jpeg")} alt="Multi-Property Trade-off" />
            </div>
            <div className="insight-text">
              <h3>Multi-Property Trade-off Analysis</h3>
              <p>
                Our sophisticated multi-property trade-off analysis system enables comprehensive 
                evaluation of material performance across multiple dimensions. The platform provides 
                advanced visualization tools that map the complex relationships between different 
                material properties, helping researchers understand how optimizing one property 
                might affect others. Using Pareto optimization techniques and multi-objective 
                algorithms, the system identifies optimal material compositions that balance 
                competing requirements such as strength vs. weight, conductivity vs. cost, or 
                durability vs. processability. This comprehensive approach ensures that material 
                selections are not only high-performing but also practical for real-world 
                applications, leading to more informed decision-making and better engineering outcomes.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* AI Material Prediction Demo Section */}
      <section className="prediction-section" id="demo">
        <div className="prediction-wrapper">
          <div className="section-header">
            <h2>AI Material Prediction</h2>
            <p>Experience our intelligent material discovery platform</p>
          </div>
          {/* Interactive demo badge removed as requested */}
          
          <div className="prediction-cards">
            {/* Input Card */}
            <div className="prediction-card input-card demo-card">
              <div className="card-header">
                <h3>Material Input</h3>
                <div className="card-icon">🔬</div>
              </div>
              <div className="card-content">
                <div className="prediction-form demo-form">
                  <div className="form-group">
                    <label>Material Type</label>
                    <select disabled>
                      <option>Metal</option>
                      {/* <option></option>
                      <option>Ceramic</option>
                      <option>Composite</option> */}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Properties</label>
                    <div className="property-inputs">
                      <input type="text" placeholder="Energy Per Atom (eV)" disabled />
                      <input type="text" placeholder="Fermi Energy (eV)" disabled />
                      <input type="text" placeholder="Volume " disabled />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Ordering</label>
                    <select disabled>
                      <option>Ferromagnetic</option>
                      {/* <option>Automotive</option>
                      <option>Electronics</option>
                      <option>Medical</option> */}
                    </select>
                  </div>
                  <button type="button" className="predict-btn demo-btn" disabled>
                    <span className="btn-text">Predict Material</span>
                    <span className="demo-overlay">Demo Mode</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="prediction-arrow">
              <div className="arrow-icon">→</div>
              <div className="arrow-pulse"></div>
            </div>

            {/* Output Card */}
            <div className="prediction-card output-card demo-card">
              <div className="card-header">
                <h3>Predicted Results</h3>
                <div className="card-icon">🎯</div>
              </div>
              <div className="card-content">
                <div className="prediction-results">
                  <div className="result-item">
                    <h4>Material Stablization</h4>
                    <div className="composition">
                      <span className="element">AgTe</span>
                      {/* <span className="element">Mg: 10%</span>
                      <span className="element">Si: 5%</span> */}
                    </div>
                  </div>
                  <div className="result-item">
                    <h4>Predicted Properties</h4>
                    <div className="properties">
                      <div className="property">
                        <span className="prop-name">Energy Above Hull</span>
                        <span className="prop-value">0.7 ev</span>
                      </div>
                      <div className="property">
                        <span className="prop-name">Density:</span>
                        <span className="prop-value">2.7 g/cm³</span>
                      </div>
                      <div className="property">
                        <span className="prop-name">Thermal:</span>
                        <span className="prop-value">150 W/m·K</span>
                      </div>
                    </div>
                  </div>
                  <div className="result-item">
                    <h4>AI Results</h4>
                    <div className="confidence">
                      <div className="confidence-bar">
                        <div className="confidence-fill" style={{width: '92%'}}></div>
                      </div>
                      <span className="confidence-text">92%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="demo-footer">
            <p>This is a demonstration of our AI-powered material prediction system</p>
            <button className="contact-btn">Contact Us for Full Access</button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" id="cta">
        <div className="cta-wrapper">
          <div className="cta-content">
            <h2>Ready to Transform Your Material Discovery?</h2>
            <p>Join leading researchers and engineers who are already using our AI platform to accelerate innovation</p>
            <div className="cta-buttons">
              <button className="cta-btn primary">Start Free Trial</button>
              <button className="cta-btn secondary">Schedule Demo</button>
            </div>
          </div>
          <div className="cta-stats">
            <div className="stat-item">
              <div className="stat-number">10,000+</div>
              <div className="stat-label">Materials Analyzed</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">500+</div>
              <div className="stat-label">Research Teams</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">95%</div>
              <div className="stat-label">Accuracy Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ Footer Section */}
      <footer className="footer">
        <div className="footer-container">

          {/* About */}
          <div className="footer-about">
            <h3>About Us</h3>
            <p>
              Our platform leverages AI-driven materials discovery to accelerate innovation 
              across industries. From advanced alloys to bio-inspired materials, we provide 
              cutting-edge insights for a sustainable future.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-links">
            <h3>Quick Links</h3>
            <ul>
              <li><a href="#hero">Home</a></li>
              <li><a href="#mission">Mission</a></li>
              <li><a href="#future">Future</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#demo">Demo</a></li>
              <li><a href="#cta">Get Started</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-contact">
            <h3>Contact</h3>
            <p>Email: info@materialsai.com</p>
            <p>Phone: +91 12345 67890</p>
            <p>Address: 123 Innovation Street, Tech City</p>
          </div>

        </div>

        <div className="footer-bottom">
          <p>© 2025 Materials AI Platform. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
