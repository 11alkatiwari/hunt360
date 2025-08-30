import React from 'react';
import styled from 'styled-components';

const purple = '#a000c8';
const darkPurple = '#8a00c2';

/* ---------- CONTAINER ---------- */
const AboutUsContainer = styled.div`
  min-height: 100vh;
  padding-top: 0; /* Hero handles spacing */
  background-color: #fff;
  display: flex;
  flex-direction: column;
`;

/* ---------- HERO SECTION ---------- */
const HeroSection = styled.div`
  background: linear-gradient(rgba(160, 0, 200, 0.7), rgba(138, 0, 194, 0.7)),
    url('/mainbg.jpg') center/cover no-repeat;
  color: white;
  text-align: center;
  padding: 4rem 1rem;

  @media (min-width: 768px) {
    padding: 6rem 2rem;
  }
`;

const HeroTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;

  @media (min-width: 768px) {
    font-size: 3rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.2rem;
  margin-top: 1rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

/* ---------- MAIN CONTENT ---------- */
const MainContent = styled.div`
  flex: 1;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 3rem;

  @media (min-width: 768px) {
    padding: 3rem 2rem;
  }

  @media (min-width: 1025px) {
    padding: 4rem;
  }
`;

/* ---------- ABOUT SECTION ---------- */
const AboutSection = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;
  flex-direction: column;

  @media (min-width: 1025px) {
    flex-direction: row;
  }
`;

const AboutText = styled.div`
  flex: 1;
  text-align: center;

  @media (min-width: 1025px) {
    text-align: left;
  }
`;

const Title = styled.h2`
  font-size: 2rem;
  color: ${purple};
  margin-bottom: 1rem;
`;

const MissionText = styled.p`
  font-size: 1.1rem;
  color: #4a5568;
  margin-bottom: 1.5rem;
  line-height: 1.6;
`;

const KeyPoint = styled.div`
  margin-bottom: 1rem;
`;

const KeyPointTitle = styled.h3`
  font-size: 1.2rem;
  color: ${purple};
  margin-bottom: 0.3rem;
`;

const KeyPointText = styled.p`
  font-size: 1rem;
  color: #4a5568;
`;

const AboutImage = styled.div`
  flex: 1;
  background-image: url('/mainbg.jpg');
  background-size: cover;
  background-position: center;
  height: 350px;
  border-radius: 1rem;
`;

/* ---------- CORE VALUES ---------- */
const CoreValuesSection = styled.div`
  text-align: center;
`;

const CoreValuesTitle = styled.h2`
  font-size: 2rem;
  color: ${purple};
  margin-bottom: 2rem;
`;

const CoreValuesList = styled.div`
  display: flex;
  gap: 2rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const CoreValueCard = styled.div`
  width: 200px;
  text-align: center;
  padding: 1.5rem;
  border-radius: 1rem;
  background: #fafafa;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0px 6px 20px rgba(160, 0, 200, 0.2);
  }
`;

const CoreValueIcon = styled.div`
  font-size: 2rem;
  color: ${purple};
  margin-bottom: 0.5rem;
`;

const CoreValueTitle = styled.h3`
  font-size: 1.2rem;
  color: ${purple};
  margin-bottom: 0.5rem;
`;

const CoreValueText = styled.p`
  font-size: 1rem;
  color: #4a5568;
`;

/* ---------- TEAM SECTION ---------- */
const FeaturesSection = styled.div`
  text-align: center;
`;

const FeaturesTitle = styled.h2`
  font-size: 2rem;
  color: ${purple};
  margin-bottom: 2rem;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  justify-items: center;
`;

const FeatureCard = styled.div`
  background: #fafafa;
  border-radius: 1rem;
  padding: 2rem 1.5rem;
  width: 100%;
  max-width: 300px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0px 6px 18px rgba(160, 0, 200, 0.2);
  }
`;

const FeatureIcon = styled.div`
  font-size: 2.5rem;
  color: ${purple};
  margin-bottom: 1rem;
`;

const FeatureTitle = styled.h3`
  font-size: 1.3rem;
  color: ${purple};
  margin-bottom: 0.5rem;
`;

const FeatureText = styled.p`
  font-size: 1rem;
  color: #4a5568;
`;
/* ---------- FOOTER ---------- */
const Footer = styled.footer`
  background-color: #1a202c;
  color: #fff;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const FooterLinks = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const FooterLink = styled.a`
  color: #fff;
  text-decoration: none;
  font-size: 0.9rem;

  &:hover {
    text-decoration: underline;
    color: ${purple};
  }
`;

/* ---------- COMPONENT ---------- */
const AboutUs = () => {
  return (
    <AboutUsContainer>
      {/* HERO */}
      <HeroSection>
        <HeroTitle>Welcome to HR Hunt</HeroTitle>
        <HeroSubtitle>
          Empowering businesses with smart HR solutions to simplify work, engage teams, and boost success.
        </HeroSubtitle>
      </HeroSection>

      {/* MAIN CONTENT */}
      <MainContent>
        {/* ABOUT */}
        <AboutSection>
          <AboutText>
            <Title>About Us</Title>
            <MissionText>
              At HR Hunt, our mission is to simplify HR processes and foster a culture of collaboration and innovation in the workplace.
            </MissionText>
            <KeyPoint>
              <KeyPointTitle>Innovation</KeyPointTitle>
              <KeyPointText>We leverage cutting-edge technology and human-centric design to revolutionize HR.</KeyPointText>
            </KeyPoint>
            <KeyPoint>
              <KeyPointTitle>Customer-Centric</KeyPointTitle>
              <KeyPointText>Delivering tailored solutions that empower our clients and enhance engagement.</KeyPointText>
            </KeyPoint>
          </AboutText>
          <AboutImage />
        </AboutSection>

        {/* CORE VALUES */}
        <CoreValuesSection>
          <CoreValuesTitle>Our Core Values</CoreValuesTitle>
          <CoreValuesList>
            <CoreValueCard>
              <CoreValueIcon>🤝</CoreValueIcon>
              <CoreValueTitle>Commitment</CoreValueTitle>
              <CoreValueText>Dedicated to providing exceptional service & support.</CoreValueText>
            </CoreValueCard>
            <CoreValueCard>
              <CoreValueIcon>💡</CoreValueIcon>
              <CoreValueTitle>Innovation</CoreValueTitle>
              <CoreValueText>We embrace creativity to drive better HR solutions.</CoreValueText>
            </CoreValueCard>
          </CoreValuesList>
        </CoreValuesSection>

        {/* TEAM */}
       <FeaturesSection>
  <FeaturesTitle>Why Choose Hunt?</FeaturesTitle>
  <FeaturesGrid>
    <FeatureCard>
      <FeatureIcon>⚡</FeatureIcon>
      <FeatureTitle>Efficiency</FeatureTitle>
      <FeatureText>
        Automate and streamline your HR tasks to save valuable time.
      </FeatureText>
    </FeatureCard>
    <FeatureCard>
      <FeatureIcon>🔒</FeatureIcon>
      <FeatureTitle>Security</FeatureTitle>
      <FeatureText>
        Protect sensitive data with enterprise-grade security protocols.
      </FeatureText>
    </FeatureCard>
    <FeatureCard>
      <FeatureIcon>📊</FeatureIcon>
      <FeatureTitle>Insights</FeatureTitle>
      <FeatureText>
        Gain actionable analytics to make smarter workforce decisions.
      </FeatureText>
    </FeatureCard>
    <FeatureCard>
      <FeatureIcon>🌍</FeatureIcon>
      <FeatureTitle>Scalability</FeatureTitle>
      <FeatureText>
        Built to grow with your business, no matter the size.
      </FeatureText>
    </FeatureCard>
  </FeaturesGrid>
</FeaturesSection>
      </MainContent>

      {/* FOOTER */}
      <Footer>
        <FooterLinks>
          <FooterLink href="/pricing">Pricing</FooterLink>
          <FooterLink href="/about">About Us</FooterLink>
          <FooterLink href="/contact">Contact</FooterLink>
        </FooterLinks>
        <p>© 2025 HR Hunt Inc. All rights reserved.</p>
      </Footer>
    </AboutUsContainer>
  );
};

export default AboutUs;
